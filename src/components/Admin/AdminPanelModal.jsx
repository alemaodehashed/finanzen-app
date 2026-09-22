import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatCPF } from '../../utils/formatters';
import {
  X,
  Shield,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Ban,
  MessageCircle,
  RefreshCw,
  Sparkles,
  UserCheck,
  Check,
  Instagram,
  Trash2,
  CalendarCheck
} from 'lucide-react';

const formatLastAccess = (dateStr) => {
  if (!dateStr) return 'Nunca acessou';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Nunca acessou';

    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    if (isToday) return `Hoje às ${timeStr}`;
    if (isYesterday) return `Ontem às ${timeStr}`;

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year} às ${timeStr}`;
  } catch {
    return 'Data indisponível';
  }
};

export const AdminPanelModal = ({ isOpen, onClose }) => {
  const { fetchAllProfiles, updateUserStatus, deleteUser } = useAuth();
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

  // Excluir usuário definitivamente
  const handleDeleteUser = async (userId, userName) => {
    if (
      confirm(
        `Tem certeza que deseja EXCLUIR DEFINITIVAMENTE o usuário "${userName}"?\n\nTodos os dados e lançamentos deste usuário serão apagados do sistema e esta ação não poderá ser desfeita.`
      )
    ) {
      const res = await deleteUser(userId);
      if (res?.error) {
        alert(res.error);
        return;
      }
      setActionSuccess(`Usuário "${userName}" excluído com sucesso!`);
      setProfiles((prev) => prev.filter((p) => p.id !== userId));
      setTimeout(() => setActionSuccess(''), 4000);
    }
  };

  // Alternar administrador
  const handleToggleAdmin = async (userId, userName, currentIsAdmin) => {
    const actionText = currentIsAdmin ? 'REMOVER status de administrador' : 'TORNAR ADMINISTRADOR';
    if (confirm(`Deseja ${actionText} para "${userName}"?`)) {
      const res = await updateUserStatus(userId, 'active', { is_admin: !currentIsAdmin });
      if (res.success) {
        setActionSuccess(`Privilégios de ${userName} atualizados com sucesso!`);
        setProfiles((prev) =>
          prev.map((p) => (p.id === userId ? { ...p, is_admin: !currentIsAdmin } : p))
        );
        setTimeout(() => setActionSuccess(''), 3000);
      }
    }
  };

  const isProfileAdmin = (p) => Boolean(
    p.is_admin ||
    p.email === 'adam.tv2004@gmail.com' ||
    p.email === 'lucasadamdeveloper@gmail.com' ||
    p.cpf === '00000000000'
  );

  const filteredProfiles = profiles.filter((p) => {
    const matchSearch =
      (p.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.phone || '').includes(searchTerm);

    if (!matchSearch) return false;
    if (statusFilter === 'active') return !isProfileAdmin(p);
    if (statusFilter === 'admin') return isProfileAdmin(p);
    return true;
  });

  const totalUsers = profiles.length;
  const totalAdmins = profiles.filter(isProfileAdmin).length;
  const totalRegularUsers = profiles.filter((p) => !isProfileAdmin(p)).length;

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{
          maxWidth: '920px',
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
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              }}
            >
              <Shield size={24} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
                Painel do Dono • Gestão de Usuários
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Monitore e gerencie as contas cadastradas no FinanTEMP's
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

        {/* Métricas dos Usuários */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          {/* Card Usuários Cadastrados */}
          <div
            onClick={() => setStatusFilter('active')}
            className="glass-card"
            style={{ padding: '16px', borderLeft: '4px solid #10b981', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
              USUÁRIOS CADASTRADOS
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
              {totalRegularUsers}
            </div>
          </div>

          {/* Card Administradores */}
          <div
            onClick={() => setStatusFilter('admin')}
            className="glass-card"
            style={{ padding: '16px', borderLeft: '4px solid #06b6d4', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
              ADMINISTRADORES
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#06b6d4', marginTop: '4px' }}>
              {totalAdmins}
            </div>
          </div>

          {/* Card Total de Contas */}
          <div
            onClick={() => setStatusFilter('todos')}
            className="glass-card"
            style={{ padding: '16px', borderLeft: '4px solid #8b5cf6', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
              TOTAL DE CONTAS
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
              {totalUsers}
            </div>
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
            <option value="todos">Todos os Usuários ({totalUsers})</option>
            <option value="active">👤 Usuários ({totalRegularUsers})</option>
            <option value="admin">★ Administradores ({totalAdmins})</option>
          </select>

          <button onClick={loadData} className="btn btn-secondary btn-sm" title="Recarregar dados">
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Lista de Usuários */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: '260px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
              Carregando usuários...
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
              Nenhum usuário encontrado com esse filtro.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredProfiles.map((client) => {
                const isMasterAdmin =
                  client.email === 'adam.tv2004@gmail.com' ||
                  client.email === 'lucasadamdeveloper@gmail.com' ||
                  client.cpf === '00000000000';
                const isClientAdmin = Boolean(client.is_admin || isMasterAdmin);

                const cleanPhone = (client.phone || '').replace(/\D/g, '');
                const whatsappText = `Olá ${client.full_name || 'Amigo'}! Tudo bem? Sou o administrador do FinanTEMP's.`;

                const whatsappUrl = cleanPhone
                  ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(whatsappText)}`
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
                    {/* Dados do Usuário */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                          {client.full_name || 'Sem nome'}
                        </span>

                        {isClientAdmin && (
                          <span style={{ fontSize: '0.7rem', background: '#06b6d4', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                            ADMIN
                          </span>
                        )}

                        {client.followed_instagram ? (
                          <span style={{ fontSize: '0.7rem', background: 'rgba(225, 48, 108, 0.18)', color: '#e1306c', border: '1px solid rgba(225, 48, 108, 0.4)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Instagram size={11} /> Seguiu @adam404found
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-dim)', padding: '2px 6px', borderRadius: '4px' }}>
                            Não seguiu Insta
                          </span>
                        )}

                        <span className="badge badge-income" style={{ fontSize: '0.72rem' }}>
                          ✓ AUTORIZADO
                        </span>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {client.cpf && (
                          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                            CPF: {formatCPF(client.cpf)}
                          </span>
                        )}
                        <strong style={{ color: '#e2e8f0' }}>{client.email}</strong>
                        {client.phone && <span>• {client.phone}</span>}
                      </div>

                      {/* Último dia/horário de acesso e Data de Cadastro */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '6px', fontSize: '0.75rem' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: client.last_sign_in_at ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                            color: client.last_sign_in_at ? '#10b981' : 'var(--text-dim)',
                            border: `1px solid ${client.last_sign_in_at ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: 600,
                          }}
                        >
                          <CalendarCheck size={13} color={client.last_sign_in_at ? '#10b981' : 'var(--text-dim)'} />
                          <span>Último Acesso: <strong>{formatLastAccess(client.last_sign_in_at || client.updated_at)}</strong></span>
                        </div>
                        <span style={{ color: 'var(--text-dim)' }}>
                          Criado em: {formatDate(client.created_at?.split('T')[0])}
                        </span>
                      </div>
                    </div>

                    {/* Ações */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {/* Botão de WhatsApp */}
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#25D366', borderColor: 'rgba(37, 211, 102, 0.3)' }}
                          title="Avisar pelo WhatsApp"
                        >
                          <MessageCircle size={14} />
                        </a>
                      )}

                      {/* Alternar Admin (Proibido para conta mestre do dono) */}
                      {!isMasterAdmin && (
                        <button
                          type="button"
                          onClick={() => handleToggleAdmin(client.id, client.full_name || client.email, isClientAdmin)}
                          className="btn btn-secondary btn-sm"
                          title={isClientAdmin ? "Remover privilégio de Admin" : "Tornar Administrador"}
                        >
                          <UserCheck size={14} />
                          <span className="hide-mobile">{isClientAdmin ? 'Tirar Admin' : 'Dar Admin'}</span>
                        </button>
                      )}

                      {/* Botão de Excluir Usuário (Proibido para admin) */}
                      {!isClientAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(client.id, client.full_name || client.email)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            color: '#f43f5e',
                            borderColor: 'rgba(244, 63, 94, 0.35)',
                            background: 'rgba(244, 63, 94, 0.08)',
                          }}
                          title="Excluir este usuário e seus lançamentos permanentemente"
                        >
                          <Trash2 size={13} />
                          <span className="hide-mobile">Excluir</span>
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
