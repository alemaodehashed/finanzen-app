import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

export const PaywallBanner = ({ onOpenContribute }) => {
  return (
    <div
      style={{
        margin: '16px 0 20px',
        padding: '12px 18px',
        borderRadius: 'var(--radius-md)',
        background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.12))',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Sparkles size={18} color="#10b981" />
        <span style={{ fontSize: '0.88rem', color: '#e2e8f0' }}>
          O FinanTEMP's é <strong>100% gratuito</strong> para apoiar você e sua família.
        </span>
      </div>
      <button
        type="button"
        onClick={onOpenContribute}
        className="btn btn-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.25))',
          color: '#10b981',
          border: '1px solid rgba(16, 185, 129, 0.5)',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          padding: '8px 16px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
          transition: 'all 0.2s ease',
        }}
        title="Apoie voluntariamente o projeto com qualquer valor"
      >
        <Heart size={14} color="#10b981" fill="#10b981" />
        <span>Contribua com o projeto</span>
      </button>
    </div>
  );
};
