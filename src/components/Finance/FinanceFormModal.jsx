import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { X, Plus, Home, DollarSign, Sparkles, Briefcase, Repeat, Calendar, Check, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';

const CATEGORIES = {
  despesa_casa: [
    'Supermercado & Feira',
    'Contas (Luz/Água/Net/Gás)',
    'Aluguel / Condomínio',
    'Saúde & Farmácia',
    'Educação / Filhos',
    'Transporte / Combustível',
    'Lazer & Família',
    'Vestuário & Cuidados Pessoais',
    'Assinaturas & Streaming',
    'Outras Despesas',
  ],
  investimento: [
    'Ações & Fundos Imobiliários (FIIs)',
    'Renda Fixa / CDB / Tesouro Direto',
    'Criptomoedas / Bitcoin',
    'Reserva de Emergência / Poupança',
    'Previdência Privada',
    'Outros Investimentos',
  ],
  renda: [
    'Salário / Emprego Fixo',
    'Aposentadoria / Pensão',
    'Aluguel Recebido',
    'Pró-Labore Fixo',
    'Outra Renda Principal',
  ],
  renda_extra: [
    'Investimentos & Dividendos (Lucro)',
    'Vendas & Comissões',
    'Bicos & Freelances',
    'Serviços Prestados',
    'Prêmios & Bonificações',
    'Cashback / Reembolsos',
    'Presente / Doação',
    'Outra Renda Extra',
  ],
  negocio: [
    'Compra de Mercadorias / Estoque',
    'Embalagens & Materiais',
    'Ferramentas & Softwares',
    'Marketing & Anúncios',
    'Custos Operacionais',
    'Outros Gastos do Negócio',
  ],
};

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const FinanceFormModal = ({ isOpen, onClose }) => {
  const { addRecord, addRecords } = useFinance();

  const [formData, setFormData] = useState({
    type: 'despesa_casa',
    category: 'Supermercado & Feira',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [isRecurring, setIsRecurring] = useState(false);
  const [monthsCount, setMonthsCount] = useState(10);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      type,
      category: CATEGORIES[type]?.[0] || 'Geral',
    }));
  };

  // Cálculo da previsão de meses de repetição
  const getRecurrenceSummary = () => {
    if (!formData.date) return null;
    const [y, m, d] = formData.date.split('-').map(Number);
    const count = Math.min(Math.max(Number(monthsCount) || 1, 1), 60);

    const startDate = new Date(y, m - 1, 1);
    const startMonthName = MONTH_NAMES[startDate.getMonth()];
    const startYear = startDate.getFullYear();

    const endDate = new Date(y, m - 1 + (count - 1), 1);
    const endMonthName = MONTH_NAMES[endDate.getMonth()];
    const endYear = endDate.getFullYear();

    return {
      count,
      startText: `${startMonthName}/${startYear}`,
      endText: `${endMonthName}/${endYear}`,
      day: d,
    };
  };

  // Atalho para calcular meses até o fim do ano (Dezembro)
  const setUntilEndOfYear = () => {
    const [, m] = formData.date.split('-').map(Number);
    const monthsUntilDec = Math.max(12 - m + 1, 1);
    setMonthsCount(monthsUntilDec);
    setIsRecurring(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert('Por favor, digite um valor válido maior que zero.');
      return;
    }

    setLoading(true);
    let result;

    if (isRecurring && Number(monthsCount) > 1) {
      const count = Math.min(Math.max(Number(monthsCount) || 1, 2), 60);
      const [year, month, day] = formData.date.split('-').map(Number);
      const recordsToCreate = [];

      for (let i = 0; i < count; i++) {
        const target = new Date(year, month - 1 + i, 1);
        const targetYear = target.getFullYear();
        const targetMonth = target.getMonth();
        const maxDay = new Date(targetYear, targetMonth + 1, 0).getDate();
        const targetDay = Math.min(day, maxDay);
        const dateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;

        recordsToCreate.push({
          ...formData,
          date: dateStr,
          amount: Number(formData.amount),
          description: `${formData.description.trim()} (${i + 1}/${count})`,
          is_recurring: true,
        });
      }

      result = await addRecords(recordsToCreate);
    } else {
      result = await addRecord({
        ...formData,
        amount: Number(formData.amount),
      });
    }

    setLoading(false);

    if (result && !result.success && !result.localSaved) {
      alert('Atenção: Não foi possível salvar o lançamento: ' + (result.error || 'Erro desconhecido.'));
      return;
    }

    // Efeito de confete ao lançar renda ou receita
    if (formData.type === 'renda' || formData.type === 'renda_extra') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (err) {}
    }

    // Reset formulário
    setFormData({
      type: 'despesa_casa',
      category: 'Supermercado & Feira',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
    });
    setIsRecurring(false);
    setMonthsCount(10);

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Novo Lançamento</h3>
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

        {/* Seletor de Tipo com visual em abas/botões */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '18px' }}>
          <button
            type="button"
            className={`btn btn-sm ${formData.type === 'renda' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              background: formData.type === 'renda' ? 'rgba(16, 185, 129, 0.25)' : undefined,
              borderColor: formData.type === 'renda' ? '#10b981' : undefined,
              color: formData.type === 'renda' ? '#fff' : undefined,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 8px',
              fontWeight: 600,
            }}
            onClick={() => handleTypeChange('renda')}
          >
            <DollarSign size={15} color={formData.type === 'renda' ? '#10b981' : 'var(--text-dim)'} />
            <span>Renda Principal</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${formData.type === 'despesa_casa' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              background: formData.type === 'despesa_casa' ? 'rgba(244, 63, 94, 0.25)' : undefined,
              borderColor: formData.type === 'despesa_casa' ? '#f43f5e' : undefined,
              color: formData.type === 'despesa_casa' ? '#fff' : undefined,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 8px',
              fontWeight: 600,
            }}
            onClick={() => handleTypeChange('despesa_casa')}
          >
            <Home size={15} color={formData.type === 'despesa_casa' ? '#f43f5e' : 'var(--text-dim)'} />
            <span>Despesas</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${formData.type === 'renda_extra' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              background: formData.type === 'renda_extra' ? 'rgba(6, 182, 212, 0.25)' : undefined,
              borderColor: formData.type === 'renda_extra' ? '#06b6d4' : undefined,
              color: formData.type === 'renda_extra' ? '#fff' : undefined,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 8px',
              fontWeight: 600,
            }}
            onClick={() => handleTypeChange('renda_extra')}
          >
            <Sparkles size={15} color={formData.type === 'renda_extra' ? '#06b6d4' : 'var(--text-dim)'} />
            <span>Renda Extra</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${formData.type === 'negocio' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              background: formData.type === 'negocio' ? 'rgba(245, 158, 11, 0.25)' : undefined,
              borderColor: formData.type === 'negocio' ? '#f59e0b' : undefined,
              color: formData.type === 'negocio' ? '#fff' : undefined,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 8px',
              fontWeight: 600,
            }}
            onClick={() => handleTypeChange('negocio')}
          >
            <Briefcase size={15} color={formData.type === 'negocio' ? '#f59e0b' : 'var(--text-dim)'} />
            <span>Meu Negócio</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${formData.type === 'investimento' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              gridColumn: 'span 2',
              background: formData.type === 'investimento' ? 'rgba(139, 92, 246, 0.25)' : undefined,
              borderColor: formData.type === 'investimento' ? '#8b5cf6' : undefined,
              color: formData.type === 'investimento' ? '#fff' : undefined,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 8px',
              fontWeight: 600,
            }}
            onClick={() => handleTypeChange('investimento')}
          >
            <TrendingUp size={15} color={formData.type === 'investimento' ? '#a78bfa' : 'var(--text-dim)'} />
            <span>Investimentos</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="form-control"
              placeholder="0,00"
              style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Categoria</label>
            <select
              className="form-control"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {(CATEGORIES[formData.type] || []).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Descrição / Observação</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: Compras no Atacadão, Conta de luz, etc."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Data de Início</label>
            <input
              type="date"
              className="form-control"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          {/* Opção de Gasto Fixo / Recorrente por Meses */}
          <div
            style={{
              marginTop: '14px',
              marginBottom: '16px',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: isRecurring ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              border: isRecurring ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid var(--border-color)',
              transition: 'all 0.25s ease',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                userSelect: 'none',
                margin: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isRecurring ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isRecurring ? '#10b981' : 'var(--text-dim)',
                  }}
                >
                  <Repeat size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                    Gasto Fixo / Recorrente
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Repetir lançamento por múltiplos meses
                  </div>
                </div>
              </div>

              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: '#10b981',
                  cursor: 'pointer',
                }}
              />
            </label>

            {isRecurring && (
              <div
                style={{
                  marginTop: '14px',
                  paddingTop: '12px',
                  borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ margin: 0, fontSize: '0.82rem' }}>
                    Quantidade de Meses:
                  </label>
                  <button
                    type="button"
                    onClick={setUntilEndOfYear}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                    }}
                  >
                    Até Dezembro deste ano
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number"
                    min="2"
                    max="60"
                    className="form-control"
                    style={{ width: '90px', textAlign: 'center', fontWeight: 700, fontSize: '1.05rem' }}
                    value={monthsCount}
                    onChange={(e) => setMonthsCount(Math.max(1, Number(e.target.value)))}
                    required={isRecurring}
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>meses seguidos</span>
                </div>

                {/* Atalhos rápidos de meses */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {[3, 6, 10, 12, 24].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMonthsCount(m)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        border: Number(monthsCount) === m ? '1px solid #10b981' : '1px solid var(--border-color)',
                        background: Number(monthsCount) === m ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                        color: Number(monthsCount) === m ? '#fff' : 'var(--text-dim)',
                        cursor: 'pointer',
                      }}
                    >
                      {m} meses
                    </button>
                  ))}
                </div>

                {/* Preview em tempo real */}
                {(() => {
                  const summary = getRecurrenceSummary();
                  if (!summary) return null;
                  return (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '10px 12px',
                        background: 'rgba(0, 0, 0, 0.25)',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        color: '#d1fae5',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                      }}
                    >
                      <Calendar size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        Serão criados <strong>{summary.count} lançamentos mensais</strong> (dia {summary.day}) de{' '}
                        <strong style={{ color: '#34d399' }}>{summary.startText}</strong> até{' '}
                        <strong style={{ color: '#34d399' }}>{summary.endText}</strong>.
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
              <Plus size={16} />
              {loading ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
