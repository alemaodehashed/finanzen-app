import React, { useState } from 'react';
import {
  X,
  ArrowLeft,
  Heart,
  Copy,
  Check,
  Award,
  Shield,
  QrCode,
  Sparkles
} from 'lucide-react';

export const ContributeModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const pixKey = '13d2227e-6b24-46ec-8356-c844f0527f1a';
  const beneficiary = 'Lucas de Carvalho Adam';

  if (!isOpen) return null;

  const handleCopyPix = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(pixKey);
      } else {
        // Fallback para navegadores sem clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = pixKey;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.warn('Erro ao copiar chave pix:', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal-content"
        style={{
          maxWidth: '560px',
          padding: '32px 28px',
          textAlign: 'center',
          position: 'relative',
          borderRadius: '16px',
        }}
      >
        {/* Botão de Voltar (topo esquerdo) */}
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
            transition: 'background 0.2s ease',
          }}
          title="Voltar"
        >
          <ArrowLeft size={16} />
          <span>Voltar</span>
        </button>

        {/* Botão de Fechar (topo direito) */}
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Fechar"
        >
          <X size={18} />
        </button>

        {/* Logo Divisa 3º Sgt */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
          <img
            src="/logo.png"
            alt="FinanTEMP's"
            style={{
              width: '92px',
              height: '92px',
              objectFit: 'contain',
              borderRadius: '16px',
              filter: 'drop-shadow(0 8px 24px rgba(16, 185, 129, 0.4))',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
          <span className="badge badge-pro" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
            <Award size={13} /> 13º Batalhão de Infantaria Blindado
          </span>
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', margin: '4px 0 2px' }}>
          Apoie o Projeto FinanTEMP's
        </h2>
        <div style={{ fontSize: '0.86rem', color: '#10b981', fontWeight: 600, marginBottom: '16px' }}>
          Idealizado pelo 3º Sgt Temporário Lucas de Carvalho Adam
        </div>

        {/* Mensagem Institucional */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 18px',
            textAlign: 'left',
            color: '#cbd5e1',
            fontSize: '0.88rem',
            lineHeight: 1.6,
            marginBottom: '20px',
          }}
        >
          <p style={{ margin: '0 0 10px' }}>
            O <strong>FinanTEMP's</strong> foi desenvolvido com o propósito de ser <strong>100% gratuito e sem cobrança de assinaturas</strong>, ajudando nossos irmãos de farda e suas famílias a organizarem suas finanças com liberdade e disciplina.
          </p>
          <p style={{ margin: 0 }}>
            Para manter a infraestrutura de servidores ativa, atualizações frequentes e o aplicativo sempre no ar, <strong>sua contribuição voluntária é de grande valor</strong>.
          </p>
        </div>

        {/* Cartão da Chave PIX */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08))',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '14px',
            padding: '20px',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <Heart size={18} color="#10b981" fill="#10b981" />
            <strong style={{ color: '#fff', fontSize: '0.98rem' }}>Chave PIX Oficial</strong>
          </div>

          {/* Campo da Chave */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              margin: '10px 0',
            }}
          >
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.90rem',
                fontWeight: 700,
                color: '#10b981',
                wordBreak: 'break-all',
                textAlign: 'left',
              }}
            >
              {pixKey}
            </span>

            <button
              type="button"
              onClick={handleCopyPix}
              className="btn btn-sm"
              style={{
                background: copied ? '#10b981' : 'rgba(16, 185, 129, 0.25)',
                color: copied ? '#000' : '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.5)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
            >
              {copied ? (
                <>
                  <Check size={14} />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            Beneficiário: <strong style={{ color: '#cbd5e1' }}>{beneficiary}</strong>
          </div>

          <div
            style={{
              fontSize: '0.80rem',
              color: 'var(--text-muted)',
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            💡 <em>Qualquer quantia faz a diferença (R$ 2, R$ 5, R$ 10 ou quanto puder apoiar).</em>
          </div>
        </div>

        {/* Botão de Fechar e Voltar */}
        <button
          type="button"
          onClick={onClose}
          className="btn btn-primary"
          style={{ width: '100%', padding: '12px', fontWeight: 700 }}
        >
          Entendido, voltar ao Painel!
        </button>
      </div>
    </div>
  );
};
