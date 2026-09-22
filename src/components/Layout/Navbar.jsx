import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, Download, LogOut, CheckCircle, Crown, Settings, Shield, Wallet, TrendingUp } from 'lucide-react';

export const Navbar = ({ onOpenAuth, onOpenSettings, onOpenAdminPanel, onOpenAbout, onExportCSV, onPrint, activeTab, onSelectTab }) => {
  const { user, profile, isAdmin, signOut } = useAuth();

  return (
    <header
      style={{
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '12px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Logo com a Divisa Oficial do 3º Sgt e Link da Missão */}
        <div
          onClick={onOpenAbout}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          title="Clique para conhecer a história e missão do aplicativo"
        >
          <img
            src="/logo.png"
            alt="FinanTEMP's"
            style={{
              width: '38px',
              height: '38px',
              objectFit: 'contain',
              borderRadius: '8px',
              filter: 'drop-shadow(0 2px 8px rgba(16, 185, 129, 0.4))',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#fff', margin: 0 }}>
                Finan<span style={{ color: 'var(--primary)' }}>TEMP's</span>
              </h1>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
              Por 3º Sgt Adam • 13º BIB
            </div>
          </div>
        </div>

        {/* Ações e Usuário */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Alternador de Abas (Finanças / Previsão Futura) */}
          {user && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(0, 0, 0, 0.35)',
                padding: '3px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
              }}
            >
              <button
                type="button"
                onClick={() => onSelectTab && onSelectTab('dashboard')}
                style={{
                  background: activeTab === 'dashboard' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'dashboard' ? '#000' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '5px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'var(--transition)',
                }}
              >
                <Wallet size={13} />
                <span>Finanças</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTab && onSelectTab('forecast')}
                style={{
                  background: activeTab === 'forecast' ? 'var(--secondary)' : 'transparent',
                  color: activeTab === 'forecast' ? '#000' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '5px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'var(--transition)',
                }}
              >
                <TrendingUp size={13} />
                <span>Previsão Futura</span>
              </button>
            </div>
          )}

          {/* Exportar */}
          <button
            onClick={onExportCSV}
            className="btn btn-secondary btn-sm"
            title="Exportar dados para Excel/CSV"
          >
            <Download size={15} />
            <span className="hide-mobile">Exportar CSV</span>
          </button>

          {/* Botão Painel Admin (Visível apenas para o Dono) */}
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenAdminPanel}
              className="btn btn-sm"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#000',
                fontWeight: 800,
                boxShadow: '0 2px 10px rgba(245, 158, 11, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title="Painel de Administração de Clientes"
            >
              <Shield size={14} />
              <span>Painel Admin</span>
            </button>
          )}

          {/* Usuário / Login */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={onOpenSettings}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  color: 'inherit',
                }}
                title="Abrir Configurações do Perfil"
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isAdmin ? '#f59e0b' : 'var(--primary)',
                    boxShadow: isAdmin ? '0 0 8px #f59e0b' : 'none',
                  }}
                />
                <span style={{ color: isAdmin ? '#f59e0b' : 'var(--text-muted)', fontWeight: isAdmin ? 700 : 500, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {isAdmin ? `👑 ${profile?.full_name || 'Admin'}` : (profile?.full_name || user.email)}
                </span>
                <Settings size={13} style={{ opacity: 0.7 }} />
              </button>
              <button
                onClick={signOut}
                className="btn btn-secondary btn-sm"
                title="Sair da Conta"
                style={{ padding: '6px 10px' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button onClick={() => onOpenAuth()} className="btn btn-primary btn-sm">
              Entrar / Criar Conta
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
