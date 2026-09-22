import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  X,
  User,
  Phone,
  Target,
  Crown,
  Calendar,
  CheckCircle2,
  Save,
  Shield
} from 'lucide-react';

export const UserSettingsModal = ({ isOpen, onClose }) => {
  const { user, profile, updateProfile, getDaysRemainingInTrial } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setSavingsGoal(profile.savings_goal || '');
    }
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    const { error } = await updateProfile({
      full_name: fullName,
      phone: phone,
      savings_goal: Number(savingsGoal) || 0,
    });

    setSaving(false);
    if (!error) {
      setSuccessMsg('Configurações salvas com sucesso!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    } else {
      alert('Erro ao salvar configurações.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--primary-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={20} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Minha Conta & Preferências</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{user?.email}</p>
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
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Card de Acesso do Usuário */}
        {(() => {
          const isUserApproved =
            profile?.subscription_status === 'active' ||
            profile?.is_admin ||
            user?.email === 'adam.tv2004@gmail.com' ||
            user?.email === 'lucasadamdeveloper@gmail.com';
          return (
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: isUserApproved
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.12))'
                  : 'rgba(245, 158, 11, 0.12)',
                border: isUserApproved
                  ? '1px solid rgba(16, 185, 129, 0.3)'
                  : '1px solid rgba(245, 158, 11, 0.35)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color={isUserApproved ? '#10b981' : '#f59e0b'} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
                    {isUserApproved ? 'Acesso Autorizado' : 'Aguardando Aprovação'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {isUserApproved
                    ? 'Acesso liberado pelo administrador para uso completo'
                    : 'Aguardando liberação do administrador no painel'}
                </div>
              </div>
              <span
                className="badge badge-pro"
                style={{
                  background: isUserApproved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: isUserApproved ? '#10b981' : '#f59e0b',
                  border: isUserApproved ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                }}
              >
                {isUserApproved ? 'LIBERADO' : 'PENDENTE'}
              </span>
            </div>
          );
        })()}

        {successMsg && (
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
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nome Completo</label>
            <div style={{ position: 'relative' }}>
              <User
                size={18}
                style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }}
              />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '38px' }}
                placeholder="Seu nome"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Telefone / WhatsApp</label>
            <div style={{ position: 'relative' }}>
              <Phone
                size={18}
                style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }}
              />
              <input
                type="tel"
                className="form-control"
                style={{ paddingLeft: '38px' }}
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Meta Mensal de Economia (R$)</label>
            <div style={{ position: 'relative' }}>
              <Target
                size={18}
                style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }}
              />
              <input
                type="number"
                step="50"
                min="0"
                className="form-control"
                style={{ paddingLeft: '38px' }}
                placeholder="Ex: 500,00"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(e.target.value)}
              />
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Defina quanto quer economizar por mês para acompanhar sua barra de progresso no painel.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>
              <Save size={16} />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
