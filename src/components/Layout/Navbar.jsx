import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, Download, LogOut, Smartphone, CheckCircle, Crown, Settings } from 'lucide-react';

export const Navbar = ({ onOpenAuth, onOpenSettings, onExportCSV, onPrint }) => {
  const { user, profile, signOut, isDemoMode, getDaysRemainingInTrial } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('Para instalar no celular:\n- No iPhone: toque em Compartilhar e selecione "Adicionar à Tela de Início".\n- No Android: toque no menu (três pontinhos) e selecione "Instalar aplicativo".');
    }
  };

  const daysLeft = getDaysRemainingInTrial();
  const isPro = profile?.subscription_status === 'active' || profile?.subscription_status === 'lifetime';

  return (
    <header
      style={{
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '12px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#fff', margin: 0 }}>
                Finan<span style={{ color: 'var(--primary)' }}>Zen</span>
              </h1>
              {isPro ? (
                <span className="badge badge-pro">
                  <Crown size={12} /> PRO
                </span>
              ) : (
                <span className="badge badge-trial">
                  ⏳ {daysLeft} dias de teste
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 500 }}>
              Finanças Pessoais & Familiares
            </div>
          </div>
        </div>

        {/* Ações e Usuário */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Botão PWA Instalar */}
          {!isInstalled && (
            <button
              onClick={handleInstallClick}
              className="btn btn-secondary btn-sm"
              title="Instalar no Celular"
              style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: 'var(--primary)' }}
            >
              <Smartphone size={15} />
              <span className="hide-mobile">Instalar no Celular</span>
            </button>
          )}

          {/* Exportar */}
          <button
            onClick={onExportCSV}
            className="btn btn-secondary btn-sm"
            title="Exportar dados para Excel/CSV"
          >
            <Download size={15} />
            <span className="hide-mobile">Exportar CSV</span>
          </button>

          {/* Usuário / Login */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={onOpenSettings}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  color: 'inherit',
                }}
                title="Abrir Configurações do Perfil"
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                  }}
                />
                <span style={{ color: 'var(--text-muted)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile?.full_name || user.email}
                </span>
                <Settings size={13} style={{ opacity: 0.7 }} />
              </button>
              <button
                onClick={signOut}
                className="btn btn-secondary btn-sm"
                title="Sair da Conta"
                style={{ padding: '6px 10px' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn btn-primary btn-sm">
              Entrar / Criar Conta
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
