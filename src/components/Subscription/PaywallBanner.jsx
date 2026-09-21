import React from 'react';
import { Heart, Sparkles, Instagram, Award, ExternalLink, ShieldCheck } from 'lucide-react';

export const PaywallBanner = ({ onOpenContribute, onOpenMission }) => {
  return (
    <div
      style={{
        margin: '16px 0 24px',
        padding: '20px 24px',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(20, 40, 30, 0.8) 50%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Topo do Banner: Badges e Frase de Finanças */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ flex: 1, minWidth: '280px' }}>
          {/* Badge 100% Gratuito */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '999px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#10b981',
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.4px',
              }}
            >
              <ShieldCheck size={13} />
              PROJETO 100% GRATUITO
            </span>

            <span
              style={{
                fontSize: '0.74rem',
                color: 'var(--text-dim)',
                fontWeight: 600,
              }}
            >
              Sem mensalidades • Feito para você e sua família
            </span>
          </div>

          {/* Frase de Finanças Forte e Inspiradora */}
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.3px' }}>
            "Disciplina na missão, liberdade no bolso."
          </h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5' }}>
            O verdadeiro sucesso financeiro não é apenas sobre o quanto você ganha, mas sobre a <strong>disciplina e o comando total</strong> que você assume sobre o seu dinheiro.
          </p>
        </div>
      </div>

      {/* Barra de Ações em Destaque: Botão Missão + Instagram + Contribuição */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Botão Conheça a Missão (Super Visível) */}
        <button
          type="button"
          onClick={onOpenMission}
          className="btn"
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.88rem',
            padding: '10px 18px',
            borderRadius: '10px',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            border: 'none',
            transition: 'all 0.2s ease',
          }}
          title="Conheça a história e o propósito do 3º Sgt Adam no 13º BIB"
        >
          <Award size={18} />
          <span>Conheça a Missão</span>
        </button>

        {/* Botão Siga no Instagram */}
        <a
          href="https://www.instagram.com/adam404found/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          style={{
            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.88rem',
            padding: '10px 18px',
            borderRadius: '10px',
            boxShadow: '0 4px 14px rgba(220, 39, 67, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title="Siga o criador do projeto no Instagram"
        >
          <Instagram size={18} />
          <span>Instagram @adam404found</span>
          <ExternalLink size={14} />
        </a>

        {/* Botão Contribua com o Projeto (PIX) */}
        <button
          type="button"
          onClick={onOpenContribute}
          className="btn btn-secondary"
          style={{
            fontSize: '0.85rem',
            padding: '10px 16px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
          title="Apoie voluntariamente a manutenção dos servidores"
        >
          <Heart size={15} color="#10b981" fill="#10b981" />
          <span>Apoiar Projeto (PIX)</span>
        </button>
      </div>
    </div>
  );
};
