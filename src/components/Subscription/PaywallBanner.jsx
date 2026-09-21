import React from 'react';
import { Heart, Sparkles, Instagram, Award, ExternalLink, ShieldCheck, UserPlus, LogIn } from 'lucide-react';

export const PaywallBanner = ({ onOpenContribute, onOpenMission, onOpenAuth }) => {
  return (
    <div
      style={{
        margin: '24px auto',
        maxWidth: '820px',
        padding: '32px 28px',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(20, 40, 30, 0.85) 50%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        textAlign: 'center',
      }}
    >
      {/* Topo do Banner: Badges e Frase de Finanças */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 12px',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#10b981',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.4px',
            }}
          >
            <ShieldCheck size={14} />
            PROJETO 100% GRATUITO
          </span>

          <span
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-dim)',
              fontWeight: 600,
            }}
          >
            Sem mensalidades • Feito para você e sua família
          </span>
        </div>

        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '8px 0 4px', letterSpacing: '-0.3px' }}>
          "Disciplina na missão, liberdade no bolso."
        </h3>
        <p style={{ margin: '0 auto', maxWidth: '640px', color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: '1.6' }}>
          O verdadeiro sucesso financeiro não é apenas sobre o quanto você ganha, mas sobre a <strong>disciplina e o comando total</strong> que você assume sobre o seu dinheiro. Crie sua conta gratuita em segundos para ter acesso ao seu painel completo.
        </p>
      </div>

      {/* Botões Principais de Cadastro e Login */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          padding: '12px 0 6px',
        }}
      >
        <button
          type="button"
          onClick={() => onOpenAuth && onOpenAuth('register')}
          className="btn btn-primary"
          style={{
            padding: '12px 24px',
            fontSize: '0.96rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
          }}
        >
          <UserPlus size={18} />
          <span>Criar Conta Gratuita</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenAuth && onOpenAuth('login')}
          className="btn btn-secondary"
          style={{
            padding: '12px 22px',
            fontSize: '0.96rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <LogIn size={18} />
          <span>Já tenho conta / Entrar</span>
        </button>
      </div>

      {/* Barra de Ações Secundárias: Botão Missão + Instagram + Contribuição */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Botão Conheça a Missão */}
        <button
          type="button"
          onClick={onOpenMission}
          className="btn btn-secondary"
          style={{
            fontSize: '0.84rem',
            padding: '9px 15px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
          title="Conheça a história e o propósito do 3º Sgt Adam no 13º BIB"
        >
          <Award size={16} color="#10b981" />
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
            fontWeight: 700,
            fontSize: '0.84rem',
            padding: '9px 15px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(220, 39, 67, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textDecoration: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          title="Siga o criador do projeto no Instagram"
        >
          <Instagram size={16} />
          <span>Instagram @adam404found</span>
          <ExternalLink size={13} />
        </a>

        {/* Botão Contribua com o Projeto (PIX) */}
        <button
          type="button"
          onClick={onOpenContribute}
          className="btn btn-secondary"
          style={{
            fontSize: '0.84rem',
            padding: '9px 15px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
          title="Apoie voluntariamente a manutenção dos servidores"
        >
          <Heart size={14} color="#10b981" fill="#10b981" />
          <span>Apoiar Projeto (PIX)</span>
        </button>
      </div>
    </div>
  );
};
