import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FinanceProvider, useFinance } from './contexts/FinanceContext';
import { Navbar } from './components/Layout/Navbar';
import { PaywallBanner } from './components/Subscription/PaywallBanner';
import { FinanceDashboard } from './components/Finance/FinanceDashboard';
import { FinanceFormModal } from './components/Finance/FinanceFormModal';
import { AuthModal } from './components/Auth/AuthModal';
import { UserSettingsModal } from './components/Settings/UserSettingsModal';
import { AdminPanelModal } from './components/Admin/AdminPanelModal';
import { exportToCSV, printReport } from './utils/exportData';

const MainApp = () => {
  const { user, isSubscriptionActive } = useAuth();
  const { records } = useFinance();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  const handleExportCSV = () => {
    exportToCSV(records, `finanzen_relatorio_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onExportCSV={handleExportCSV}
        onPrint={printReport}
      />

      <main className="app-container" style={{ flex: 1 }}>
        {/* Banner de Teste Grátis / Assinatura */}
        <PaywallBanner />

        {/* Dashboard com Métricas e Lançamentos */}
        <FinanceDashboard onOpenNewModal={() => setIsFormModalOpen(true)} />

        {/* Modal de Lançamento Financeiro */}
        <FinanceFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
        />

        {/* Modal de Login e Cadastro */}
        <AuthModal
          isOpen={isAuthModalOpen}
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
        FinanZen © {new Date().getFullYear()} • Controle Financeiro Pessoal & Familiar • Seguro e Privado
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
