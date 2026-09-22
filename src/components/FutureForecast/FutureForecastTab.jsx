import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import {
  TrendingUp,
  Target,
  ShieldCheck,
  PiggyBank,
  Sparkles,
  Save,
  CheckCircle2,
  Calendar,
  Clock,
  Compass,
  ArrowRight,
  Flame,
  Award,
  Zap,
  Info
} from 'lucide-react';

export const FutureForecastTab = ({ onOpenSettings }) => {
  const { profile, updateProfile } = useAuth();

  // Salário Mensal e Meta de Investimento
  const [salaryInput, setSalaryInput] = useState('');
  const [investmentGoalInput, setInvestmentGoalInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Carrega valores salvos no perfil
  useEffect(() => {
    if (profile) {
      const savedSalary =
        profile.settings?.monthly_salary ??
        profile.monthly_salary ??
        '';
      const savedGoal =
        profile.settings?.monthly_investment_goal ??
        profile.monthly_investment_goal ??
        '';

      setSalaryInput(savedSalary !== '' ? String(savedSalary) : '');
      setInvestmentGoalInput(savedGoal !== '' ? String(savedGoal) : '');
    }
  }, [profile]);

  const numericSalary = Number(salaryInput) || 0;
  const numericGoal = Number(investmentGoalInput) || 0;

  // 1. Meta da Liberdade Financeira = Salário * 100
  const freedomGoalAmount = numericSalary * 100;

  // 2. Aporte Mensal Recomendado = Salário * 0.20 (20%)
  const recommendedMonthlyContribution = numericSalary * 0.2;

  // 3. Reserva de Emergência = Salário * 6
  const emergencyFundAmount = numericSalary * 6;

  // Função para salvar no perfil e na nuvem
  const handleSavePlan = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updatedSettings = {
        ...(profile?.settings || {}),
        monthly_salary: numericSalary,
        monthly_investment_goal: numericGoal,
      };

      const { error } = await updateProfile({
        settings: updatedSettings,
        // Também salva no topo se existir
        savings_goal: freedomGoalAmount > 0 ? freedomGoalAmount : (profile?.savings_goal || 0),
      });

      if (!error) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      }
    } catch (err) {
      console.warn('Erro ao salvar planejamento:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Preencher automaticamente com o aporte recomendado de 20%
  const handleApplyRecommended = () => {
    const rec = Math.round(recommendedMonthlyContribution * 100) / 100;
    setInvestmentGoalInput(String(rec));
  };

  // Cálculo de Juros Compostos a 1% ao mês
  // FV = PMT * (( (1 + i)^n - 1 ) / i)
  const calculateCompoundInterest = (monthlyPmt, months) => {
    if (monthlyPmt <= 0 || months <= 0) {
      return { totalInvested: 0, totalEarned: 0, futureValue: 0, monthlyPassiveIncome: 0 };
    }
    const rate = 0.01; // 1% ao mês
    const fv = monthlyPmt * ((Math.pow(1 + rate, months) - 1) / rate);
    const totalInvested = monthlyPmt * months;
    const totalEarned = Math.max(0, fv - totalInvested);
    const monthlyPassiveIncome = fv * rate;

    return {
      totalInvested,
      totalEarned,
      futureValue: fv,
      monthlyPassiveIncome,
    };
  };

  const period5Years = calculateCompoundInterest(numericGoal, 5 * 12);
  const period10Years = calculateCompoundInterest(numericGoal, 10 * 12);
  const period20Years = calculateCompoundInterest(numericGoal, 20 * 12);
  const period30Years = calculateCompoundInterest(numericGoal, 30 * 12);

  // Estimativa de tempo para atingir a meta da liberdade (Salário * 100)
  const calculateMonthsToFreedom = () => {
    if (numericGoal <= 0 || freedomGoalAmount <= 0) return null;
    const rate = 0.01;
    // (1 + rate)^n = 1 + (freedomGoalAmount * rate) / numericGoal
    const targetRatio = 1 + (freedomGoalAmount * rate) / numericGoal;
    if (targetRatio <= 1) return 0;
    const months = Math.log(targetRatio) / Math.log(1 + rate);
    const totalMonths = Math.ceil(months);
    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;
    return { totalMonths, years, remainingMonths };
  };

  const timeToFreedom = calculateMonthsToFreedom();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      {/* Topo / Banner de Boas-Vindas */}
      <div
        className="glass-card"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.06) 50%, rgba(139, 92, 246, 0.08) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '8px',
                padding: '6px',
                color: 'var(--primary)',
                display: 'inline-flex',
              }}
            >
              <Compass size={22} />
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
              Previsão Futura & Liberdade Financeira
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '650px', margin: 0 }}>
            Descubra quanto você precisa acumular para viver de renda com o seu salário, calcule sua reserva de emergência e veja o poder multiplicador dos juros compostos a 1% ao mês.
          </p>
        </div>

        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.82rem' }}
          >
            Editar nas Configurações da Conta
          </button>
        )}
      </div>

      {/* Formulário Interativo: Salário e Meta de Investimento */}
      <div
        className="glass-card"
        style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Sparkles size={18} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: 0 }}>
            Seus Dados de Planejamento
          </h3>
        </div>

        <form onSubmit={handleSavePlan}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '18px',
              marginBottom: '20px',
            }}
          >
            {/* Campo 1: Salário Mensal */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '6px',
                }}
              >
                💵 Seu Salário / Renda Mensal (R$)
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 4450.00"
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: 600,
                    outline: 'none',
                    transition: 'var(--transition)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                Informe sua renda líquida mensal que cai na conta.
              </span>
            </div>

            {/* Campo 2: Meta de Investimento Mensal */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    margin: 0,
                  }}
                >
                  📈 Sua Meta de Investimento Mensal (Aporte R$)
                </label>
                {numericSalary > 0 && (
                  <button
                    type="button"
                    onClick={handleApplyRecommended}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0,
                    }}
                    title="Preencher com 20% do salário"
                  >
                    Usar 20% ({formatCurrency(recommendedMonthlyContribution)})
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 890.00"
                  value={investmentGoalInput}
                  onChange={(e) => setInvestmentGoalInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: 600,
                    outline: 'none',
                    transition: 'var(--transition)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                Quanto você se compromete a poupar e investir todo mês.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary"
              style={{ padding: '10px 24px', fontWeight: 700 }}
            >
              <Save size={16} />
              <span>{isSaving ? 'Salvando...' : 'Salvar Planejamento na Conta'}</span>
            </button>

            {saveSuccess && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#10b981',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={16} /> Salvo na sua conta com sucesso!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Os 3 Pilares Estratégicos Baseados no Salário */}
      <div>
        <div style={{ marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', margin: '0 0 4px 0' }}>
            🎯 Seus 3 Números Estratégicos
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            Métricas essenciais calculadas com base no seu salário de {formatCurrency(numericSalary)}:
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Card 1: Meta da Liberdade Financeira (Salário x 100) */}
          <div
            className="glass-card"
            style={{
              padding: '22px',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.1) 0%, rgba(18, 24, 38, 0.9) 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-15px',
                right: '-15px',
                width: '80px',
                height: '80px',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
                borderRadius: '50%',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: 'var(--primary)',
                  padding: '6px',
                  borderRadius: '8px',
                  display: 'inline-flex',
                }}
              >
                <Target size={18} />
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--primary)' }}>
                Meta da Liberdade (Salário × 100)
              </span>
            </div>

            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', marginBottom: '6px', letterSpacing: '-0.5px' }}>
              {formatCurrency(freedomGoalAmount)}
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0 }}>
              Acumulando esse valor a <strong>1% ao mês</strong>, os juros pagam exatamente <strong>100% do seu salário ({formatCurrency(numericSalary)})</strong> todo mês, sem você trabalhar!
            </p>
          </div>

          {/* Card 2: Aporte Mensal Recomendado (Salário x 0,2) */}
          <div
            className="glass-card"
            style={{
              padding: '22px',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.1) 0%, rgba(18, 24, 38, 0.9) 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  background: 'rgba(6, 182, 212, 0.2)',
                  color: 'var(--secondary)',
                  padding: '6px',
                  borderRadius: '8px',
                  display: 'inline-flex',
                }}
              >
                <PiggyBank size={18} />
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--secondary)' }}>
                Aporte Mensal Ideal (Salário × 0,20)
              </span>
            </div>

            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', marginBottom: '6px', letterSpacing: '-0.5px' }}>
              {formatCurrency(recommendedMonthlyContribution)}
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 500 }}> /mês</span>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0 }}>
              A clássica regra dos 20%: investindo este valor todos os meses você constrói a sua independência sem abrir mão da sua qualidade de vida atual.
            </p>
          </div>

          {/* Card 3: Reserva de Emergência (Salário x 6) */}
          <div
            className="glass-card"
            style={{
              padding: '22px',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.1) 0%, rgba(18, 24, 38, 0.9) 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#f59e0b',
                  padding: '6px',
                  borderRadius: '8px',
                  display: 'inline-flex',
                }}
              >
                <ShieldCheck size={18} />
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#f59e0b' }}>
                Reserva de Emergência (Salário × 6)
              </span>
            </div>

            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', marginBottom: '6px', letterSpacing: '-0.5px' }}>
              {formatCurrency(emergencyFundAmount)}
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0 }}>
              Equivalente a <strong>6 meses do seu salário</strong> guardados em renda fixa segura com liquidez imediata (CDB 100% CDI ou Tesouro Selic) para total tranquilidade.
            </p>
          </div>
        </div>
      </div>

      {/* Destaque: Tempo estimado para a liberdade com o aporte escolhido */}
      {timeToFreedom && (
        <div
          className="glass-card"
          style={{
            padding: '18px 24px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(16, 185, 129, 0.1))',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                background: 'rgba(139, 92, 246, 0.25)',
                color: '#a78bfa',
                padding: '10px',
                borderRadius: '12px',
                display: 'inline-flex',
              }}
            >
              <Clock size={24} />
            </span>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: '#a78bfa' }}>
                Tempo até a Liberdade Financeira Total
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                Aportando {formatCurrency(numericGoal)}/mês: você atinge sua meta em{' '}
                <span style={{ color: '#10b981' }}>
                  {timeToFreedom.years > 0 ? `${timeToFreedom.years} anos ` : ''}
                  {timeToFreedom.remainingMonths > 0 ? `e ${timeToFreedom.remainingMonths} meses` : ''}
                </span>!
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '8px 14px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
            }}
          >
            Meta: <strong>{formatCurrency(freedomGoalAmount)}</strong>
          </div>
        </div>
      )}

      {/* Projeções de Juros Compostos a 1% ao mês (5, 10, 20 e 30 anos) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', margin: '0 0 4px 0' }}>
              🚀 Projeção com Juros Compostos (1% ao mês)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Simulação de patrimônio acumulado com o aporte mensal de <strong>{formatCurrency(numericGoal)}</strong>:
            </p>
          </div>

          <span
            style={{
              fontSize: '0.78rem',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--primary)',
              padding: '4px 10px',
              borderRadius: '20px',
              fontWeight: 700,
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            Rentabilidade: 1,00% a.m. (~12,68% a.a.)
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {/* 5 Anos */}
          <ForecastCard
            years={5}
            months={60}
            data={period5Years}
            freedomGoal={freedomGoalAmount}
            accentColor="#10b981"
            badge="Início da Bola de Neve"
          />

          {/* 10 Anos */}
          <ForecastCard
            years={10}
            months={120}
            data={period10Years}
            freedomGoal={freedomGoalAmount}
            accentColor="#06b6d4"
            badge="Crescimento Acelerado"
          />

          {/* 20 Anos */}
          <ForecastCard
            years={20}
            months={240}
            data={period20Years}
            freedomGoal={freedomGoalAmount}
            accentColor="#8b5cf6"
            badge="Multiplicação Exponencial"
          />

          {/* 30 Anos */}
          <ForecastCard
            years={30}
            months={360}
            data={period30Years}
            freedomGoal={freedomGoalAmount}
            accentColor="#f59e0b"
            badge="Independência Geracional"
          />
        </div>
      </div>

      {/* Dica Educacional / Fórmula da Riqueza */}
      <div
        className="glass-card"
        style={{
          padding: '20px 24px',
          background: 'rgba(18, 24, 38, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
        }}
      >
        <Info size={22} style={{ color: 'var(--secondary)', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          <strong style={{ color: '#fff' }}>Como funcionam esses cálculos?</strong>
          <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
            <li>
              <strong>Meta da Liberdade (Salário × 100):</strong> quando você atinge 100 vezes o seu salário investido, a uma taxa de 1% ao mês os dividendos e juros geram exatamente 100% da sua renda atual todos os meses.
            </li>
            <li>
              <strong>Juros Compostos:</strong> note que ao longo do tempo, o valor gerado pelos <em>Juros (Lucro)</em> supera com folga o total que você tirou do próprio bolso. Esse é o efeito multiplicador dos juros sobre juros.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Componente do Card de Horizonte de Tempo (5, 10, 20 e 30 anos)
const ForecastCard = ({ years, months, data, freedomGoal, accentColor, badge }) => {
  const percentOfFreedom = freedomGoal > 0 ? Math.min(100, Math.round((data.futureValue / freedomGoal) * 100)) : 0;
  const isGoalAchieved = freedomGoal > 0 && data.futureValue >= freedomGoal;

  return (
    <div
      className="glass-card"
      style={{
        padding: '22px',
        border: `1px solid ${accentColor}33`,
        background: `linear-gradient(180deg, ${accentColor}0f 0%, rgba(18, 24, 38, 0.85) 100%)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.25s ease',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Calendar size={16} style={{ color: accentColor }} />
            {years} Anos ({months} meses)
          </span>

          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              background: `${accentColor}20`,
              color: accentColor,
              border: `1px solid ${accentColor}40`,
              padding: '2px 8px',
              borderRadius: '12px',
            }}
          >
            {badge}
          </span>
        </div>

        {/* Patrimônio Acumulado */}
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Patrimônio Total Acumulado
          </span>
          <div
            style={{
              fontSize: '1.65rem',
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-0.5px',
              marginTop: '2px',
            }}
          >
            {formatCurrency(data.futureValue)}
          </div>
        </div>

        {/* Divisão: Do Bolso vs Juros */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.25)',
            borderRadius: '10px',
            padding: '12px',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '0.8rem',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Investido do bolso:</span>
            <strong style={{ color: '#fff' }}>{formatCurrency(data.totalInvested)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Lucro em juros:</span>
            <strong style={{ color: '#10b981' }}>+ {formatCurrency(data.totalEarned)}</strong>
          </div>
        </div>

        {/* Renda Passiva Mensal a 1% */}
        <div
          style={{
            padding: '10px 12px',
            background: `${accentColor}15`,
            border: `1px solid ${accentColor}30`,
            borderRadius: '10px',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: accentColor, textTransform: 'uppercase' }}>
            Renda Passiva Mensal Estimada (1% a.m.)
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
            {formatCurrency(data.monthlyPassiveIncome)}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 500 }}> /mês</span>
          </div>
        </div>
      </div>

      {/* Barra de Progresso até a Meta da Liberdade */}
      {freedomGoal > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-dim)' }}>Progresso da Liberdade:</span>
            <span style={{ fontWeight: 700, color: isGoalAchieved ? '#10b981' : accentColor }}>
              {isGoalAchieved ? '🏆 100% Conquistado!' : `${percentOfFreedom}%`}
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${percentOfFreedom}%`,
                height: '100%',
                background: isGoalAchieved ? 'linear-gradient(90deg, #10b981, #06b6d4)' : accentColor,
                borderRadius: '4px',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
