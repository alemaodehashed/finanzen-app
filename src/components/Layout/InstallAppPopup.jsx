import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Download,
  Share2,
  PlusSquare,
  X,
  CheckCircle2
} from 'lucide-react';

export const InstallAppPopup = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [platform, setPlatform] = useState('android');

  useEffect(() => {
    // Detecta se já está instalado em modo Standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      setIsOpen(false);
      return;
    }

    // Detecta se o dispositivo é iOS (iPhone, iPad, iPod)
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isIOSDevice) {
      setPlatform('ios');
    } else {
      setPlatform('android');
    }

    // Captura evento nativo do PWA / APK
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsOpen(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setIsOpen(false);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.warn('Erro ao disparar prompt de instalação:', err);
      }
    } else {
      // Caso o navegador não suporte prompt direto (ex: Firefox ou Chrome já instalado)
      alert(
        'Para instalar no Android: toque nos 3 pontinhos (⋮) do seu navegador e escolha "Instalar aplicativo" ou "Adicionar à tela inicial".'
      );
    }
  };

  // Se já estiver rodando instalado em tela cheia, não precisa exibir
  if (isInstalled) return null;

  return (
    <aside
      aria-label="Instalação do Aplicativo"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {isOpen ? (
        <div
          style={{
            width: '320px',
            maxWidth: 'calc(100vw - 32px)',
            background: 'rgba(15, 23, 42, 0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.55), 0 0 20px rgba(16, 185, 129, 0.15)',
            animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            marginBottom: '10px',
            color: '#fff',
            boxSizing: 'border-box',
          }}
        >
          {/* Topo do Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.18)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Wallet size={18} color="#10b981" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>
                  Instalar Aplicativo
                </h4>
                <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                  FinanTEMP's na Tela Inicial
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: 'var(--text-dim, #94a3b8)',
                cursor: 'pointer',
                padding: '5px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
              title="Minimizar"
            >
              <X size={15} />
            </button>
          </div>

          {/* Abas: Android / APK vs iPhone / iOS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4px',
              background: 'rgba(0, 0, 0, 0.35)',
              padding: '3px',
              borderRadius: '8px',
              marginBottom: '12px',
            }}
          >
            <button
              type="button"
              onClick={() => setPlatform('android')}
              style={{
                padding: '6px 8px',
                borderRadius: '6px',
                border: 'none',
                background: platform === 'android' ? 'var(--primary, #10b981)' : 'transparent',
                color: platform === 'android' ? '#000' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              🤖 Android / APK
            </button>
            <button
              type="button"
              onClick={() => setPlatform('ios')}
              style={{
                padding: '6px 8px',
                borderRadius: '6px',
                border: 'none',
                background: platform === 'ios' ? 'var(--primary, #10b981)' : 'transparent',
                color: platform === 'ios' ? '#000' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              🍎 iPhone / iOS
            </button>
          </div>

          {/* Conteúdo Dinâmico conforme a Plataforma */}
          {platform === 'android' ? (
            <div>
              <p
                style={{
                  fontSize: '0.78rem',
                  color: '#cbd5e1',
                  margin: '0 0 12px 0',
                  lineHeight: 1.4,
                }}
              >
                Instale o FinanTEMP's no seu celular para abrir em tela cheia com acesso instantâneo e offline.
              </p>

              <button
                type="button"
                onClick={handleInstallClick}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <Download size={16} />
                <span>Instalar APK / App</span>
              </button>

              <div
                style={{
                  fontSize: '0.70rem',
                  color: '#94a3b8',
                  marginTop: '8px',
                  textAlign: 'center',
                }}
              >
                Se preferir: menu (⋮) → "Adicionar à tela inicial"
              </div>
            </div>
          ) : (
            <div>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  fontSize: '0.76rem',
                  color: '#e2e8f0',
                  lineHeight: 1.45,
                }}
              >
                <div style={{ fontWeight: 700, color: '#10b981', marginBottom: '6px' }}>
                  Passo a passo no Safari (iPhone):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <span style={{ fontWeight: 800, color: '#fff' }}>1.</span>
                    <span>
                      Toque no botão <strong>Compartilhar</strong> (
                      <Share2 size={12} style={{ verticalAlign: 'middle', color: '#38bdf8' }} />
                      ) na barra inferior do Safari.
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <span style={{ fontWeight: 800, color: '#fff' }}>2.</span>
                    <span>
                      Role para baixo e selecione{' '}
                      <strong>"Adicionar à Tela de Início"</strong> (
                      <PlusSquare size={12} style={{ verticalAlign: 'middle', color: '#10b981' }} />
                      ).
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <span style={{ fontWeight: 800, color: '#fff' }}>3.</span>
                    <span>
                      Toque em <strong>"Adicionar"</strong> no canto superior direito.
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.70rem',
                  color: '#10b981',
                  marginTop: '8px',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={12} />
                <span>O app abrirá em tela cheia como nativo!</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Botão Flutuante Reduzido (Conforme a imagem enviada) */
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '13px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(16, 185, 129, 0.45)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.45), 0 0 12px rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            padding: 0,
          }}
          title="Instalar App / Passo a passo iOS"
        >
          <Wallet size={22} color="#10b981" />
        </button>
      )}
    </aside>
  );
};
