import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FinanceProvider, useFinance } from './contexts/FinanceContext';
import { Navbar } from './components/Layout/Navbar';
import { FinanceDashboard } from './components/Finance/FinanceDashboard';
import { FinanceFormModal } from './components/Finance/FinanceFormModal';
import { AuthModal } from './components/Auth/AuthModal';
import { UserSettingsModal } from './components/Settings/UserSettingsModal';
import { AdminPanelModal } from './components/Admin/AdminPanelModal';
import { AboutMissionModal } from './components/About/AboutMissionModal';
import { ContributeModal } from './components/Contribute/ContributeModal';
import { PaywallBanner } from './components/Subscription/PaywallBanner';
import { PendingApprovalView } from './components/Auth/PendingApprovalView';
import { InstallAppPopup } from './components/Layout/InstallAppPopup';
import { exportToCSV, printReport } from './utils/exportData';
import { FutureForecastTab } from './components/FutureForecast/FutureForecastTab';
import { Wallet, TrendingUp } from 'lucide-react';

const MainApp = () => {
  const { user, isApproved } = useAuth();
  const { records } = useFinance();

  const [activeMainTab, setActiveMainTab] = useState('dashboard'); // 'dashboard' | 'forecast'
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [authInitialEmail, setAuthInitialEmail] = useState('');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);

  // Pop-up automático de contribuição: aparece UMA VEZ ao logar e para de aparecer
  useEffect(() => {
    if (!user) return;

    const sessionKey = `finantemps_pix_shown_${user.id || user.cpf || 'logged'}`;
    const alreadyShown = sessionStorage.getItem(sessionKey);

    if (!alreadyShown) {
      // Dispara uma única vez 1.5s após autenticar
      const timer = setTimeout(() => {
        setIsContributeModalOpen(true);
        sessionStorage.setItem(sessionKey, 'true');
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [user?.id]);

  const handleOpenAuth = (initialMode = 'login') => {
    setAuthInitialMode(initialMode === 'register' ? 'register' : 'login');
    setAuthInitialEmail('');
    setIsAuthModalOpen(true);
  };

  const handleExportCSV = () => {
    exportToCSV(records, `finantemps_relatorio_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const isUserPending = user && !isApproved();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onExportCSV={handleExportCSV}
        onPrint={printReport}
        activeTab={activeMainTab}
        onSelectTab={setActiveMainTab}
      />

      <main className="app-container" style={{ flex: 1 }}>
        {isUserPending ? (
          <PendingApprovalView />
        ) : !user ? (
          <PaywallBanner
            onOpenContribute={() => setIsContributeModalOpen(true)}
            onOpenMission={() => setIsAboutModalOpen(true)}
            onOpenAuth={handleOpenAuth}
          />
        ) : (
          <div>
            {/* Barra de Seleção de Abas do Aplicativo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--border-color)',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveMainTab('dashboard')}
                style={{
                  background:
                    activeMainTab === 'dashboard'
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                  color: activeMainTab === 'dashboard' ? '#fff' : 'var(--text-muted)',
                  border: activeMainTab === 'dashboard' ? '1px solid #10b981' : '1px solid var(--border-color)',
                  padding: '9px 18px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow:
                    activeMainTab === 'dashboard' ? '0 4px 12px rgba(16, 185, 129, 0.35)' : 'none',
                  transition: 'var(--transition)',
                }}
              >
                <Wallet size={16} />
                <span>Visão Geral & Lançamentos</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMainTab('forecast')}
                style={{
                  background:
                    activeMainTab === 'forecast'
                      ? 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                  color: activeMainTab === 'forecast' ? '#fff' : 'var(--text-muted)',
                  border: activeMainTab === 'forecast' ? '1px solid #06b6d4' : '1px solid var(--border-color)',
                  padding: '9px 18px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow:
                    activeMainTab === 'forecast' ? '0 4px 12px rgba(6, 182, 212, 0.35)' : 'none',
                  transition: 'var(--transition)',
                }}
              >
                <TrendingUp size={16} />
                <span>Previsão Futura & Liberdade</span>
              </button>
            </div>

            {/* Conteúdo da Aba Ativa */}
            {activeMainTab === 'dashboard' ? (
              <FinanceDashboard onOpenNewModal={() => setIsFormModalOpen(true)} />
            ) : (
              <FutureForecastTab onOpenSettings={() => setIsSettingsModalOpen(true)} />
            )}
          </div>
        )}

        {/* Modal de Lançamento Financeiro */}
        <FinanceFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
        />

        {/* Modal de Login e Cadastro */}
        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authInitialMode}
          initialEmail={authInitialEmail}
          onClose={() => setIsAuthModalOpen(false)}
        />

        {/* Modal de Configurações do Usuário e Metas */}
        <UserSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />

        {/* Painel do Dono - Gestão de Clientes e Logins */}
        <AdminPanelModal
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
        />

        {/* Modal de História e Missão do 3º Sgt Adam (13º BIB) */}
        <AboutMissionModal
          isOpen={isAboutModalOpen}
          onClose={() => setIsAboutModalOpen(false)}
        />

        {/* Modal de Contribuição e Doação PIX */}
        <ContributeModal
          isOpen={isContributeModalOpen}
          onClose={() => setIsContributeModalOpen(false)}
        />

        {/* Pop-up Flutuante Inferior Direito de Instalação (APK Android / Passo a passo iOS) */}
        <InstallAppPopup />
      </main>

      <footer
        style={{
          textAlign: 'center',
          padding: '24px 16px',
          color: 'var(--text-dim)',
          fontSize: '0.82rem',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span>FinanTEMP's © {new Date().getFullYear()}</span>
          <span>•</span>
          <span>Criado pelo <strong>3º Sgt Temporário Lucas de Carvalho Adam (13º BIB)</strong></span>
          <span>•</span>
          <button
            type="button"
            onClick={() => setIsAboutModalOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Conheça a Missão
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setIsContributeModalOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#10b981',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            💚 Contribua com o Projeto (PIX)
          </button>
        </div>
      </footer>
    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
  }

  handleCleanAndReload = () => {
    try {
      localStorage.removeItem('finanzen_current_user');
      localStorage.removeItem('finanzen_admin_session');
      sessionStorage.clear();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((r) => r.unregister());
        });
      }
      if (window.caches) {
        caches.keys().then((keys) => {
          keys.forEach((k) => caches.delete(k));
        });
      }
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'radial-gradient(ellipse at top, #1e293b 0%, #0b1120 100%)',
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '36px 28px',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '16px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div style={{ fontSize: '2.8rem', marginBottom: '14px' }}>🛡️</div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
              Finan<span style={{ color: '#10b981' }}>TEMP's</span> • Carregando com Segurança
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '24px', lineHeight: 1.6 }}>
              Houve uma pequena oscilação no cache local do seu navegador durante a atualização. Clique abaixo para restabelecer a conexão limpa:
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn btn-primary"
                style={{ padding: '12px 24px', fontWeight: 700 }}
              >
                Recarregar Página
              </button>
              <button
                type="button"
                onClick={this.handleCleanAndReload}
                className="btn btn-secondary"
                style={{ padding: '12px 20px' }}
              >
                Limpar Cache e Reabrir
              </button>
            </div>
            {this.state.error && (
              <details style={{ marginTop: '22px', textAlign: 'left', fontSize: '0.74rem', color: '#64748b' }}>
                <summary style={{ cursor: 'pointer', color: '#94a3b8' }}>Ver detalhes do erro</summary>
                <pre style={{ marginTop: '8px', padding: '10px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                  {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <FinanceProvider>
          <MainApp />
        </FinanceProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
