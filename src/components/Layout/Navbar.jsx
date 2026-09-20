import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, Download, LogOut, Smartphone, CheckCircle, Crown, Settings, Shield } from 'lucide-react';

export const Navbar = ({ onOpenAuth, onOpenSettings, onOpenAdminPanel, onOpenAbout, onExportCSV, onPrint }) => {
  const { user, profile, isAdmin, signOut, isDemoMode, getDaysRemainingInTrial } = useAuth();
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
        {/* Logo com a Divisa Oficial do 3º Sgt e Link da Missão */}
        <div
          onClick={onOpenAbout}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          title="Clique para conhecer a história e missão do aplicativo"
        >
          <img
            src="/logo.png"
            alt="Divisa 3º Sgt Infantaria 13º BIB"
            style={{
              width: '38px',
              height: '42px',
              objectFit: 'contain',
              borderRadius: '6px',
              filter: 'drop-shadow(0 2px 8px rgba(16, 185, 129, 0.35))',
            }}
          />
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
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
              Por 3º Sgt Adam • 13º BIB <span style={{ color: 'var(--primary)', fontWeight: 700, marginLeft: '4px' }}>★ Missão</span>
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

          {/* Botão Painel Admin (Visível apenas para o Dono) */}
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenAdminPanel}
              className="btn btn-sm"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#000',
                fontWeight: 800,
                boxShadow: '0 2px 10px rgba(245, 158, 11, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title="Painel de Administração de Clientes"
            >
              <Shield size={14} />
              <span>Painel Admin</span>
            </button>
          )}

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
