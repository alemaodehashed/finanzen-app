import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Wallet,
  Plus,
  Home,
  TrendingDown,
  TrendingUp,
  Trash2,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  DollarSign,
  Filter
} from 'lucide-react';
import { CategoryReport } from './CategoryReport';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const FinanceDashboard = ({ onOpenNewModal }) => {
  const { records, deleteRecord } = useFinance();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [viewMode, setViewMode] = useState('mes'); // 'mes', 'ano', 'todos'
  const [filterType, setFilterType] = useState('todos');

  // Filtragem por período
  const periodRecords = records.filter((r) => {
    if (!r.date) return false;
    const [y, m] = r.date.split('-').map(Number);
    if (viewMode === 'mes') {
      return y === selectedYear && m === selectedMonth + 1;
    }
    if (viewMode === 'ano') {
      return y === selectedYear;
    }
    return true;
  });

  // Filtragem por tipo
  const displayRecords = periodRecords.filter((r) => {
    if (filterType === 'todos') return true;
    return r.type === filterType;
  });

  // Cálculos
  const totalRendaPrincipal = periodRecords
    .filter((r) => r.type === 'renda')
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const totalRendaExtra = periodRecords
    .filter((r) => r.type === 'renda_extra')
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const totalDespesaCasa = periodRecords
    .filter((r) => r.type === 'despesa_casa')
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const totalNegocio = periodRecords
    .filter((r) => r.type === 'negocio')
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const totalEntradas = totalRendaPrincipal + totalRendaExtra;
  const totalSaidas = totalDespesaCasa + totalNegocio;
  const saldoFinal = totalEntradas - totalSaidas;
  const taxaPoupanca = totalEntradas > 0 ? ((saldoFinal / totalEntradas) * 100) : 0;

  // Navegação de mês
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  return (
    <div>
      {/* Barra de Topo do Dashboard */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Visão Geral Financeira
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Controle suas contas, salários e veja exatamente para onde vai seu dinheiro
          </p>
        </div>

        <button onClick={onOpenNewModal} className="btn btn-primary" style={{ padding: '12px 20px' }}>
          <Plus size={18} />
          <span>Novo Lançamento</span>
        </button>
      </div>

      {/* Seletor de Período */}
      <div
        className="glass-card"
        style={{
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Modos: Mensal, Anual, Histórico */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(0, 0, 0, 0.25)', padding: '4px', borderRadius: '10px' }}>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'mes' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('mes')}
          >
            <Calendar size={14} /> Mensal
          </button>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'ano' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('ano')}
          >
            Anual
          </button>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'todos' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('todos')}
          >
            Tudo
          </button>
        </div>

        {/* Navegador de Mês */}
        {viewMode === 'mes' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={handlePrevMonth} className="btn btn-secondary btn-sm" style={{ padding: '6px 8px' }}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', minWidth: '140px', textAlign: 'center' }}>
              {MONTHS[selectedMonth]} {selectedYear}
            </span>
            <button onClick={handleNextMonth} className="btn btn-secondary btn-sm" style={{ padding: '6px 8px' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {viewMode === 'ano' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => setSelectedYear((y) => y - 1)} className="btn btn-secondary btn-sm">
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>Ano de {selectedYear}</span>
            <button onClick={() => setSelectedYear((y) => y + 1)} className="btn btn-secondary btn-sm">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Cards de Métricas Principais */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Total Entradas */}
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              RECEITAS (ENTRADAS)
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--income-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={16} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>
            {formatCurrency(totalEntradas)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Fixo: {formatCurrency(totalRendaPrincipal)} | Extra: {formatCurrency(totalRendaExtra)}
          </div>
        </div>

        {/* Total Despesas */}
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #f43f5e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              DESPESAS (SAÍDAS)
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--expense-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingDown size={16} color="#f43f5e" />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f43f5e' }}>
            {formatCurrency(totalSaidas)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Casa: {formatCurrency(totalDespesaCasa)} | Negócio: {formatCurrency(totalNegocio)}
          </div>
        </div>

        {/* Saldo Líquido */}
        <div
          className="glass-card"
          style={{
            padding: '20px',
            borderLeft: `4px solid ${saldoFinal >= 0 ? '#10b981' : '#f43f5e'}`,
            background: saldoFinal >= 0 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              SALDO LÍQUIDO
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: saldoFinal >= 0 ? 'var(--income-bg)' : 'var(--expense-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Wallet size={16} color={saldoFinal >= 0 ? '#10b981' : '#f43f5e'} />
            </div>
          </div>
          <div
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: saldoFinal >= 0 ? '#10b981' : '#f43f5e',
            }}
          >
            {formatCurrency(saldoFinal)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            {saldoFinal >= 0
              ? `Economia de ${taxaPoupanca.toFixed(1)}% das receitas`
              : 'Atenção: Gastos superaram as receitas no período'}
          </div>
        </div>
      </div>

      {/* Grid: Gráfico de Categorias e Lista de Lançamentos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Coluna 1: Relatório por Categorias */}
        <div>
          <CategoryReport records={periodRecords} />
        </div>

        {/* Coluna 2: Lista de Lançamentos */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
              Extrato ({displayRecords.length})
            </h3>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <select
                className="form-control"
                style={{ padding: '4px 10px', fontSize: '0.8rem', width: 'auto' }}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="todos">Todos os Tipos</option>
                <option value="despesa_casa">Despesas de Casa</option>
                <option value="renda">Salário Fixo</option>
                <option value="renda_extra">Renda Extra</option>
                <option value="negocio">Negócio Próprio</option>
              </select>
            </div>
          </div>

          {/* Lista de Registros */}
          {displayRecords.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '32px 16px',
                color: 'var(--text-dim)',
                fontSize: '0.88rem',
              }}
            >
              Nenhum lançamento encontrado neste período.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '480px', overflowY: 'auto' }}>
              {displayRecords.map((item) => {
                const isExpense = item.type === 'despesa_casa' || item.type === 'negocio';
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      transition: 'var(--transition)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: isExpense ? 'var(--expense-bg)' : 'var(--income-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {isExpense ? (
                          <Home size={16} color="#f43f5e" />
                        ) : (
                          <DollarSign size={16} color="#10b981" />
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>
                          {item.description}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                          {item.category} • {formatDate(item.date)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: isExpense ? '#f43f5e' : '#10b981',
                        }}
                      >
                        {isExpense ? '-' : '+'} {formatCurrency(item.amount)}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm(`Deseja excluir "${item.description}"?`)) {
                            deleteRecord(item.id);
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-dim)',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                        title="Excluir"
                      >
                        <Trash2 size={15} />
                      </button>
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
