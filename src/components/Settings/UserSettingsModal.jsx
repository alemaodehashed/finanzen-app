import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { formatCPF } from '../../utils/formatters';
import {
  X,
  User,
  Phone,
  Target,
  CheckCircle2,
  Save,
  Lock,
  Eye,
  EyeOff,
  Cloud,
  RefreshCw,
  AlertCircle,
  KeyRound,
  DollarSign,
  TrendingUp
} from 'lucide-react';

export const UserSettingsModal = ({ isOpen, onClose }) => {
  const { user, profile, updateProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');
  const [monthlySalary, setMonthlySalary] = useState('');
  const [monthlyInvestmentGoal, setMonthlyInvestmentGoal] = useState('');
  
  // Troca de Senha
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState({ msg: '', type: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  // Status do Salvamento Automático: 'idle' | 'saving' | 'saved' | 'error'
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  const [lastSavedTime, setLastSavedTime] = useState(null);

  const debounceTimerRef = useRef(null);
  const isLoadedRef = useRef(false);

  // Carrega os dados do perfil quando o modal abre ou quando o perfil é alterado
  useEffect(() => {
    if (profile && isOpen) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      const initialGoal = profile.savings_goal ?? profile.settings?.freedom_goal;
      setSavingsGoal(initialGoal !== undefined && initialGoal !== null && Number(initialGoal) > 0 ? String(initialGoal) : '');
      setMonthlySalary(profile.settings?.monthly_salary !== undefined && profile.settings?.monthly_salary !== null ? String(profile.settings.monthly_salary) : '');
      setMonthlyInvestmentGoal(profile.settings?.monthly_investment_goal !== undefined && profile.settings?.monthly_investment_goal !== null ? String(profile.settings.monthly_investment_goal) : '');
      setNewPassword('');
      setPasswordFeedback({ msg: '', type: '' });
      setAutoSaveStatus('saved');
      // Pequeno delay para evitar disparar auto-save na montagem
      setTimeout(() => {
        isLoadedRef.current = true;
      }, 300);
    }
    return () => {
      isLoadedRef.current = false;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [profile, isOpen]);

  // Função central de salvamento imediato no Supabase e LocalStorage
  const saveUserData = useCallback(async (overrides = {}) => {
    const rawGoal = overrides.savingsGoal !== undefined ? overrides.savingsGoal : savingsGoal;
    const goalVal = Number(rawGoal) || 0;
    const salaryVal = Number(overrides.monthlySalary !== undefined ? overrides.monthlySalary : monthlySalary) || 0;
    const investVal = Number(overrides.monthlyInvestmentGoal !== undefined ? overrides.monthlyInvestmentGoal : monthlyInvestmentGoal) || 0;

    const dataToSave = {
      full_name: overrides.fullName !== undefined ? overrides.fullName : fullName,
      phone: overrides.phone !== undefined ? overrides.phone : phone,
      savings_goal: goalVal,
      settings: {
        ...(profile?.settings || {}),
        freedom_goal: goalVal,
        monthly_salary: salaryVal,
        monthly_investment_goal: investVal,
      },
    };

    setAutoSaveStatus('saving');

    try {
      const { error } = await updateProfile(dataToSave);
      if (!error) {
        setAutoSaveStatus('saved');
        setLastSavedTime(new Date());
      } else {
        setAutoSaveStatus('error');
      }
    } catch (err) {
      console.warn('Erro no salvamento automático:', err);
      setAutoSaveStatus('error');
    }
  }, [fullName, phone, savingsGoal, monthlySalary, monthlyInvestmentGoal, profile?.settings, updateProfile]);

  // Agenda salvamento automático com debounce de 700ms ao digitar
  const triggerDebouncedAutoSave = useCallback((newValues = {}) => {
    if (!isLoadedRef.current) return;
    setAutoSaveStatus('saving');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      saveUserData(newValues);
    }, 700);
  }, [saveUserData]);

  // Ao perder o foco (onBlur) de qualquer campo, salva imediatamente sem delay
  const handleBlur = (fieldName, value) => {
    if (!isLoadedRef.current) return;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    saveUserData({ [fieldName]: value });
  };

  // Trocar senha de acesso
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordFeedback({
        msg: 'A nova senha deve ter no mínimo 6 caracteres.',
        type: 'error'
      });
      return;
    }

    setSavingPassword(true);
    setPasswordFeedback({ msg: '', type: '' });

    try {
      const { error } = await updateProfile({ password: newPassword });
      if (!error) {
        setPasswordFeedback({
          msg: 'Senha atualizada com sucesso na nuvem!',
          type: 'success'
        });
        setNewPassword('');
        setAutoSaveStatus('saved');
      } else {
        setPasswordFeedback({
          msg: 'Erro ao atualizar senha. Tente novamente.',
          type: 'error'
        });
      }
    } catch (err) {
      setPasswordFeedback({
        msg: 'Erro de conexão ao atualizar senha.',
        type: 'error'
      });
    } finally {
      setSavingPassword(false);
    }
  };

  // Fechar garantindo que qualquer alteração pendente seja salva
  const handleClose = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      saveUserData();
    }
    onClose();
  };

  if (!isOpen) return null;

  const isUserApproved =
    profile?.subscription_status === 'active' ||
    profile?.is_admin ||
    user?.email === 'adam.tv2004@gmail.com' ||
    user?.email === 'lucasadamdeveloper@gmail.com';

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '28px', maxWidth: '520px' }}>
        {/* Cabeçalho com Status de Salvamento em Tempo Real */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'var(--primary-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)',
              }}
            >
              <User size={22} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Minha Conta & Preferências</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                {user?.email || (user?.cpf && formatCPF(user.cpf)) || 'Conta Usuário'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
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

        {/* Indicador Flutuante de Salvamento Automático */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            background:
              autoSaveStatus === 'saving'
                ? 'rgba(6, 182, 212, 0.12)'
                : autoSaveStatus === 'error'
                ? 'rgba(239, 68, 68, 0.12)'
                : 'rgba(16, 185, 129, 0.1)',
            border:
              autoSaveStatus === 'saving'
                ? '1px solid rgba(6, 182, 212, 0.3)'
                : autoSaveStatus === 'error'
                ? '1px solid rgba(239, 68, 68, 0.3)'
                : '1px solid rgba(16, 185, 129, 0.25)',
            marginBottom: '16px',
            fontSize: '0.8rem',
            transition: 'all 0.3s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            {autoSaveStatus === 'saving' && (
              <>
                <RefreshCw size={14} color="#06b6d4" className="spin" />
                <span style={{ color: '#06b6d4', fontWeight: 600 }}>Salvando alterações na nuvem...</span>
              </>
            )}
            {autoSaveStatus === 'saved' && (
              <>
                <CheckCircle2 size={14} color="#10b981" />
                <span style={{ color: '#10b981', fontWeight: 600 }}>Salvo automaticamente na Nuvem</span>
              </>
            )}
            {autoSaveStatus === 'error' && (
              <>
                <AlertCircle size={14} color="#ef4444" />
                <span style={{ color: '#ef4444', fontWeight: 600 }}>Salvo no dispositivo (reconectando nuvem...)</span>
              </>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-dim)', fontSize: '0.72rem' }}>
            <Cloud size={12} />
            <span>Sincronização Ativa</span>
          </div>
        </div>

        {/* Card de Status da Conta */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.08))',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={15} color="#10b981" />
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff' }}>
                Conta Ativa & Autorizada
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Sua conta e finanças são salvas e sincronizadas em nuvem com segurança
            </div>
          </div>
          <span
            className="badge badge-pro"
            style={{
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              fontSize: '0.7rem',
              padding: '3px 8px',
            }}
          >
            LIBERADO
          </span>
        </div>

        {/* Formulário de Dados Pessoais com Salvamento Automático */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>
              Nome Completo
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={17}
                style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }}
              />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '38px' }}
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  triggerDebouncedAutoSave({ fullName: e.target.value });
                }}
                onBlur={(e) => handleBlur('fullName', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>
              Telefone / WhatsApp
            </label>
            <div style={{ position: 'relative' }}>
              <Phone
                size={17}
                style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }}
              />
              <input
                type="tel"
                className="form-control"
                style={{ paddingLeft: '38px' }}
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  triggerDebouncedAutoSave({ phone: e.target.value });
                }}
                onBlur={(e) => handleBlur('phone', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>
              Meta de Liberdade Financeira / Economia (R$)
            </label>
            <div style={{ position: 'relative' }}>
              <Target
                size={17}
                style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }}
              />
              <input
                type="number"
                step="100"
                min="0"
                className="form-control"
                style={{ paddingLeft: '38px' }}
                placeholder="Ex: 1000000"
                value={savingsGoal}
                onChange={(e) => {
                  setSavingsGoal(e.target.value);
                  triggerDebouncedAutoSave({ savingsGoal: e.target.value });
                }}
                onBlur={(e) => handleBlur('savingsGoal', e.target.value)}
              />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Sincroniza instantaneamente com a Meta da Previsão Futura e com o painel do aplicativo.
            </div>
          </div>

          {/* Salário Mensal para Previsão Futura */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>
              Salário / Renda Mensal (R$)
            </label>
            <div style={{ position: 'relative' }}>
              <DollarSign
                size={17}
                style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }}
              />
              <input
                type="number"
                step="50"
                min="0"
                className="form-control"
                style={{ paddingLeft: '38px' }}
                placeholder="Ex: 4450,00"
                value={monthlySalary}
                onChange={(e) => {
                  setMonthlySalary(e.target.value);
                  triggerDebouncedAutoSave({ monthlySalary: e.target.value });
                }}
                onBlur={(e) => handleBlur('monthlySalary', e.target.value)}
              />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Usado para calcular sua Meta de Liberdade (Salário × 100) e Reserva de Emergência.
            </div>
          </div>

          {/* Meta de Investimento Mensal (Aporte) */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>
              Meta de Investimento Mensal (Aporte R$)
            </label>
            <div style={{ position: 'relative' }}>
              <TrendingUp
                size={17}
                style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }}
              />
              <input
                type="number"
                step="50"
                min="0"
                className="form-control"
                style={{ paddingLeft: '38px' }}
                placeholder="Ex: 890,00"
                value={monthlyInvestmentGoal}
                onChange={(e) => {
                  setMonthlyInvestmentGoal(e.target.value);
                  triggerDebouncedAutoSave({ monthlyInvestmentGoal: e.target.value });
                }}
                onBlur={(e) => handleBlur('monthlyInvestmentGoal', e.target.value)}
              />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Base para a simulação de juros compostos a 1% a.m. na aba Previsão Futura.
            </div>
          </div>

          {/* Seção de Troca de Senha */}
          <div
            style={{
              marginTop: '8px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <KeyRound size={15} color="var(--primary)" />
              <label className="form-label" style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700 }}>
                Alterar Senha de Acesso
              </label>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Lock
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: '36px', paddingRight: '36px', fontSize: '0.88rem' }}
                  placeholder="Nova senha (mín. 6 dígitos)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleUpdatePassword}
                disabled={savingPassword || !newPassword || newPassword.length < 6}
                className="btn btn-primary btn-sm"
                style={{
                  whiteSpace: 'nowrap',
                  padding: '0 14px',
                  opacity: (!newPassword || newPassword.length < 6) ? 0.5 : 1,
                }}
              >
                {savingPassword ? 'Salvando...' : 'Atualizar'}
              </button>
            </div>

            {passwordFeedback.msg && (
              <div
                style={{
                  marginTop: '8px',
                  fontSize: '0.78rem',
                  color: passwordFeedback.type === 'success' ? '#10b981' : '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                {passwordFeedback.type === 'success' ? (
                  <CheckCircle2 size={13} />
                ) : (
                  <AlertCircle size={13} />
                )}
                <span>{passwordFeedback.msg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Botão de Fechar Concluído */}
        <div style={{ marginTop: '22px' }}>
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <CheckCircle2 size={16} />
            Concluir & Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
