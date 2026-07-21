import socket
import ssl
import ipaddress
from datetime import datetime
from urllib.parse import urlparse
from typing import Dict, Any, List

class CertService:
    
    @staticmethod
    def clean_hostname(url_or_host: str) -> str:
        """Cleans input to extract a pure hostname."""
        url_or_host = url_or_host.strip()
        if not url_or_host.startswith(("http://", "https://")):
            # Prepend protocol to let urlparse parse it properly
            url_or_host = "https://" + url_or_host
            
        try:
            parsed = urlparse(url_or_host)
            hostname = parsed.hostname
            return hostname if hostname else url_or_host
        except Exception:
            return url_or_host

    @staticmethod
    def is_safe_public_host(hostname: str) -> tuple[bool, str]:
        """
        Validates hostname against IP resolution to prevent Server-Side Request Forgery (SSRF).
        Blocks loopback, private, link-local, multicast, and cloud metadata addresses.
        """
        if not hostname:
            return False, "Invalid or empty hostname."
            
        lower_host = hostname.lower()
        if lower_host in ("localhost", "127.0.0.1", "0.0.0.0", "::1", "169.254.169.254"):
            return False, f"Access to restricted or local host '{hostname}' is prohibited (SSRF Protection)."

        try:
            addr_info = socket.getaddrinfo(hostname, 443, socket.AF_UNSPEC, socket.SOCK_STREAM)
            if not addr_info:
                return False, f"Unable to resolve IP address for '{hostname}'."
                
            for family, socktype, proto, canonname, sockaddr in addr_info:
                ip_str = sockaddr[0]
                ip = ipaddress.ip_address(ip_str)
                
                if (
                    ip.is_private
                    or ip.is_loopback
                    or ip.is_link_local
                    or ip.is_multicast
                    or ip.is_reserved
                    or ip.is_unspecified
                    or str(ip) == "169.254.169.254"
                ):
                    return False, f"Access to restricted or internal IP address '{ip_str}' is prohibited (SSRF Protection)."
                    
            return True, ""
        except socket.gaierror:
            return False, f"DNS Lookup failed for hostname '{hostname}'."
        except Exception as e:
            return False, f"Hostname security validation error: {str(e)}"

    @staticmethod
    def analyze_certificate(url_or_host: str) -> Dict[str, Any]:
        """Fetches and analyzes the TLS/SSL certificate for the given domain."""
        hostname = CertService.clean_hostname(url_or_host)
        
        # SSRF Security Check prior to socket connection
        is_safe, error_msg = CertService.is_safe_public_host(hostname)
        if not is_safe:
            return {
                "success": False,
                "error": error_msg
            }
        
        context = ssl.create_default_context()
        # Set short timeout
        socket.setdefaulttimeout(5.0)
        
        try:
            with socket.create_connection((hostname, 443)) as sock:
                with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                    cert = ssock.getpeercert()
                    cipher = ssock.cipher()
                    shared_ciphers = ssock.shared_ciphers()
                    version = ssock.version()
                    
                    if not cert:
                        raise ValueError("Failed to retrieve SSL/TLS certificate details.")
                        
                    # Parse Certificate fields
                    subject = dict(x[0] for x in cert.get("subject", []))
                    issuer = dict(x[0] for x in cert.get("issuer", []))
                    
                    subject_cn = subject.get("commonName", "Unknown")
                    issuer_cn = issuer.get("commonName", "Unknown")
                    issuer_org = issuer.get("organizationName", "Unknown")
                    
                    # Dates (format e.g., 'Oct 14 17:34:55 2026 GMT')
                    not_before_str = cert.get("notBefore")
                    not_after_str = cert.get("notAfter")
                    
                    not_before = datetime.strptime(not_before_str, "%b %d %H:%M:%S %Y %Z") if not_before_str else None
                    not_after = datetime.strptime(not_after_str, "%b %d %H:%M:%S %Y %Z") if not_after_str else None
                    
                    now = datetime.utcnow()
                    is_valid = True
                    if not_before and now < not_before:
                        is_valid = False
                    if not_after and now > not_after:
                        is_valid = False
                        
                    days_remaining = (not_after - now).days if not_after else 0
                    
                    # SANs
                    sans = [item[1] for item in cert.get("subjectAltName", [])]
                    
                    return {
                        "success": True,
                        "domain": hostname,
                        "subject_cn": subject_cn,
                        "issuer_cn": issuer_cn,
                        "issuer_org": issuer_org,
                        "not_before": not_before.isoformat() if not_before else None,
                        "not_after": not_after.isoformat() if not_after else None,
                        "is_valid": is_valid,
                        "days_remaining": days_remaining,
                        "version": cert.get("version", 3),
                        "serial_number": cert.get("serialNumber", "Unknown"),
                        "subject_alt_names": sans,
                        "tls_version": version,
                        "cipher_suite": cipher[0] if cipher else "Unknown",
                        "cipher_bits": cipher[2] if cipher else 0,
                    }
                    
        except socket.gaierror:
            return {
                "success": False,
                "error": f"DNS Lookup failed for hostname '{hostname}'. Make sure it's correct."
            }
        except socket.timeout:
            return {
                "success": False,
                "error": f"Connection timed out while trying to connect to '{hostname}' on port 443."
            }
        except ssl.SSLError as ssl_err:
            return {
                "success": False,
                "error": f"SSL Handshake failed for '{hostname}': {ssl_err.reason if hasattr(ssl_err, 'reason') else str(ssl_err)}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to connect or retrieve certificate: {str(e)}"
            }
