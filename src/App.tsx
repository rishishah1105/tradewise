import React, { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentConceptId, setCurrentConceptId] = useState<string>('what-is-a-stock');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleSelectConcept = (conceptId: string) => {
    setCurrentConceptId(conceptId);
    setActiveTab('module');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartQuiz = (conceptId: string) => {
    setCurrentConceptId(conceptId);
    setActiveTab('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans flex flex-col justify-between">
      <div>
        {activeTab !== 'landing' && (
          <Navbar
            activeTab={activeTab}
            setActiveTab={tab => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            openAuthModal={() => setIsAuthOpen(true)}
          />
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {activeTab === 'landing' && (
            <LandingPage onStart={() => setActiveTab('dashboard')} />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              onSelectConcept={handleSelectConcept}
              onNavigate={tab => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {activeTab === 'roadmap' && (
            <RoadmapPage onSelectConcept={handleSelectConcept} />
          )}

          {activeTab === 'module' && (
            <StudyModulePage
              conceptId={currentConceptId}
              onBackToRoadmap={() => setActiveTab('roadmap')}
              onStartQuiz={handleStartQuiz}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizPage
              conceptId={currentConceptId}
              onBackToModule={() => setActiveTab('module')}
              onGoToRoadmap={() => setActiveTab('roadmap')}
              onGoToSimulator={() => setActiveTab('simulator')}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
