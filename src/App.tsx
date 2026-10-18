import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/Toast';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { RoadmapPage } from './pages/RoadmapPage';
import { StudyModulePage } from './pages/StudyModulePage';
import { QuizPage } from './pages/QuizPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { DevEnginePage } from './pages/DevEnginePage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthModal } from './pages/AuthModal';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'dashboard';
  });
  const [currentConceptId, setCurrentConceptId] = useState<string>('what-is-a-stock');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const navigateToTab = (tab: string, pushHistory = true) => {
    setActiveTab(tab);
    if (pushHistory) {
      window.history.pushState({ tab }, '', '#' + tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const initialTab = window.location.hash.replace('#', '') || 'dashboard';
    window.history.replaceState({ tab: initialTab }, '', '#' + initialTab);

    const handlePopState = (event: PopStateEvent) => {
      const targetTab = event.state?.tab || window.location.hash.replace('#', '') || 'dashboard';
      setActiveTab(targetTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectConcept = (conceptId: string) => {
    setCurrentConceptId(conceptId);
    navigateToTab('module');
  };

  const handleStartQuiz = (conceptId: string) => {
    setCurrentConceptId(conceptId);
    navigateToTab('quiz');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans flex flex-col justify-between">
      <div>
        {activeTab !== 'landing' && (
          <Navbar
            activeTab={activeTab}
            setActiveTab={tab => navigateToTab(tab)}
            openAuthModal={() => setIsAuthOpen(true)}
          />
        )}

        <main className="w-full px-6 lg:px-8 pt-3">
          {activeTab === 'landing' && (
            <LandingPage onStart={() => navigateToTab('dashboard')} />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              onSelectConcept={handleSelectConcept}
              onNavigate={tab => navigateToTab(tab)}
            />
          )}

          {activeTab === 'roadmap' && (
            <RoadmapPage onSelectConcept={handleSelectConcept} />
          )}

          {activeTab === 'module' && (
            <StudyModulePage
              conceptId={currentConceptId}
              onBackToRoadmap={() => navigateToTab('roadmap')}
              onStartQuiz={handleStartQuiz}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizPage
              conceptId={currentConceptId}
              onBackToModule={() => navigateToTab('module')}
              onGoToRoadmap={() => navigateToTab('roadmap')}
              onGoToSimulator={() => navigateToTab('simulator')}

              />
          )}

          {activeTab === 'simulator' && (
            <SimulatorPage />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardPage />
          )}

          {activeTab === 'dev-engine' && (
            <DevEnginePage />
          )}

          {activeTab === 'profile' && (
            <ProfilePage />
          )}
        </main>
      </div>
      
      <footer className="w-full bg-brand-black border-t border-brand-card py-4 mt-8">
        <div className="w-full px-6 lg:px-8">
          <p className="text-brand-muted text-xs text-center leading-relaxed">
            TradeWise is an educational simulation platform. All content is for learning purposes only and does not constitute financial advice. Paper trading results do not reflect real market outcomes. Please consult a SEBI registered financial advisor before making any real investment decisions.
          </p>
        </div>
      </footer>

      <ToastContainer />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
