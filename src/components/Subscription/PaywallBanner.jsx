import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, Crown, Zap, CheckCircle2 } from 'lucide-react';

export const PaywallBanner = ({ paymentUrl = 'https://wa.me/?text=Quero%20ativar%20o%20FinanTEMP\'s' }) => {
  const { profile, isSubscriptionActive, getDaysRemainingInTrial } = useAuth();

  const isPro = profile?.subscription_status === 'active' || profile?.subscription_status === 'lifetime';
  const isActive = isSubscriptionActive();
  const daysLeft = getDaysRemainingInTrial();

  if (isPro) return null;

  // Se o teste grátis já acabou
  if (!isActive) {
    return (
      <div
        className="glass-card"
        style={{
          margin: '20px 0',
          padding: '28px',
          background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(139, 92, 246, 0.15))',
          border: '1px solid rgba(244, 63, 94, 0.4)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}
        >
          <Crown size={26} color="#f43f5e" />
        </div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
          Seu período de teste gratuito terminou
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '520px', margin: '8px auto 20px' }}>
          Assine agora para continuar tendo controle total dos seus gastos de casa, salários e gráficos com acesso vitalício ou mensal.
        </p>
        <a
          href={paymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{
            background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
            boxShadow: '0 4px 15px rgba(244, 63, 94, 0.4)',
            padding: '12px 24px',
            fontSize: '1rem',
          }}
        >
          <Zap size={18} />
          Liberar Acesso Completo Agora
        </a>
      </div>
    );
  }

  // Aviso discreto de dias restantes no trial
  return (
    <div
      style={{
        margin: '16px 0',
        padding: '12px 18px',
        borderRadius: 'var(--radius-md)',
        background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))',
        border: '1px solid rgba(16, 185, 129, 0.25)',
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
          Você está usando o <strong>período de teste grátis</strong> ({daysLeft} {daysLeft === 1 ? 'dia restante' : 'dias restantes'}).
        </span>
      </div>
      <a
        href={paymentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-sm"
        style={{
          background: 'rgba(16, 185, 129, 0.2)',
          color: '#10b981',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          fontWeight: 700,
        }}
      >
        <Crown size={14} /> Ativar Plano Vitalício
      </a>
    </div>
  );
};
