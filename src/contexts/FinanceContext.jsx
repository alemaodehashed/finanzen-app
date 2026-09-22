import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { generateId } from '../utils/formatters';

const FinanceContext = createContext();

const isValidUUID = (id) => {
  return Boolean(
    id &&
    typeof id === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  );
};

const INITIAL_DEMO_RECORDS = [
  {
    id: 'fin_demo_1',
    date: new Date().toISOString().split('T')[0],
    type: 'renda',
    category: 'Salário / Emprego Fixo',
    description: 'Salário Mensal',
    amount: 3800,
  },
  {
    id: 'fin_demo_2',
    date: new Date().toISOString().split('T')[0],
    type: 'renda_extra',
    category: 'Vendas & Comissões',
    description: 'Trabalho Extra / Venda',
    amount: 650,
  },
  {
    id: 'fin_demo_3',
    date: new Date().toISOString().split('T')[0],
    type: 'despesa_casa',
    category: 'Supermercado & Feira',
    description: 'Compras do mês',
    amount: 1150,
  },
  {
    id: 'fin_demo_4',
    date: new Date().toISOString().split('T')[0],
    type: 'despesa_casa',
    category: 'Contas (Luz/Água/Net/Gás)',
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
  // 'synced' | 'local' | 'error' | 'syncing'
  const [syncStatus, setSyncStatus] = useState('local');
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const getStorageKey = useCallback((u) => {
    if (!u) return 'finanzen_records_guest';
    const cleanUserCpf = u.cpf ? String(u.cpf).replace(/\D/g, '') : '';
    return `finanzen_records_${cleanUserCpf || u.id || u.email || 'user'}`;
  }, []);

  const storageKey = getStorageKey(user);

  // Carregar lançamentos do usuário com sincronização bidirecional em nuvem
  const loadRecords = useCallback(async (isSilent = false) => {
    if (!user) {
      // Carrega registros de convidado se existirem
      try {
        const guestSaved = localStorage.getItem('finanzen_records_guest');
        if (guestSaved) {
          setRecords(JSON.parse(guestSaved));
        } else {
          setRecords([]);
        }
      } catch (e) {
        setRecords([]);
      }
      if (!isSilent) setLoading(false);
      setSyncStatus('local');
      return;
    }

    if (!isSilent) setLoading(true);

    // 1. Carrega imediatamente do cache local para renderização instantânea
    let localRecords = [];
    try {
      let saved = localStorage.getItem(storageKey);
      const cleanUserCpf = user.cpf ? String(user.cpf).replace(/\D/g, '') : '';
      
      // Checa chaves legadas e alternativas para não perder nada do usuário
      if (!saved && cleanUserCpf) {
        saved = localStorage.getItem(`finanzen_records_${cleanUserCpf}`);
      }
      if (!saved && user.id) {
        saved = localStorage.getItem(`finanzen_records_${user.id}`);
      }
      if (!saved && user.email) {
        saved = localStorage.getItem(`finanzen_records_${user.email.toLowerCase()}`);
      }
      // Migração de chaves legadas do admin
      if (!saved && (cleanUserCpf === '11657245969' || user.email?.toLowerCase().includes('lucasadam'))) {
        saved = localStorage.getItem('finanzen_records_00000000-0000-0000-0000-000000000001');
      }

      // Migração automática se havia registros cadastrados como visitante
      const guestSaved = localStorage.getItem('finanzen_records_guest');
      let guestRecords = [];
      if (guestSaved) {
        try {
          guestRecords = JSON.parse(guestSaved);
          if (Array.isArray(guestRecords) && guestRecords.length > 0) {
            localStorage.removeItem('finanzen_records_guest');
          }
        } catch (e) {}
      }

      if (saved) {
        localRecords = JSON.parse(saved);
      } else if (guestRecords.length > 0) {
        localRecords = guestRecords;
      } else if (isDemoMode || !supabase) {
        localRecords = INITIAL_DEMO_RECORDS;
      }

      // Se havia registros de visitante, mescla com os locais
      if (guestRecords.length > 0 && saved) {
        const existingIds = new Set(localRecords.map((r) => r.id));
        guestRecords.forEach((gr) => {
          if (!existingIds.has(gr.id)) {
            localRecords.unshift({ ...gr, user_id: user.id });
          }
        });
      }

      if (localRecords.length > 0 && !isSilent) {
        setRecords(localRecords);
        localStorage.setItem(storageKey, JSON.stringify(localRecords));
      }
    } catch (e) {
      console.warn('Erro ao ler cache local de finanças:', e);
    }

    // Se for modo demo ou não houver Supabase configurado
    if (isDemoMode || !supabase) {
      setSyncStatus('local');
      if (!isSilent) setLoading(false);
      return;
    }

    // 2. Busca lançamentos diretamente do banco de dados Supabase e sincroniza dados
    try {
      if (!isSilent) setSyncStatus('syncing');
      const { data, error } = await supabase
        .from('finance_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.warn('Aviso ao consultar Supabase:', error.message);
        setSyncStatus('local');
      } else if (data) {
        // Envia apenas lançamentos locais criados offline explicitamente marcados
        const pendingUploads = localRecords.filter((r) => r._pendingUpload === true);
        if (pendingUploads.length > 0) {
          try {
            const recordsToUpload = pendingUploads.map((r) => ({
              id: r.id || generateId('rec'),
              user_id: user.id,
              date: r.date || new Date().toISOString().split('T')[0],
              type: r.type,
              category: r.category,
              description: r.description || '',
              amount: Number(r.amount) || 0,
            }));
            await supabase.from('finance_records').upsert(recordsToUpload);
          } catch (uploadErr) {
            console.warn('Erro ao subir pendências locais:', uploadErr);
          }
        }

        setRecords(data);
        localStorage.setItem(storageKey, JSON.stringify(data));
        setSyncStatus('synced');
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.warn('Falha de conexão com o banco de dados:', err);
      setSyncStatus('local');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [user, isDemoMode, storageKey]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Sincronização em tempo real (Supabase Realtime WebSocket + reativação no iPhone PWA)
  useEffect(() => {
    if (!supabase || !user?.id || isDemoMode) return;

    // 1. Canal Realtime no Supabase para sincronização instantânea (< 300ms) entre iPhone e PC
    const channel = supabase
      .channel(`realtime_finance_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'finance_records',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadRecords(true);
        }
      )
      .subscribe();

    // 2. Eventos de retorno ao App (iPhone tela inicial / Safari PWA / alternância de abas no PC)
    const handleReactivate = () => {
      if (document.visibilityState === 'visible') {
        loadRecords(true);
      }
    };

    document.addEventListener('visibilitychange', handleReactivate);
    window.addEventListener('focus', handleReactivate);
    window.addEventListener('pageshow', handleReactivate);
    window.addEventListener('online', handleReactivate);

    // 3. Heartbeat a cada 8 segundos quando o app estiver visível na tela
    const heartbeat = setInterval(() => {
      if (document.visibilityState === 'visible' && navigator.onLine !== false) {
        loadRecords(true);
      }
    }, 8000);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleReactivate);
      window.removeEventListener('focus', handleReactivate);
      window.removeEventListener('pageshow', handleReactivate);
      window.removeEventListener('online', handleReactivate);
      clearInterval(heartbeat);
    };
  }, [user?.id, isDemoMode, loadRecords]);

  // Adicionar lançamento
  const addRecord = async (recordData) => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado.' };
    }

    const newRecord = {
      id: generateId('rec'),
      user_id: user.id,
      date: recordData.date || new Date().toISOString().split('T')[0],
      amount: Number(recordData.amount) || 0,
      type: recordData.type,
      category: recordData.category,
      description: recordData.description || '',
      created_at: new Date().toISOString(),
    };

    // Atualização otimista na memória e no cache local
    setRecords((prev) => {
      const updated = [newRecord, ...prev];
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Se estiver em modo demo ou sem Supabase configurado
    if (isDemoMode || !supabase || !user?.id) {
      setSyncStatus('local');
      return { success: true, data: newRecord, localOnly: true };
    }

    // Persistência segura no banco de dados Supabase
    setSyncStatus('syncing');
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
        console.warn('Lançamento salvo localmente (banco reportou):', error.message);
        setSyncStatus('local');
        return {
          success: true,
          data: newRecord,
          localSaved: true,
          remoteNotice: error.message,
        };
      }

      setSyncStatus('synced');
      setLastSyncTime(new Date());
      return { success: true, data: newRecord, localSaved: true };
    } catch (err) {
      console.warn('Lançamento salvo localmente (offline):', err);
      setSyncStatus('local');
      return {
        success: true,
        data: newRecord,
        localSaved: true,
      };
    }
  };

  // Adicionar múltiplos lançamentos (ex: despesas fixas recorrentes por vários meses)
  const addRecords = async (recordsArray) => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado.' };
    }

    if (!recordsArray || recordsArray.length === 0) {
      return { success: true, data: [] };
    }

    const newRecords = recordsArray.map((recordData) => ({
      id: generateId('rec'),
      user_id: user.id,
      date: recordData.date || new Date().toISOString().split('T')[0],
      amount: Number(recordData.amount) || 0,
      type: recordData.type,
      category: recordData.category,
      description: recordData.description || '',
      is_recurring: Boolean(recordData.is_recurring),
      created_at: new Date().toISOString(),
    }));

    // Atualização otimista na memória e no cache local
    setRecords((prev) => {
      const updated = [...newRecords, ...prev];
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isDemoMode || !supabase || !user?.id) {
      setSyncStatus('local');
      return { success: true, data: newRecords, localOnly: true };
    }

    // Persistência segura no Supabase
    setSyncStatus('syncing');
    try {
      const recordsToInsert = newRecords.map((r) => ({
        id: r.id,
        user_id: user.id,
        date: r.date,
        type: r.type,
        category: r.category,
        description: r.description,
        amount: r.amount,
      }));

      const { error } = await supabase.from('finance_records').insert(recordsToInsert);

      if (error) {
        console.warn('Lançamentos em lote salvos localmente (aguardando banco):', error.message);
        setSyncStatus('local');
        return {
          success: true,
          data: newRecords,
          localSaved: true,
          remoteNotice: error.message,
        };
      }

      setSyncStatus('synced');
      setLastSyncTime(new Date());
      return { success: true, data: newRecords, localSaved: true };
    } catch (err) {
      console.warn('Lote salvo localmente (offline):', err);
      setSyncStatus('local');
      return {
        success: true,
        data: newRecords,
        localSaved: true,
      };
    }
  };

  // Atualizar lançamento existente
  const updateRecord = async (id, updatedFields) => {
    if (!user) return { success: false, error: 'Não autenticado' };

    setRecords((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, ...updatedFields } : r));
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isDemoMode || !supabase || !user?.id) {
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('finance_records')
        .update(updatedFields)
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar no banco:', error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      console.warn('Erro de rede ao atualizar:', err);
      return { success: false, error: err.message };
    }
  };

  // Deletar lançamento
  const deleteRecord = async (id) => {
    setRecords((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isDemoMode || !supabase || !user?.id) {
      return { success: true };
    }

    try {
      const { error } = await supabase.from('finance_records').delete().eq('id', id);
      if (error) {
        console.error('Erro ao excluir no Supabase:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      console.warn('Erro de rede ao excluir:', err);
      return { success: false, error: err.message };
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        records,
        loading,
        syncStatus,
        lastSyncTime,
        refreshRecords: loadRecords,
        addRecord,
        addRecords,
        updateRecord,
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
