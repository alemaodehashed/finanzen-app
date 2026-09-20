import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { generateId } from '../utils/formatters';

const FinanceContext = createContext();

const INITIAL_DEMO_RECORDS = [
  {
    id: 'fin_demo_1',
    date: new Date().toISOString().split('T')[0],
    type: 'renda',
    category: 'Salário / Emprego',
    description: 'Salário Mensal',
    amount: 3800,
  },
  {
    id: 'fin_demo_2',
    date: new Date().toISOString().split('T')[0],
    type: 'renda_extra',
    category: 'Vendas & Freelance',
    description: 'Trabalho Extra / Venda',
    amount: 650,
  },
  {
    id: 'fin_demo_3',
    date: new Date().toISOString().split('T')[0],
    type: 'despesa_casa',
    category: 'Supermercado',
    description: 'Compras do mês',
    amount: 1150,
  },
  {
    id: 'fin_demo_4',
    date: new Date().toISOString().split('T')[0],
    type: 'despesa_casa',
    category: 'Contas (Luz/Água/Net)',
    description: 'Energia e Internet',
    amount: 320,
  },
  {
    id: 'fin_demo_5',
    date: new Date().toISOString().split('T')[0],
    type: 'despesa_casa',
    category: 'Transporte / Combustível',
    description: 'Gasolina',
    amount: 220,
  },
];

export const FinanceProvider = ({ children }) => {
  const { user, isDemoMode } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carregar registros do usuário logado
  useEffect(() => {
    if (!user) {
      setRecords([]);
      setLoading(false);
      return;
    }

    const loadRecords = async () => {
      setLoading(true);

      if (isDemoMode || !supabase) {
        const saved = localStorage.getItem(`finanzen_records_${user.id}`);
        if (saved) {
          try {
            setRecords(JSON.parse(saved));
          } catch {
            setRecords(INITIAL_DEMO_RECORDS);
          }
        } else {
          setRecords(INITIAL_DEMO_RECORDS);
          localStorage.setItem(`finanzen_records_${user.id}`, JSON.stringify(INITIAL_DEMO_RECORDS));
        }
        setLoading(false);
        return;
      }

      // Busca do Supabase apenas os registros deste usuário (o RLS garante a segurança)
      try {
        const { data, error } = await supabase
          .from('finance_records')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) {
          console.error('Erro ao buscar lançamentos:', error);
        } else {
          setRecords(data || []);
        }
      } catch (err) {
        console.warn('Erro ao conectar com Supabase:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [user, isDemoMode]);

  // Adicionar lançamento
  const addRecord = async (recordData) => {
    if (!user) return null;

    const newRecord = {
      id: generateId('rec'),
      user_id: user.id,
      date: recordData.date || new Date().toISOString().split('T')[0],
      amount: Number(recordData.amount) || 0,
      type: recordData.type,
      category: recordData.category,
      description: recordData.description || '',
    };

    setRecords((prev) => [newRecord, ...prev]);

    if (isDemoMode || !supabase) {
      const updated = [newRecord, ...records];
      localStorage.setItem(`finanzen_records_${user.id}`, JSON.stringify(updated));
      return newRecord;
    }

    try {
      const { error } = await supabase.from('finance_records').insert({
        id: newRecord.id,
        user_id: user.id,
        date: newRecord.date,
        type: newRecord.type,
        category: newRecord.category,
        description: newRecord.description,
        amount: newRecord.amount,
      });

      if (error) {
        console.error('Erro ao salvar no Supabase:', error);
      }
    } catch (err) {
      console.warn('Erro de rede ao salvar lançamento:', err);
    }

    return newRecord;
  };

  // Deletar lançamento
  const deleteRecord = async (id) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));

    if (isDemoMode || !supabase) {
      if (user) {
        const updated = records.filter((r) => r.id !== id);
        localStorage.setItem(`finanzen_records_${user.id}`, JSON.stringify(updated));
      }
      return;
    }

    try {
      await supabase.from('finance_records').delete().eq('id', id);
    } catch (err) {
      console.warn('Erro ao deletar do Supabase:', err);
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        records,
        loading,
        addRecord,
        deleteRecord,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance deve ser usado dentro de FinanceProvider');
  }
  return context;
};
