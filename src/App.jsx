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
import { exportToCSV, printReport } from './utils/exportData';

const MainApp = () => {
  const { user, isApproved } = useAuth();
  const { records } = useFinance();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [authInitialEmail, setAuthInitialEmail] = useState('');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);

  // Pop-up automático de contribuição: ao fazer login e a cada 7 minutos logado
  useEffect(() => {
    if (!user) return;

    // Dispara 1.5s após autenticar/carregar sessão
    const initialTimer = setTimeout(() => {
      setIsContributeModalOpen(true);
    }, 1500);

    // E repete a cada 7 minutos (7 * 60 * 1000 ms = 420.000 ms)
    const SEVEN_MINUTES = 7 * 60 * 1000;
    const intervalTimer = setInterval(() => {
      setIsContributeModalOpen(true);
    }, SEVEN_MINUTES);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
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
      />

      <main className="app-container" style={{ flex: 1 }}>
        {isUserPending ? (
          <PendingApprovalView />
        ) : (
          <>
            {/* Banner Hero visível apenas antes do login */}
            {!user && (
              <PaywallBanner
                onOpenContribute={() => setIsContributeModalOpen(true)}
                onOpenMission={() => setIsAboutModalOpen(true)}
              />
            )}
            <FinanceDashboard onOpenNewModal={() => setIsFormModalOpen(true)} />
          </>
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

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <MainApp />
      </FinanceProvider>
    </AuthProvider>
  );
}
