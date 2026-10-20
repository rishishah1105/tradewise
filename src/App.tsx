import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/Toast';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { RoadmapPage } from './pages/RoadmapPage';
import { StudyModulePage } from './pages/StudyModulePage';
import { QuizPage } from './pages/QuizPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthModal } from './pages/AuthModal';
import { Footer } from './components/Footer';
import { AboutPage } from './pages/info/AboutPage';
import { ContactPage } from './pages/info/ContactPage';
import { PrivacyPolicyPage } from './pages/info/PrivacyPolicyPage';
import { TermsPage } from './pages/info/TermsPage';
import { DisclaimerPage } from './pages/info/DisclaimerPage';

const VALID_TABS = [
  'landing',
  'dashboard',
  'roadmap',
  'module',
  'quiz',
  'simulator',
  'leaderboard',
  'profile',
  'about',
  'contact',
  'privacy',
  'terms',
  'disclaimer',
] as const;

const PROTECTED_TABS = new Set(['dashboard', 'roadmap', 'module', 'quiz', 'simulator', 'leaderboard', 'profile']);

const sanitizeTab = (t: string, loggedIn: boolean) => {
  const clean = t.split('?')[0];
  if ((VALID_TABS as readonly string[]).includes(clean)) {
    return clean;
  }
  return loggedIn ? 'dashboard' : 'landing';
};

const MainContent: React.FC = () => {
  const { isLoggedIn, isAuthLoading } = useApp();
  const [activeTab, setActiveTab] = useState<string>(() => {
    const raw = window.location.hash.replace('#', '');
    const clean = raw.split('?')[0];
    if ((VALID_TABS as readonly string[]).includes(clean)) {
      return clean;
    }
    // Default to public landing page for new visitors
    return 'landing';
  });

  const [currentConceptId, setCurrentConceptId] = useState<string>('what-is-a-stock');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [intendedDestination, setIntendedDestination] = useState<string>('dashboard');

  const navigateToTab = (tab: string, pushHistory = true) => {
    const cleanTab = sanitizeTab(tab, isLoggedIn);

    // Route Protection: Prevent unauthorized access to private trading views
    if (!isLoggedIn && !isAuthLoading && PROTECTED_TABS.has(cleanTab)) {
      setIntendedDestination(cleanTab);
      setIsAuthOpen(true);
      return;
    }

    setActiveTab(cleanTab);
    if (pushHistory) {
      window.history.pushState({ tab: cleanTab }, '', '#' + cleanTab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Synchronize route on popstate and hash change
  useEffect(() => {
    const raw = window.location.hash.replace('#', '');
    const clean = sanitizeTab(raw, isLoggedIn);
    window.history.replaceState({ tab: clean }, '', '#' + clean);

    const handlePopState = (event: PopStateEvent) => {
      const rawTab = event.state?.tab || window.location.hash.replace('#', '');
      const targetTab = sanitizeTab(rawTab, isLoggedIn);
      setActiveTab(targetTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isLoggedIn]);

  // Route guard: if user is not logged in and on a protected route, preserve destination and redirect
  useEffect(() => {
    if (isAuthLoading) return;

    if (!isLoggedIn && PROTECTED_TABS.has(activeTab)) {
      setIntendedDestination(activeTab);
      setActiveTab('landing');
      setIsAuthOpen(true);
    }
  }, [activeTab, isLoggedIn, isAuthLoading]);

  const handleSelectConcept = (conceptId: string) => {
    setCurrentConceptId(conceptId);
    navigateToTab('module');
  };

  const handleStartQuiz = (conceptId: string) => {
    setCurrentConceptId(conceptId);
    navigateToTab('quiz');
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-sans flex flex-col">
      <div className="flex-1 flex flex-col w-full">
        {/* Unified, adaptive Header Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={tab => navigateToTab(tab)}
          openAuthModal={() => {
            setIntendedDestination('dashboard');
            setIsAuthOpen(true);
          }}
        />

        <main className={`flex-1 w-full ${activeTab === 'landing' ? 'p-0' : 'px-4 sm:px-6 lg:px-8 pt-3 pb-2'}`}>
          {isAuthLoading && activeTab !== 'landing' ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
              <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-brand-muted">Loading your TradeWise progress...</p>
            </div>
          ) : (
            <>
              {activeTab === 'landing' && (
                <LandingPage
                  onStart={() => {
                    if (isLoggedIn) {
                      navigateToTab('dashboard');
                    } else {
                      setIntendedDestination('dashboard');
                      setIsAuthOpen(true);
                    }
                  }}
                  onOpenAuth={() => {
                    setIntendedDestination('dashboard');
                    setIsAuthOpen(true);
                  }}
                  onNavigate={tab => navigateToTab(tab)}
                />
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

          {activeTab === 'profile' && (
            <ProfilePage />
          )}

          {activeTab === 'about' && (
            <AboutPage onNavigate={tab => navigateToTab(tab)} />
          )}

          {activeTab === 'contact' && (
            <ContactPage />
          )}

          {activeTab === 'privacy' && (
            <PrivacyPolicyPage />
          )}

          {activeTab === 'terms' && (
            <TermsPage />
          )}

          {activeTab === 'disclaimer' && (
            <DisclaimerPage />
          )}
            </>
          )}
        </main>
      </div>

      {activeTab !== 'landing' && (
        <Footer onNavigate={tab => navigateToTab(tab)} />
      )}

      <ToastContainer />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        destination={intendedDestination}
        onSuccess={() => {
          navigateToTab(intendedDestination || 'dashboard');
        }}
      />
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
