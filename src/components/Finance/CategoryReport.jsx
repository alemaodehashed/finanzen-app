import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { PieChart, TrendingDown, Home, Briefcase } from 'lucide-react';

export const CategoryReport = ({ records }) => {
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
        Nenhuma despesa registrada neste período.
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
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PieChart size={18} color="var(--primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
            Distribuição de Gastos por Categoria
          </h3>
        </div>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
          Total: <strong style={{ color: '#f43f5e' }}>{formatCurrency(totalExpense)}</strong>
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sortedCategories.map(({ category, total, percentage }) => (
          <div key={category}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                marginBottom: '4px',
              }}
            >
              <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                {category}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                {formatCurrency(total)}{' '}
                <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>
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
                  width: `${percentage}%`,
                  height: '100%',
                  background:
                    percentage > 35
                      ? 'linear-gradient(90deg, #f43f5e, #fb7185)'
                      : 'linear-gradient(90deg, #10b981, #06b6d4)',
                  borderRadius: '999px',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
