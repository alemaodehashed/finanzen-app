import React, { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  X,
  PieChart,
  Calendar,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  Home,
  Zap,
  HeartPulse,
  GraduationCap,
  Car,
  Smile,
  Shirt,
  Tv,
  Briefcase,
  Layers,
  ArrowDownRight,
  TrendingDown
} from 'lucide-react';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Helper para escolher ícone por categoria
const getCategoryIcon = (category = '') => {
  const cat = category.toLowerCase();
  if (cat.includes('supermercado') || cat.includes('feira')) return <ShoppingBag size={18} color="#10b981" />;
  if (cat.includes('aluguel') || cat.includes('condomínio') || cat.includes('casa')) return <Home size={18} color="#3b82f6" />;
  if (cat.includes('contas') || cat.includes('luz') || cat.includes('água')) return <Zap size={18} color="#f59e0b" />;
  if (cat.includes('saúde') || cat.includes('farmácia')) return <HeartPulse size={18} color="#ef4444" />;
  if (cat.includes('educação') || cat.includes('filhos')) return <GraduationCap size={18} color="#8b5cf6" />;
  if (cat.includes('transporte') || cat.includes('combustível')) return <Car size={18} color="#06b6d4" />;
  if (cat.includes('lazer')) return <Smile size={18} color="#ec4899" />;
  if (cat.includes('vestuário')) return <Shirt size={18} color="#a855f7" />;
  if (cat.includes('streaming') || cat.includes('assinaturas')) return <Tv size={18} color="#6366f1" />;
  if (cat.includes('negócio') || cat.includes('mercadorias') || cat.includes('estoque')) return <Briefcase size={18} color="#f97316" />;
  if (cat.includes('ações') || cat.includes('fii') || cat.includes('investimento') || cat.includes('cdb') || cat.includes('tesouro') || cat.includes('poupança') || cat.includes('cripto') || cat.includes('previdência')) return <TrendingUp size={18} color="#8b5cf6" />;
  return <Layers size={18} color="#94a3b8" />;
};

export const CategoryBreakdownModal = ({
  isOpen,
  onClose,
  records,
  selectedMonth,
  selectedYear,
  onSelectMonth,
  onSelectYear,
}) => {
  if (!isOpen) return null;

  // 'mes' ou 'ano'
  const [periodType, setPeriodType] = useState('mes');
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Helper de data
  const parseDateParts = (dateStr) => {
    if (!dateStr) return { year: null, month: null };
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
      const parts = dateStr.split('-');
      return { year: Number(parts[0]), month: Number(parts[1]) };
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    }
    return { year: null, month: null };
  };

  // Filtra registros do período selecionado (despesas e investimentos)
  const filteredExpenses = records.filter((r) => {
    if (r.type !== 'despesa_casa' && r.type !== 'negocio' && r.type !== 'investimento') return false;
    const { year: y, month: m } = parseDateParts(r.date);
    if (!y || !m) return true;

    if (periodType === 'mes') {
      return y === selectedYear && m === selectedMonth + 1;
    }
    return y === selectedYear;
  });

  const totalDespesas = filteredExpenses.reduce((sum, r) => sum + Number(r.amount || 0), 0);

  // Agrupa por categoria
  const categoryGroups = filteredExpenses.reduce((acc, r) => {
    const cat = r.category || 'Outras Despesas';
    if (!acc[cat]) {
      acc[cat] = {
        category: cat,
        total: 0,
        count: 0,
        items: [],
      };
    }
    acc[cat].total += Number(r.amount || 0);
    acc[cat].count += 1;
    acc[cat].items.push(r);
    return acc;
  }, {});

  const sortedCategories = Object.values(categoryGroups).sort((a, b) => b.total - a.total);

  const toggleExpand = (cat) => {
    setExpandedCategory(expandedCategory === cat ? null : cat);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal-content"
        style={{
          maxWidth: '680px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          borderRadius: '16px',
        }}
      >
        {/* Cabeçalho do Modal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <PieChart size={20} color="var(--primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Gastos por Categoria
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '2px 0 0 0' }}>
                Detalhamento completo das suas despesas e para onde foi seu dinheiro
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-icon"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              padding: '6px',
              cursor: 'pointer',
              color: 'var(--text-dim)',
            }}
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Barra de Filtro: Mensal vs Anual */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '8px 14px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setPeriodType('mes')}
              className={`btn btn-sm ${periodType === 'mes' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.82rem', fontWeight: 700 }}
            >
              <Calendar size={13} /> Mensal ({MONTH_NAMES[selectedMonth]})
            </button>
            <button
              type="button"
              onClick={() => setPeriodType('ano')}
              className={`btn btn-sm ${periodType === 'ano' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.82rem', fontWeight: 700 }}
            >
              Anual ({selectedYear})
            </button>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Total Despesas:{' '}
            <strong style={{ color: '#f43f5e', fontSize: '1.05rem', fontWeight: 800 }}>
              {formatCurrency(totalDespesas)}
            </strong>
          </div>
        </div>

        {/* Lista de Categorias com Scroll */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sortedCategories.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 16px',
                color: 'var(--text-muted)',
              }}
            >
              <PieChart size={40} style={{ margin: '0 auto 12px', opacity: 0.35 }} />
              <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '6px' }}>
                Nenhuma despesa registrada
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-dim)', maxWidth: '360px', margin: '0 auto' }}>
                Não foram encontrados lançamentos de despesas no período selecionado (
                {periodType === 'mes'
                  ? `${MONTH_NAMES[selectedMonth]} de ${selectedYear}`
                  : `Ano de ${selectedYear}`}
                ).
              </p>
            </div>
          ) : (
            sortedCategories.map(({ category, total, count, items }) => {
              const percentage = totalDespesas > 0 ? (total / totalDespesas) * 100 : 0;
              const isExpanded = expandedCategory === category;

              return (
                <div
                  key={category}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Linha Principal da Categoria (Clicável para expandir) */}
                  <div
                    onClick={() => toggleExpand(category)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {getCategoryIcon(category)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>
                          {category}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                          {count} {count === 1 ? 'lançamento' : 'lançamentos'} • {percentage.toFixed(1)}% do total
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 800,
                          color: '#f43f5e',
                          letterSpacing: '-0.3px',
                        }}
                      >
                        {formatCurrency(total)}
                      </span>
                      <div style={{ color: 'var(--text-dim)' }}>
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </div>
                    </div>
                  </div>

                  {/* Barra de Progresso / Porcentagem */}
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      background: 'rgba(255, 255, 255, 0.07)',
                      borderRadius: '999px',
                      overflow: 'hidden',
                      marginTop: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, Math.max(0, percentage))}%`,
                        height: '100%',
                        background:
                          percentage > 35
                            ? 'linear-gradient(90deg, #f43f5e, #fb7185)'
                            : percentage > 15
                            ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                            : 'linear-gradient(90deg, #10b981, #06b6d4)',
                        borderRadius: '999px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>

                  {/* Lista detalhada dos lançamentos dentro desta categoria (quando expandida) */}
                  {isExpanded && (
                    <div
                      style={{
                        marginTop: '14px',
                        paddingTop: '12px',
                        borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Lançamentos detalhados:
                      </div>
                      {items.map((it) => (
                        <div
                          key={it.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            background: 'rgba(0, 0, 0, 0.25)',
                            borderRadius: '8px',
                            fontSize: '0.84rem',
                          }}
                        >
                          <div>
                            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                              {it.description || 'Sem descrição'}
                            </span>
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.76rem', marginLeft: '8px' }}>
                              {formatDate(it.date)}
                            </span>
                          </div>
                          <span style={{ color: '#f43f5e', fontWeight: 700 }}>
                            - {formatCurrency(it.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé do Modal */}
        <div
          style={{
            marginTop: '18px',
            paddingTop: '14px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '8px 18px' }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
