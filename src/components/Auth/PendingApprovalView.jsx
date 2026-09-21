import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { formatCPF } from '../../utils/formatters';
import {
  Clock,
  ShieldAlert,
  RefreshCw,
  LogOut,
  Instagram,
  ExternalLink
} from 'lucide-react';

export const PendingApprovalView = () => {
  const { user, profile, refreshProfile, markInstagramFollowed, signOut } = useAuth();
  const [checking, setChecking] = useState(false);
  const [msg, setMsg] = useState('');
  const [followedInstagram, setFollowedInstagram] = useState(profile?.followed_instagram || false);

  const handleCheckAgain = async () => {
    setChecking(true);
    setMsg('');
    await refreshProfile();
    setTimeout(() => {
      setChecking(false);
      setMsg('Status atualizado. Assim que o administrador autorizar, seu acesso será liberado!');
    }, 1000);
  };

  const handleFollowClick = () => {
    setFollowedInstagram(true);
    markInstagramFollowed();
    window.open('https://www.instagram.com/adam404found/', '_blank', 'noopener,noreferrer');
  };

  const cleanName = profile?.full_name || user?.user_metadata?.full_name || 'Usuário';
  const displayCpf = user?.cpf || profile?.cpf ? formatCPF(user?.cpf || profile?.cpf) : '';

  return (
    <div
      style={{
        maxWidth: '560px',
        margin: '50px auto',
        padding: '36px 28px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
        textAlign: 'center',
      }}
    >
      {/* Ícone de Destaque */}
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2))',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 4px 20px rgba(245, 158, 11, 0.25)',
        }}
      >
        <Clock size={32} color="#f59e0b" />
      </div>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '999px',
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          color: '#f59e0b',
          fontSize: '0.75rem',
          fontWeight: 800,
          letterSpacing: '0.5px',
          marginBottom: '12px',
        }}
      >
        <ShieldAlert size={13} />
        AGUARDANDO APROVAÇÃO
      </div>

      <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
        Conta Cadastrada com Sucesso!
      </h2>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.90rem', lineHeight: '1.5', marginBottom: '20px' }}>
        Olá, <strong style={{ color: '#fff' }}>{cleanName}</strong>
        {displayCpf && <span> (CPF: <strong style={{ color: 'var(--primary)' }}>{displayCpf}</strong>)</span>}.
        Para liberar seu acesso gratuito, basta seguir o criador no Instagram abaixo:
      </p>

      {/* Caixa de Requisito Único - Instagram */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '18px 20px',
          textAlign: 'left',
          marginBottom: '22px',
        }}
      >
        <div style={{ fontWeight: 800, color: '#e2e8f0', marginBottom: '12px', fontSize: '0.92rem' }}>
          📋 Requisito para Liberação:
        </div>

        {/* Passo Único - Instagram */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: followedInstagram ? '#10b981' : '#e1306c',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px',
            }}
          >
            {followedInstagram ? '✓' : '1'}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
              Seguir o perfil oficial no Instagram
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              Siga o criador do projeto <strong style={{ color: '#e1306c' }}>@adam404found</strong> para ter seu acesso liberado.
            </div>
          </div>
        </div>
      </div>

      {msg && (
        <div
          style={{
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            color: '#06b6d4',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            marginBottom: '18px',
          }}
        >
          {msg}
        </div>
      )}

      {/* Botões de Ação */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Botão: Instagram Oficial */}
        <button
          type="button"
          onClick={handleFollowClick}
          className="btn"
          style={{
            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
            color: '#fff',
            fontWeight: 800,
            padding: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(220, 39, 67, 0.35)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Instagram size={19} />
          <span>{followedInstagram ? '✓ Seguir @adam404found no Instagram' : 'Seguir @adam404found no Instagram'}</span>
          <ExternalLink size={15} />
        </button>

        {/* Botão 3: Verificar Status */}
        <button
          type="button"
          onClick={handleCheckAgain}
          disabled={checking}
          className="btn btn-secondary"
          style={{
            padding: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '4px',
          }}
        >
          <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
          {checking ? 'Verificando...' : 'Verificar se já fui aprovado'}
        </button>

        {/* Sair */}
        <button
          type="button"
          onClick={signOut}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            fontSize: '0.82rem',
            marginTop: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <LogOut size={14} />
          Sair da conta ou entrar com outro usuário
        </button>
      </div>
    </div>
  );
};
