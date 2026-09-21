import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, ShieldAlert, MessageCircle, RefreshCw, LogOut, CheckCircle2 } from 'lucide-react';

export const PendingApprovalView = () => {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [checking, setChecking] = useState(false);
  const [msg, setMsg] = useState('');

  const handleCheckAgain = async () => {
    setChecking(true);
    setMsg('');
    await refreshProfile();
    setTimeout(() => {
      setChecking(false);
      setMsg('Status verificado. Se você acabou de ser aprovado, o sistema atualizará automaticamente.');
    }, 1000);
  };

  const cleanEmail = user?.email || profile?.email || '';
  const cleanName = profile?.full_name || cleanEmail.split('@')[0] || 'Usuário';

  const adminPhone = '5542999757796';
  const whatsappMessage = encodeURIComponent(
    `Olá Adam! Acabei de criar minha conta no FinanTEMP's (${cleanName} - ${cleanEmail}). Pode liberar meu acesso no painel?`
  );
  const whatsappUrl = `https://wa.me/${adminPhone}?text=${whatsappMessage}`;

  return (
    <div
      style={{
        maxWidth: '560px',
        margin: '60px auto',
        padding: '36px 32px',
        background: 'rgba(15, 23, 42, 0.75)',
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
          margin: '0 auto 18px',
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

      <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
        Conta Criada com Sucesso!
      </h2>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5', marginBottom: '22px' }}>
        Olá, <strong style={{ color: '#fff' }}>{cleanName}</strong> (<span style={{ color: 'var(--primary)' }}>{cleanEmail}</span>). Seu cadastro foi registrado, mas o acesso ao painel financeiro precisa ser <strong>autorizado pelo administrador</strong>.
      </p>

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          textAlign: 'left',
          fontSize: '0.84rem',
          color: 'var(--text-dim)',
          marginBottom: '24px',
        }}
      >
        <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>
          Como funciona a liberação?
        </div>
        <div>
          1. O administrador (3º Sgt Adam) recebe seu cadastro no painel dele.<br />
          2. Assim que ele clicar em <strong>"Autorizar Acesso"</strong>, seu painel financeiro será liberado automaticamente.
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
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          style={{
            background: '#25D366',
            color: '#000',
            fontWeight: 800,
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)',
          }}
        >
          <MessageCircle size={18} />
          Avisar o Administrador no WhatsApp
        </a>

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
          }}
        >
          <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
          {checking ? 'Verificando...' : 'Verificar se já fui aprovado'}
        </button>

        <button
          type="button"
          onClick={signOut}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            fontSize: '0.82rem',
            marginTop: '8px',
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
