import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CryptoJourneyDrawer from './components/CryptoJourneyDrawer';
import ProgressToastContainer from './components/ProgressToastContainer';
import { OnboardingModal } from './components/OnboardingModal';
import { BeginnerGuideModal } from './components/BeginnerGuideModal';
import { ProgressProvider } from './context/ProgressContext';

// Pages
import Home from './pages/Home';
import Labs from './pages/Labs';
import HashingLab from './pages/HashingLab';
import PasswordLab from './pages/PasswordLab';
import SymmetricLab from './pages/SymmetricLab';
import AsymmetricLab from './pages/AsymmetricLab';
import SignatureLab from './pages/SignatureLab';
import CertificateLab from './pages/CertificateLab';
import Explorer from './pages/Explorer';
import Challenges from './pages/Challenges';
import DocPage from './pages/DocPage';
import About from './pages/About';

const App: React.FC = () => {
  return (
    <ProgressProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-cyber-bg text-gray-300 relative">
          {/* Glow Effects */}
          <div className="absolute top-0 left-0 right-0 h-[500px] glow-overlay-cyan pointer-events-none z-0" />
          <div className="absolute top-[400px] right-0 w-[500px] h-[500px] glow-overlay-purple pointer-events-none z-0" />

          <Navbar />
          <CryptoJourneyDrawer />
          <ProgressToastContainer />
          <OnboardingModal />
          <BeginnerGuideModal />

          <main className="flex-grow z-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/labs" element={<Labs />} />
              <Route path="/labs/hashing" element={<HashingLab />} />
              <Route path="/labs/passwords" element={<PasswordLab />} />
              <Route path="/labs/symmetric" element={<SymmetricLab />} />
              <Route path="/labs/asymmetric" element={<AsymmetricLab />} />
              <Route path="/labs/signatures" element={<SignatureLab />} />
              <Route path="/labs/certificates" element={<CertificateLab />} />
              <Route path="/explorer" element={<Explorer />} />
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/docs" element={<DocPage />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </ProgressProvider>
  );
};

export default App;
