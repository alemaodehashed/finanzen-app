import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { PieChart, ArrowUpRight, Filter, Check } from 'lucide-react';

export const CategoryReport = ({
  records,
  onOpenBreakdown,
  selectedCategory,
  onSelectCategory,
}) => {
  // Apenas despesas (casa + negócio)
  const expenseRecords = records.filter(
    (r) => r.type === 'despesa_casa' || r.type === 'negocio'
  );

  const totalExpense = expenseRecords.reduce((sum, r) => sum + Number(r.amount || 0), 0);

  // Agrupar por categoria
  const categoryTotals = expenseRecords.reduce((acc, r) => {
    const cat = r.category || 'Outros';
    acc[cat] = (acc[cat] || 0) + Number(r.amount || 0);
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryTotals)
    .map(([category, total]) => ({
      category,
      total,
      percentage: totalExpense > 0 ? (total / totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  if (expenseRecords.length === 0) {
    return (
      <div
        className="glass-card"
        style={{
          padding: '24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.88rem',
        }}
      >
        <PieChart size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
        <div style={{ marginBottom: '12px' }}>Nenhuma despesa registrada neste período.</div>
        {onOpenBreakdown && (
          <button
            type="button"
            onClick={onOpenBreakdown}
            className="btn btn-secondary btn-sm"
            style={{
              fontSize: '0.78rem',
              padding: '6px 14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <PieChart size={13} />
            <span>Ver Categorias de Gastos</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PieChart size={18} color="var(--primary)" />
          <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff', margin: 0 }}>
            Gastos por Categoria
          </h3>
        </div>

        {onOpenBreakdown && (
          <button
            type="button"
            onClick={onOpenBreakdown}
            className="btn-link"
            style={{
              fontSize: '0.78rem',
              color: 'var(--primary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600,
              padding: 0,
            }}
          >
            <span>Ver Detalhado</span>
            <ArrowUpRight size={14} />
          </button>
        )}
      </div>

      {selectedCategory && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '6px 12px',
            marginBottom: '12px',
            fontSize: '0.78rem',
            color: '#10b981',
          }}
        >
          <span>Filtrando extrato por: <strong>{selectedCategory}</strong></span>
          <button
            type="button"
            onClick={() => onSelectCategory && onSelectCategory(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.78rem',
            }}
          >
            Limpar
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sortedCategories.map(({ category, total, percentage }) => {
          const isSelected = selectedCategory === category;
          return (
            <div
              key={category}
              onClick={() => onSelectCategory && onSelectCategory(isSelected ? null : category)}
              style={{
                cursor: onSelectCategory ? 'pointer' : 'default',
                padding: '6px 8px',
                borderRadius: '8px',
                background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                transition: 'all 0.15s ease',
              }}
              title={onSelectCategory ? 'Clique para filtrar lançamentos desta categoria' : ''}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.84rem',
                  marginBottom: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isSelected && <Check size={14} color="var(--primary)" />}
                  <span style={{ color: isSelected ? '#fff' : 'var(--text-main)', fontWeight: isSelected ? 700 : 500 }}>
                    {category}
                  </span>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>
                  <strong style={{ color: '#f43f5e' }}>{formatCurrency(total)}</strong>{' '}
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                    ({percentage.toFixed(1)}%)
                  </span>
                </span>
              </div>

              {/* Barra de progresso */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '999px',
                  overflow: 'hidden',
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
            </div>
          );
        })}
      </div>
    </div>
  );
};
