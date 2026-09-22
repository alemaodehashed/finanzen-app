import { formatCurrency, formatDate } from './formatters';

export const exportToCSV = (records, filename = 'relatorio_financeiro.csv') => {
  if (!records || records.length === 0) {
    alert('Não há registros para exportar.');
    return;
  }

  const headers = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor (R$)'];
  const typeLabels = {
    renda: 'Renda Principal',
    despesa_casa: 'Despesas',
    renda_extra: 'Renda Extra',
    negocio: 'Meu Negócio',
    investimento: 'Investimentos',
  };

  const rows = records.map((r) => [
    formatDate(r.date),
    typeLabels[r.type] || r.type,
    `"${(r.category || '').replace(/"/g, '""')}"`,
    `"${(r.description || '').replace(/"/g, '""')}"`,
    Number(r.amount || 0).toFixed(2).replace('.', ','),
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const printReport = () => {
  window.print();
};
