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
  const isAndroid = /Android/.test(navigator.userAgent);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        if (onInstalled) onInstalled();
        onClose();
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal-content"
        style={{
          maxWidth: '480px',
          padding: '28px 24px',
          position: 'relative',
          borderRadius: '16px',
          textAlign: 'center',
        }}
      >
        {/* Botão de Voltar / Fechar */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--border-color)',
            color: '#e2e8f0',
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.82rem',
            fontWeight: 600,
          }}
          title="Voltar"
        >
          <ArrowLeft size={16} />
          <span>Voltar</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '50%',
          }}
          title="Fechar"
        >
          <X size={18} />
        </button>

        {/* Ícone e Título */}
        <div style={{ marginTop: '12px', marginBottom: '16px' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.25))',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Smartphone size={32} color="#10b981" />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            Instalar FinanTEMP's no Celular
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '4px' }}>
            Acesse direto da sua tela inicial como um aplicativo nativo, rápido e sem ocupar espaço.
          </p>
        </div>

        {/* Botão de instalação direta se o navegador suportar o prompt automático */}
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
              marginBottom: '20px',
              boxShadow: '0 4px 18px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Download size={18} />
            <span>Instalar Aplicativo Agora</span>
          </button>
        )}

        {/* Guia para iPhone (iOS) */}
        {isIOS ? (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'left',
              fontSize: '0.86rem',
              lineHeight: 1.5,
              color: '#cbd5e1',
            }}
          >
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🍎 No iPhone / iPad (Safari):</span>
            </div>
            <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                Toque no botão de <strong>Compartilhar</strong> <Share2 size={15} style={{ verticalAlign: 'middle', margin: '0 2px' }} /> no menu inferior do Safari.
              </li>
              <li>
                Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong> <PlusSquare size={15} style={{ verticalAlign: 'middle', margin: '0 2px' }} />.
              </li>
              <li>
                Toque em <strong>"Adicionar"</strong> no canto superior direito para confirmar.
              </li>
            </ol>
          </div>
        ) : (
          /* Guia para Android / Chrome / Outros */
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'left',
              fontSize: '0.86rem',
              lineHeight: 1.5,
              color: '#cbd5e1',
            }}
          >
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🤖 No Android ou Chrome:</span>
            </div>
            <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                Toque nos <strong>três pontinhos (⋮)</strong> no canto superior do navegador.
              </li>
              <li>
                Selecione a opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
              </li>
              <li>
                Confirme e o ícone com a divisa oficial do <strong>FinanTEMP's</strong> será criado na sua tela!
              </li>
            </ol>
          </div>
        )}

        {/* Benefícios do PWA */}
        <div
          style={{
            marginTop: '16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            textAlign: 'left',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} color="#10b981" />
            <span>Abre em tela cheia</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} color="#10b981" />
            <span>Funciona offline</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} color="#10b981" />
            <span>Não ocupa memória</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} color="#10b981" />
            <span>Super leve e rápido</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn btn-secondary"
          style={{ width: '100%', marginTop: '20px', padding: '10px' }}
        >
          Entendido, fechar
        </button>
      </div>
    </div>
  );
};
