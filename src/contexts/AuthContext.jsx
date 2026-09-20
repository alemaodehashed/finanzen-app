import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured());

  // Carrega o perfil do Supabase
  const fetchProfile = async (userId, userEmail) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error);
      }

      if (data) {
        setProfile(data);
      } else {
        // Cria perfil básico se não existir
        const newProfile = {
          id: userId,
          email: userEmail,
          subscription_status: 'trial',
          trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
        await supabase.from('profiles').upsert(newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      console.warn('Erro ao carregar perfil do usuário:', err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      // Modo Demo Ativado para testes imediatos
      const demoUser = {
        id: 'demo_user_001',
        email: 'demo@finantemps.com',
        user_metadata: { full_name: 'Usuário Demonstração' },
      };
      const demoProfile = {
        id: 'demo_user_001',
        email: 'demo@finantemps.com',
        full_name: 'Usuário Demonstração',
        subscription_status: 'trial',
        trial_ends_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      };
      setUser(demoUser);
      setProfile(demoProfile);
      setLoading(false);
      setIsDemoMode(true);
      return;
    }

    // Supabase Auth Listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id, session.user.email);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, fullName) => {
    if (isDemoMode || !supabase) {
      const mockUser = {
        id: 'user_' + Date.now(),
        email,
        user_metadata: { full_name: fullName },
      };
      setUser(mockUser);
      setProfile({
        id: mockUser.id,
        email,
        full_name: fullName,
        subscription_status: 'trial',
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      return { user: mockUser, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    return { user: data?.user, error };
  };

  const signIn = async (email, password) => {
    if (isDemoMode || !supabase) {
      const mockUser = {
        id: 'user_logged',
        email,
        user_metadata: { full_name: email.split('@')[0] },
      };
      setUser(mockUser);
      return { user: mockUser, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { user: data?.user, error };
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  };

  // Cálculo de status da assinatura (trial, ativo, expirado)
  const isSubscriptionActive = () => {
    if (!profile) return true;
    if (profile.subscription_status === 'lifetime' || profile.subscription_status === 'active') {
      return true;
    }
    if (profile.subscription_status === 'trial' && profile.trial_ends_at) {
      return new Date(profile.trial_ends_at) > new Date();
    }
    return false;
  };

  const getDaysRemainingInTrial = () => {
    if (!profile || profile.subscription_status !== 'trial' || !profile.trial_ends_at) return 0;
    const diff = new Date(profile.trial_ends_at).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: 'Usuário não autenticado' };

    const updatedProfile = {
      ...profile,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    setProfile(updatedProfile);

    if (isDemoMode || !supabase) {
      localStorage.setItem(`finanzen_profile_${user.id}`, JSON.stringify(updatedProfile));
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          phone: updates.phone,
          savings_goal: Number(updates.savings_goal) || 0,
          settings: updates.settings || profile?.settings || {},
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      return { error };
    } catch (err) {
      console.error('Erro ao atualizar perfil no Supabase:', err);
      return { error: err };
    }
  };

  const isAdmin = Boolean(profile?.is_admin || user?.email === 'adam.tv2004@gmail.com' || isDemoMode);

  const fetchAllProfiles = async () => {
    if (isDemoMode || !supabase) {
      return [
        {
          id: 'demo_user_001',
          email: 'demo@finantemps.com',
          full_name: 'Usuário Demonstração',
          subscription_status: 'trial',
          trial_ends_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          phone: '(11) 98765-4321',
          created_at: new Date().toISOString(),
        },
        {
          id: 'client_002',
          email: 'carlos.silva@gmail.com',
          full_name: 'Carlos Silva',
          subscription_status: 'lifetime',
          phone: '(19) 99123-4567',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'client_003',
          email: 'maria.souza@hotmail.com',
          full_name: 'Maria Souza',
          subscription_status: 'expired',
          phone: '(21) 97788-9900',
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar todos os perfis:', err);
      return [];
    }
  };

  const updateUserStatus = async (targetUserId, newStatus, extraData = {}) => {
    if (isDemoMode || !supabase) {
      return { success: true };
    }
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: newStatus,
          ...extraData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetUserId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Erro ao atualizar status do cliente:', err);
      return { success: false, error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        isDemoMode,
        signUp,
        signIn,
        signOut,
        updateProfile,
        fetchAllProfiles,
        updateUserStatus,
        isSubscriptionActive,
        getDaysRemainingInTrial,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
