import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { generateId } from '../utils/formatters';

const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const { user, isDemoMode } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  // 'synced' | 'local' | 'error' | 'syncing'
  const [syncStatus, setSyncStatus] = useState('local');
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Chave de armazenamento estritamente isolada por ID único do usuário
  // NUNCA cruza chaves com outros usuários ou convidados
  const getStorageKey = useCallback((u) => {
    if (!u || !u.id) return null;
    return `finanzen_records_user_${u.id}`;
  }, []);

  const storageKey = getStorageKey(user);

  // Limpa imediatamente a memória se o usuário deslogar ou mudar de conta
  useEffect(() => {
    if (!user || !user.id) {
      setRecords([]);
      setSyncStatus('local');
      setLoading(false);
    }
  }, [user?.id]);

  // Carregar lançamentos do usuário com isolamento absoluto e sincronização em nuvem
  const loadRecords = useCallback(async (isSilent = false) => {
    // Se não há usuário autenticado, zera tudo por segurança (NUNCA vaza dados)
    if (!user || !user.id) {
      setRecords([]);
      if (!isSilent) setLoading(false);
      setSyncStatus('local');
      return;
    }

    const currentKey = `finanzen_records_user_${user.id}`;
    if (!isSilent) setLoading(true);

    // 1. Carrega imediatamente apenas o cache local DESTE usuário específico
    let localRecords = [];
    try {
      const saved = localStorage.getItem(currentKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filtro rigoroso: garante que nenhum registro com user_id diferente entre na memória
          localRecords = parsed.filter((r) => r.user_id === user.id);
          if (!isSilent && localRecords.length > 0) {
            setRecords(localRecords);
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao ler cache local de finanças:', e);
    }

    // Se não houver Supabase configurado
    if (!supabase || isDemoMode) {
      setSyncStatus('local');
      if (!isSilent) setLoading(false);
      return;
    }

    // 2. Busca lançamentos diretamente do Supabase ESTRITAMENTE deste usuário (WHERE user_id = user.id)
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
        // Envia apenas lançamentos locais criados offline pertencentes ESTRITAMENTE a este usuário
        const pendingUploads = localRecords.filter(
          (r) => r._pendingUpload === true && r.user_id === user.id
        );
        if (pendingUploads.length > 0) {
          try {
            const recordsToUpload = pendingUploads.map((r) => ({
              id: r.id || generateId('rec'),
              user_id: user.id, // Vínculo obrigatório do usuário
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

        // Os dados oficiais do Supabase filtrados pelo ID do usuário são a verdade absoluta
        const userStrictRecords = (data || []).filter((r) => r.user_id === user.id);
        setRecords(userStrictRecords);
        localStorage.setItem(currentKey, JSON.stringify(userStrictRecords));
        setSyncStatus('synced');
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.warn('Falha de conexão com o banco de dados:', err);
      setSyncStatus('local');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [user, isDemoMode]);

  // Carrega ao montar ou quando o usuário logado mudar
  useEffect(() => {
    if (user?.id) {
      loadRecords();
    }
  }, [user?.id, loadRecords]);

  // Sincronização em tempo real (Supabase Realtime WebSocket + reativação no iPhone PWA)
  // Canal e filtro estritamente isolados por user.id
  useEffect(() => {
    if (!supabase || !user?.id || isDemoMode) return;

    // 1. Canal Realtime exclusivo: só recebe eventos onde user_id === user.id
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

  // Adicionar lançamento isolado
  const addRecord = async (recordData) => {
    if (!user || !user.id) {
      return { success: false, error: 'Usuário não autenticado.' };
    }

    const currentKey = `finanzen_records_user_${user.id}`;
    const newRecord = {
      id: generateId('rec'),
      user_id: user.id, // Vínculo estrito com o usuário logado
      date: recordData.date || new Date().toISOString().split('T')[0],
      amount: Number(recordData.amount) || 0,
      type: recordData.type,
      category: recordData.category,
      description: recordData.description || '',
      created_at: new Date().toISOString(),
    };

    // Atualização otimista na memória e no cache local deste usuário
    setRecords((prev) => {
      const updated = [newRecord, ...prev.filter((r) => r.user_id === user.id)];
      try {
        localStorage.setItem(currentKey, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isDemoMode || !supabase || !user?.id) {
      setSyncStatus('local');
      return { success: true, data: newRecord, localOnly: true };
    }

    // Persistência segura no banco de dados Supabase com user_id do usuário
    setSyncStatus('syncing');
    try {
      const { error } = await supabase.from('finance_records').insert({
        id: newRecord.id,
        user_id: user.id, // Estritamente do usuário
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

  // Adicionar múltiplos lançamentos isolados
  const addRecords = async (recordsArray) => {
    if (!user || !user.id) {
      return { success: false, error: 'Usuário não autenticado.' };
    }

    const currentKey = `finanzen_records_user_${user.id}`;
    if (!recordsArray || recordsArray.length === 0) {
      return { success: true, data: [] };
    }

    const newRecords = recordsArray.map((recordData) => ({
      id: generateId('rec'),
      user_id: user.id, // Vínculo estrito
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
      const updated = [...newRecords, ...prev.filter((r) => r.user_id === user.id)];
      try {
        localStorage.setItem(currentKey, JSON.stringify(updated));
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
        user_id: user.id, // Vínculo obrigatório
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

  // Atualizar lançamento existente (com checagem estrita de ownership user_id)
  const updateRecord = async (id, updatedFields) => {
    if (!user || !user.id) return { success: false, error: 'Não autenticado' };

    const currentKey = `finanzen_records_user_${user.id}`;
    setRecords((prev) => {
      const updated = prev.map((r) =>
        r.id === id && r.user_id === user.id ? { ...r, ...updatedFields } : r
      );
      try {
        localStorage.setItem(currentKey, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isDemoMode || !supabase || !user?.id) {
      return { success: true };
    }

    try {
      // Bloqueia qualquer atualização se o registro não pertencer ao usuário logado
      const { error } = await supabase
        .from('finance_records')
        .update(updatedFields)
        .eq('id', id)
        .eq('user_id', user.id);

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

  // Deletar lançamento (com checagem estrita de ownership user_id)
  const deleteRecord = async (id) => {
    if (!user || !user.id) return { success: false, error: 'Não autenticado' };

    const currentKey = `finanzen_records_user_${user.id}`;
    setRecords((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem(currentKey, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isDemoMode || !supabase || !user?.id) {
      return { success: true };
    }

    try {
      // Bloqueia qualquer exclusão se o registro não pertencer ao usuário logado
      const { error } = await supabase
        .from('finance_records')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

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
