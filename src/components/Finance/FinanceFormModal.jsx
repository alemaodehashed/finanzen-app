import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { X, Plus, Home, DollarSign, Sparkles, Briefcase } from 'lucide-react';
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
    'Outras Despesas de Casa',
  ],
  renda: [
    'Salário / Emprego Fixo',
    'Aposentadoria / Pensão',
    'Aluguel Recebido',
    'Pró-Labore Fixo',
    'Investimentos / Dividendos',
    'Outra Renda Principal',
  ],
  renda_extra: [
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

export const FinanceFormModal = ({ isOpen, onClose }) => {
  const { addRecord } = useFinance();

  const [formData, setFormData] = useState({
    type: 'despesa_casa',
    category: 'Supermercado & Feira',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      type,
      category: CATEGORIES[type]?.[0] || 'Geral',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert('Por favor, digite um valor válido maior que zero.');
      return;
    }

    setLoading(true);
    await addRecord({
      ...formData,
      amount: Number(formData.amount),
    });
    setLoading(false);

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
            className={`btn btn-sm ${formData.type === 'despesa_casa' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              background: formData.type === 'despesa_casa' ? 'rgba(244, 63, 94, 0.25)' : undefined,
              borderColor: formData.type === 'despesa_casa' ? '#f43f5e' : undefined,
              color: formData.type === 'despesa_casa' ? '#fff' : undefined,
            }}
            onClick={() => handleTypeChange('despesa_casa')}
          >
            <Home size={14} /> Despesa de Casa
          </button>

          <button
            type="button"
            className={`btn btn-sm ${formData.type === 'renda' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleTypeChange('renda')}
          >
            <DollarSign size={14} /> Salário / Renda
          </button>

          <button
            type="button"
            className={`btn btn-sm ${formData.type === 'renda_extra' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              background: formData.type === 'renda_extra' ? 'rgba(6, 182, 212, 0.25)' : undefined,
              borderColor: formData.type === 'renda_extra' ? '#06b6d4' : undefined,
              color: formData.type === 'renda_extra' ? '#fff' : undefined,
            }}
            onClick={() => handleTypeChange('renda_extra')}
          >
            <Sparkles size={14} /> Renda Extra
          </button>

          <button
            type="button"
            className={`btn btn-sm ${formData.type === 'negocio' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              background: formData.type === 'negocio' ? 'rgba(245, 158, 11, 0.25)' : undefined,
              borderColor: formData.type === 'negocio' ? '#f59e0b' : undefined,
              color: formData.type === 'negocio' ? '#fff' : undefined,
            }}
            onClick={() => handleTypeChange('negocio')}
          >
            <Briefcase size={14} /> Meu Negócio
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
            <label className="form-label">Data</label>
            <input
              type="date"
              className="form-control"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
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
