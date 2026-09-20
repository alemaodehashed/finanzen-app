import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/formatters';
import {
  X,
  Shield,
  Users,
  Crown,
  Search,
  CheckCircle2,
  Clock,
  Ban,
  MessageCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const AdminPanelModal = ({ isOpen, onClose }) => {
  const { fetchAllProfiles, updateUserStatus } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [actionSuccess, setActionSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await fetchAllProfiles();
    setProfiles(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSetLifetime = async (userId, userName) => {
    if (confirm(`Confirmar liberação de ACESSO VITALÍCIO para "${userName}"?`)) {
      const res = await updateUserStatus(userId, 'lifetime');
      if (res.success) {
        setActionSuccess(`Acesso vitalício ativado para ${userName}!`);
        setProfiles((prev) =>
          prev.map((p) => (p.id === userId ? { ...p, subscription_status: 'lifetime' } : p))
        );
        setTimeout(() => setActionSuccess(''), 3000);
      }
    }
  };

  const handleExtendTrial = async (userId, userName) => {
    const newDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
    const res = await updateUserStatus(userId, 'trial', { trial_ends_at: newDate });
    if (res.success) {
      setActionSuccess(`+15 dias de teste grátis concedidos a ${userName}!`);
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === userId ? { ...p, subscription_status: 'trial', trial_ends_at: newDate } : p
        )
      );
      setTimeout(() => setActionSuccess(''), 3000);
    }
  };

  const handleBlockUser = async (userId, userName) => {
    if (confirm(`Deseja BLOQUEAR / EXPIRAR o acesso de "${userName}"?`)) {
      const res = await updateUserStatus(userId, 'expired');
      if (res.success) {
        setActionSuccess(`Acesso de ${userName} expirado com sucesso.`);
        setProfiles((prev) =>
          prev.map((p) => (p.id === userId ? { ...p, subscription_status: 'expired' } : p))
        );
        setTimeout(() => setActionSuccess(''), 3000);
      }
    }
  };

  const filteredProfiles = profiles.filter((p) => {
    const matchSearch =
      (p.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.phone || '').includes(searchTerm);

    if (statusFilter === 'todos') return matchSearch;
    return matchSearch && p.subscription_status === statusFilter;
  });

  const totalClients = profiles.length;
  const totalLifetime = profiles.filter(
    (p) => p.subscription_status === 'lifetime' || p.subscription_status === 'active'
  ).length;
  const totalTrial = profiles.filter((p) => p.subscription_status === 'trial').length;
  const totalExpired = profiles.filter((p) => p.subscription_status === 'expired').length;

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{
          maxWidth: '900px',
          width: '95%',
          maxHeight: '92vh',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Topo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              }}
            >
              <Shield size={22} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
                Painel do Dono • Gestão de Clientes
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Controle acessos, libere planos vitalícios e administre os logins do FinanZen
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Métricas do Negócio */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div className="glass-card" style={{ padding: '14px', borderLeft: '4px solid #06b6d4' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL CLIENTES</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{totalClients}</div>
          </div>

          <div className="glass-card" style={{ padding: '14px', borderLeft: '4px solid #10b981' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>VITALÍCIO / PAGOS</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{totalLifetime}</div>
          </div>

          <div className="glass-card" style={{ padding: '14px', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TESTANDO (TRIAL)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>{totalTrial}</div>
          </div>

          <div className="glass-card" style={{ padding: '14px', borderLeft: '4px solid #f43f5e' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>EXPIRADOS / RECUPERAR</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f43f5e' }}>{totalExpired}</div>
          </div>
        </div>

        {actionSuccess && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CheckCircle2 size={16} />
            {actionSuccess}
          </div>
        )}

        {/* Barra de Busca e Filtros */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-dim)' }}
            />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '36px', fontSize: '0.86rem' }}
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            style={{ width: 'auto', fontSize: '0.86rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos os Status</option>
            <option value="lifetime">Vitalício / Pagos</option>
            <option value="trial">Em Teste Grátis</option>
            <option value="expired">Expirados</option>
          </select>

          <button onClick={loadData} className="btn btn-secondary btn-sm" title="Recarregar dados">
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Tabela de Usuários */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: '260px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
              Carregando clientes...
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
              Nenhum cliente encontrado com esse filtro.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredProfiles.map((client) => {
                const isLifetime =
                  client.subscription_status === 'lifetime' || client.subscription_status === 'active';
                const isTrial = client.subscription_status === 'trial';
                const isExpired = client.subscription_status === 'expired';

                const cleanPhone = (client.phone || '').replace(/\D/g, '');
                const whatsappUrl = cleanPhone
                  ? `https://wa.me/55${cleanPhone}?text=Ol%C3%A1%20${encodeURIComponent(
                      client.full_name || 'Amigo'
                    )}!%20Tudo%20bem?%20Sou%20do%20FinanZen`
                  : null;

                return (
                  <div
                    key={client.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    {/* Dados do Cliente */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                          {client.full_name || 'Sem nome'}
                        </span>
                        {client.is_admin && (
                          <span style={{ fontSize: '0.7rem', background: '#f59e0b', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                            ADMIN
                          </span>
                        )}
                        <span
                          className={
                            isLifetime
                              ? 'badge badge-pro'
                              : isTrial
                              ? 'badge badge-trial'
                              : 'badge badge-expense'
                          }
                        >
                          {isLifetime ? 'VITALÍCIO' : isTrial ? 'TESTE (7D)' : 'EXPIRADO'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '3px' }}>
                        {client.email} {client.phone ? `• ${client.phone}` : ''} • Cadastro: {formatDate(client.created_at?.split('T')[0])}
                      </div>
                    </div>

                    {/* Ações Rápidas do Dono */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Botão WhatsApp */}
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#25D366', borderColor: 'rgba(37, 211, 102, 0.3)' }}
                          title="Conversar no WhatsApp"
                        >
                          <MessageCircle size={14} />
                        </a>
                      )}

                      {/* Ativar Vitalício */}
                      {!isLifetime && (
                        <button
                          type="button"
                          onClick={() => handleSetLifetime(client.id, client.full_name || client.email)}
                          className="btn btn-sm"
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: '#fff',
                            fontWeight: 700,
                          }}
                          title="Liberar Acesso Vitalício (Cliente Pagou)"
                        >
                          <Crown size={13} /> Liberar Vitalício
                        </button>
                      )}

                      {/* Prorrogar Trial (+15 dias) */}
                      {isTrial && (
                        <button
                          type="button"
                          onClick={() => handleExtendTrial(client.id, client.full_name || client.email)}
                          className="btn btn-secondary btn-sm"
                          title="Conceder +15 dias de teste grátis"
                        >
                          <Clock size={13} /> +15 Dias
                        </button>
                      )}

                      {/* Bloquear / Expirar */}
                      {!isExpired && (
                        <button
                          type="button"
                          onClick={() => handleBlockUser(client.id, client.full_name || client.email)}
                          className="btn btn-danger btn-sm"
                          title="Bloquear / Expirar Acesso"
                        >
                          <Ban size={13} /> Bloquear
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
