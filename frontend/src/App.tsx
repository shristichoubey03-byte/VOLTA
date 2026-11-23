import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { OverviewPage } from './pages/OverviewPage';
import { ConsumersPage } from './pages/ConsumersPage';
import { ForecastingPage } from './pages/ForecastingPage';
import { AnomalyPage } from './pages/AnomalyPage';
import { WeatherPage } from './pages/WeatherPage';
import { ModelPerformancePage } from './pages/ModelPerformancePage';
import { DatasetPage } from './pages/DatasetPage';
import { ReportsPage } from './pages/ReportsPage';
import { AboutPage } from './pages/AboutPage';
import { PageType, DashboardSummary } from './types';
import { fetchDashboardSummary } from './services/api';
import { Menu, X, Zap } from 'lucide-react';

export const App: React.FC = () => {
  const getPageFromHash = (): PageType => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    const validPages: PageType[] = ['overview', 'consumers', 'forecasting', 'anomalies', 'weather', 'models', 'dataset', 'reports', 'about'];
    if (hash === 'description' || hash === 'about') return 'about';
    if (validPages.includes(hash as PageType)) return hash as PageType;
    return 'overview';
  };

  const [activePage, setActivePage] = useState<PageType>(getPageFromHash);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadSummary = () => {
    setRefreshing(true);
    fetchDashboardSummary()
      .then((data) => {
        setDashboardData(data);
      })
      .catch((err) => {
        console.error('Failed to load dashboard summary:', err);
      })
      .finally(() => {
        setLoadingSummary(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadSummary();
    const onHashChange = () => {
      setActivePage(getPageFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleNavigate = (page: PageType) => {
    setActivePage(page);
    window.location.hash = page;
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0b1120] flex flex-col md:flex-row antialiased text-slate-100 font-sans">
      {/* Mobile Top Bar Navigation Toggle */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#070b14] text-white border-b border-slate-800/80 sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-base tracking-wide">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-xs">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <span className="text-white font-extrabold tracking-wider">VOLTA</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar for Desktop */}
      <div className="hidden md:block shrink-0">
        <Sidebar
          activePage={activePage}
          setActivePage={handleNavigate}
          anomalyCount={dashboardData?.kpis.active_anomalies_count}
        />
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 md:hidden flex backdrop-blur-xs">
          <div className="w-64 bg-[#070b14] h-full shadow-2xl">
            <Sidebar
              activePage={activePage}
              setActivePage={handleNavigate}
              anomalyCount={dashboardData?.kpis.active_anomalies_count}
            />
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0b1120]">
        <Topbar onRefresh={loadSummary} isRefreshing={refreshing} />

        <main className="flex-1 pb-16">
          {activePage === 'overview' && (
            <OverviewPage
              data={dashboardData}
              loading={loadingSummary}
              onNavigate={handleNavigate}
            />
          )}

          {activePage === 'consumers' && <ConsumersPage />}

          {activePage === 'forecasting' && <ForecastingPage />}

          {activePage === 'anomalies' && <AnomalyPage />}

          {activePage === 'weather' && <WeatherPage />}

          {activePage === 'models' && <ModelPerformancePage />}

          {activePage === 'dataset' && <DatasetPage />}

          {activePage === 'reports' && <ReportsPage />}

          {activePage === 'about' && <AboutPage />}
        </main>
      </div>
    </div>
  );
};

export default App;
