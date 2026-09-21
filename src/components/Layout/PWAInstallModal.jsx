import React from 'react';
import {
  X,
  ArrowLeft,
  Smartphone,
  Share2,
  PlusSquare,
  CheckCircle2,
  Download,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const PWAInstallModal = ({ isOpen, onClose, deferredPrompt, onInstalled }) => {
  if (!isOpen) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          if (onInstalled) onInstalled();
          onClose();
        }
      } catch (e) {
        console.warn('Erro ao instalar PWA:', e);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal-content"
        style={{
          maxWidth: '460px',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: '24px 20px',
          position: 'relative',
          borderRadius: '16px',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        {/* Botão de Fechar */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Fechar"
        >
          <X size={18} />
        </button>

        {/* Ícone e Título */}
        <div style={{ marginTop: '6px', marginBottom: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.25))',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
              boxShadow: '0 6px 18px rgba(16, 185, 129, 0.25)',
            }}
          >
            <Smartphone size={28} color="#10b981" />
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            Instalar FinanTEMP's
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px', marginBottom: 0 }}>
            Instale como um aplicativo na sua tela inicial, rápido e leve.
          </p>
        </div>

        {/* Botão de instalação direta com 1 clique */}
        {deferredPrompt && (
          <button
            type="button"
            onClick={handleInstallClick}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '13px',
              fontSize: '0.96rem',
              fontWeight: 800,
              marginBottom: '16px',
              boxShadow: '0 4px 18px rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Download size={18} />
            <span>Instalar Aplicativo Agora</span>
          </button>
        )}

        {/* Instruções para quando o navegador exigir toque manual (como iPhone Safari) */}
        {isIOS ? (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '14px',
              textAlign: 'left',
              fontSize: '0.84rem',
              lineHeight: 1.5,
              color: '#cbd5e1',
              marginBottom: '14px',
            }}
          >
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🍎 No iPhone / Safari:</span>
            </div>
            <ol style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                Toque no botão de <strong>Compartilhar</strong> <Share2 size={14} style={{ verticalAlign: 'middle' }} /> no menu inferior.
              </li>
              <li>
                Role e toque em <strong>"Adicionar à Tela de Início"</strong> <PlusSquare size={14} style={{ verticalAlign: 'middle' }} />.
              </li>
              <li>
                Confirme em <strong>"Adicionar"</strong> no topo direito.
              </li>
            </ol>
          </div>
        ) : !deferredPrompt ? (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '14px',
              textAlign: 'left',
              fontSize: '0.84rem',
              lineHeight: 1.5,
              color: '#cbd5e1',
              marginBottom: '14px',
            }}
          >
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🤖 No Android ou Chrome:</span>
            </div>
            <ol style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                Toque nos <strong>três pontinhos (⋮)</strong> no canto superior do navegador.
              </li>
              <li>
                Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
              </li>
              <li>
                Confirme e pronto! O app aparecerá na tela do seu celular.
              </li>
            </ol>
          </div>
        ) : null}

        {/* Benefícios */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px',
            textAlign: 'left',
            fontSize: '0.76rem',
            color: 'var(--text-muted)',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <CheckCircle2 size={13} color="#10b981" />
            <span>Abre em tela cheia</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <CheckCircle2 size={13} color="#10b981" />
            <span>Acesso instantâneo</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <CheckCircle2 size={13} color="#10b981" />
            <span>Não ocupa memória</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <CheckCircle2 size={13} color="#10b981" />
            <span>Super leve e rápido</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn btn-secondary"
          style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
