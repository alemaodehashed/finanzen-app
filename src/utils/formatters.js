export const formatCurrency = (val) => {
  const number = Number(val) || 0;
  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    if (typeof dateStr === 'string') {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const [y, m, d] = parts;
        return `${d.slice(0, 2)}/${m}/${y}`;
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return String(dateStr);
  } catch {
    return String(dateStr || '');
  }
};

export const generateId = (prefix = 'fin') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Formata string para máscara de CPF: 000.000.000-00
export const formatCPF = (val = '') => {
  const digits = String(val).replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

// Limpa CPF deixando apenas números
export const cleanCPF = (val = '') => {
  return String(val).replace(/\D/g, '').slice(0, 11);
};

// Valida tamanho mínimo do CPF
export const isValidCPF = (val = '') => {
  const digits = cleanCPF(val);
  if (digits.length !== 11) return false;
  // Rejeita sequências de números iguais
  if (/^(\d)\1{10}$/.test(digits)) return false;
  return true;
};

// Converte qualquer CPF de 11 dígitos em um UUID 100% válido no Postgres
export const cpfToUUID = (cpf = '') => {
  const digits = cleanCPF(cpf).padStart(12, '0');
  return `00000000-0000-0000-0000-${digits}`;
};

// Formata telefone: (00) 00000-0000 ou (00) 0000-0000
export const formatPhone = (val = '') => {
  const digits = String(val).replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
};
