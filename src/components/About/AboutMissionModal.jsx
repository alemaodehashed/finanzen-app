import React from 'react';
import { X, ArrowLeft, Shield, Award, Heart, Share2, CheckCircle2 } from 'lucide-react';

export const AboutMissionModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{
          maxWidth: '560px',
          padding: '32px 28px',
          textAlign: 'center',
          position: 'relative',
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
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <X size={20} />
        </button>

        {/* Logo Divisa 3º Sgt */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
          <img
            src="/logo.png"
            alt="Divisa 3º Sgt Infantaria 13º BIB"
            style={{
              width: '96px',
              height: 'auto',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              background: '#1a3323',
              padding: '6px',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
          <span className="badge badge-pro" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
            <Award size={13} /> 13º Batalhão de Infantaria Blindado
          </span>
        </div>

        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
          A Missão por trás do FinanTEMP's
        </h2>
        <div style={{ fontSize: '0.86rem', color: '#10b981', fontWeight: 600, marginTop: '2px', marginBottom: '18px' }}>
          Idealizado pelo 3º Sgt Temporário Lucas de Carvalho Adam
        </div>

        {/* História e Propósito */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            textAlign: 'left',
            color: '#cbd5e1',
            fontSize: '0.9rem',
            lineHeight: 1.65,
            marginBottom: '20px',
          }}
        >
          <p style={{ marginBottom: '12px' }}>
            No dia a dia da caserna, servindo no glorioso <strong>13º BIB</strong>, presenciei de perto uma realidade que atinge muitos irmãos de farda: a sobrecarga de dívidas, juros altos e a falta de um assessoramento financeiro claro e direto para a tropa e suas famílias.
          </p>

          <p style={{ marginBottom: '12px' }}>
            O <strong>FinanTEMP's</strong> foi forjado justamente para preencher essa lacuna — trazendo um painel simples, blindado e eficiente para que cada militar assuma o <strong>comando total do seu dinheiro</strong>, corte desperdícios e construa uma reserva sólida.
          </p>

          <div
            style={{
              paddingTop: '10px',
              borderTop: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Shield size={16} color="#10b981" />
            <span>Disciplina na missão. Liberdade no bolso. Brasil acima de tudo!</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn btn-primary"
          style={{ width: '100%', padding: '12px', fontWeight: 700 }}
        >
          Entendido, ir para o Painel!
        </button>
      </div>
    </div>
  );
};
