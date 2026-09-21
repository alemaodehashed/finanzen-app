import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured());

  // Helpers para persistência em modo Demo
  const getDemoUsers = () => {
    try {
      const stored = localStorage.getItem('finanzen_demo_profiles');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      {
        id: 'demo_user_001',
        email: 'demo@finantemps.com',
        full_name: 'Usuário Demonstração',
        subscription_status: 'active',
        phone: '(11) 98765-4321',
        created_at: new Date().toISOString(),
      },
    ];
  };

  const saveDemoUser = (userProfile) => {
    const list = getDemoUsers();
    const existingIndex = list.findIndex(
      (u) => u.id === userProfile.id || u.email.toLowerCase() === userProfile.email.toLowerCase()
    );
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...userProfile };
    } else {
      list.unshift(userProfile);
    }
    localStorage.setItem('finanzen_demo_profiles', JSON.stringify(list));
    localStorage.setItem('finanzen_current_user', JSON.stringify(userProfile));
  };

  // Carrega o perfil do Supabase garantindo que o email esteja preenchido
  const fetchProfile = async (userId, userEmail) => {
    if (!supabase) return;
    const cleanEmail = (userEmail || '').trim().toLowerCase();

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error);
      }

      if (data) {
        const isOwnerAccount = cleanEmail === 'adam.tv2004@gmail.com' || cleanEmail === 'admin@finantemps.com';
        if (isOwnerAccount) {
          data.is_admin = true;
          data.subscription_status = 'active';
        }
        // Se no banco o email estiver nulo ou vazio, atualiza imediatamente com o cleanEmail
        if ((!data.email || data.email.trim() === '') && cleanEmail) {
          data.email = cleanEmail;
          await supabase.from('profiles').update({ email: cleanEmail }).eq('id', userId);
        }
        setProfile(data);
      } else {
        const isOwnerAccount = cleanEmail === 'adam.tv2004@gmail.com' || cleanEmail === 'admin@finantemps.com';
        // Cria perfil básico se não existir com o email garantido
        const newProfile = {
          id: userId,
          email: cleanEmail,
          full_name: cleanEmail.split('@')[0] || 'Usuário',
          is_admin: isOwnerAccount,
          subscription_status: isOwnerAccount ? 'active' : 'pending',
        };
        await supabase.from('profiles').upsert(newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      console.warn('Erro ao carregar perfil do usuário:', err);
    }
  };

  useEffect(() => {
    // 1. Verifica se há sessão ativa de Administrador Dono salva localmente
    let savedAdmin = null;
    try {
      const savedAdminStr = localStorage.getItem('finanzen_admin_session');
      if (savedAdminStr) savedAdmin = JSON.parse(savedAdminStr);
    } catch (e) {}

    if (savedAdmin) {
      setUser({
        id: savedAdmin.id,
        email: savedAdmin.email,
        user_metadata: { full_name: savedAdmin.full_name },
      });
      setProfile(savedAdmin);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured() || !supabase) {
      // Modo Demo Ativado - restaura usuário salvo anteriormente ou padrão
      let currentDemo = null;
      try {
        const saved = localStorage.getItem('finanzen_current_user');
        if (saved) currentDemo = JSON.parse(saved);
      } catch (e) {}

      if (!currentDemo) {
        currentDemo = {
          id: 'demo_user_001',
          email: 'demo@finantemps.com',
          full_name: 'Usuário Demonstração',
          subscription_status: 'active',
        };
      }

      setUser({
        id: currentDemo.id,
        email: currentDemo.email,
        user_metadata: { full_name: currentDemo.full_name },
      });
      setProfile(currentDemo);
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
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (fullName || '').trim() || cleanEmail.split('@')[0];
    const isOwner = cleanEmail === 'adam.tv2004@gmail.com';
    const initialStatus = isOwner ? 'active' : 'pending';

    if (isDemoMode || !supabase) {
      const mockUser = {
        id: 'user_' + Date.now(),
        email: cleanEmail,
        user_metadata: { full_name: cleanName },
      };
      const mockProfile = {
        id: mockUser.id,
        email: cleanEmail,
        full_name: cleanName,
        is_admin: isOwner,
        subscription_status: initialStatus,
        created_at: new Date().toISOString(),
      };
      saveDemoUser(mockProfile);
      setUser(mockUser);
      setProfile(mockProfile);
      return { user: mockUser, session: { user: mockUser }, error: null };
    }

    // Cria usuário no auth do Supabase passando email e nome em options
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
          email: cleanEmail,
        },
      },
    });

    if (error) {
      if (
        error.message?.toLowerCase().includes('rate limit') ||
        error.status === 429 ||
        error.code === 'over_email_send_rate_limit'
      ) {
        return {
          user: null,
          session: null,
          error:
            'Limite de envio de e-mails do Supabase atingido. Por favor, desative a opção "Confirm email" em Authentication > Providers > Email no painel do Supabase para liberar cadastros ilimitados imediatos.',
        };
      }
      return { user: null, session: null, error: error.message };
    }

    // Se o usuário foi criado, salvamos o perfil no Supabase como pending (ou active se for o dono)
    if (data?.user) {
      const profileData = {
        id: data.user.id,
        email: cleanEmail,
        full_name: cleanName,
        is_admin: isOwner,
        subscription_status: initialStatus,
        updated_at: new Date().toISOString(),
      };

      try {
        const { error: upsertErr } = await supabase.from('profiles').upsert(profileData);
        if (upsertErr) {
          console.warn('Tentativa de upsert simples sem colunas extras:', upsertErr.message);
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: cleanEmail,
            full_name: cleanName,
            subscription_status: initialStatus,
          });
        }
      } catch (upsertErr) {
        console.warn('Upsert fallback warning:', upsertErr);
      }

      // Se a sessão já veio ativa ou se podemos conectar imediatamente
      let activeSession = data.session;
      if (!activeSession) {
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (signInData?.session) {
          activeSession = signInData.session;
        }
      }

      if (activeSession) {
        setUser(activeSession.user);
        setProfile(profileData);
      } else {
        setUser(data.user);
        setProfile(profileData);
      }
    }

    return { user: data.user, session: data.session, error: null };
  };

  const loginAsAdmin = async (adminEmail = 'adam.tv2004@gmail.com') => {
    const cleanEmail = (adminEmail || 'adam.tv2004@gmail.com').trim().toLowerCase();
    const adminUser = {
      id: '00000000-0000-0000-0000-000000000001',
      email: cleanEmail,
      user_metadata: { full_name: '3º Sgt Adam (Administrador)' },
    };
    const adminProfile = {
      id: adminUser.id,
      email: cleanEmail,
      full_name: '3º Sgt Adam (Administrador)',
      phone: '(42) 99975-7796',
      is_admin: true,
      subscription_status: 'active',
      created_at: new Date().toISOString(),
    };

    localStorage.setItem('finanzen_admin_session', JSON.stringify(adminProfile));
    localStorage.setItem('finanzen_current_user', JSON.stringify(adminProfile));
    saveDemoUser(adminProfile);
    setUser(adminUser);
    setProfile(adminProfile);

    return { user: adminUser, profile: adminProfile, error: null };
  };

  const signIn = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const isAdminAccount = cleanEmail === 'adam.tv2004@gmail.com' || cleanEmail === 'admin@finantemps.com';

    if (isDemoMode || !supabase) {
      const demoUsers = getDemoUsers();
      const found = demoUsers.find((u) => u.email.toLowerCase() === cleanEmail);
      const userToLogin = found || {
        id: 'user_' + Date.now(),
        email: cleanEmail,
        full_name: cleanEmail.split('@')[0],
        is_admin: isAdminAccount,
        subscription_status: 'active',
        created_at: new Date().toISOString(),
      };
      saveDemoUser(userToLogin);
      setUser({
        id: userToLogin.id,
        email: userToLogin.email,
        user_metadata: { full_name: userToLogin.full_name },
      });
      setProfile(userToLogin);
      return { user: userToLogin, error: null };
    }

    // Tenta autenticação real com o Supabase primeiro
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!error && data?.user) {
        setUser(data.user);
        await fetchProfile(data.user.id, data.user.email || cleanEmail);
        return { user: data.user, error: null };
      }

      // Se falhar e for a conta do administrador com a senha mestre 'admin123'
      if (isAdminAccount && password === 'admin123') {
        console.warn('Login com credencial administrativa mestre.');
        return loginAsAdmin(cleanEmail);
      }

      return { user: null, error: error?.message || 'E-mail ou senha incorretos.' };
    } catch (err) {
      if (isAdminAccount && password === 'admin123') {
        return loginAsAdmin(cleanEmail);
      }
      return { user: null, error: err.message || 'Erro ao autenticar.' };
    }
  };

  const signOut = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    localStorage.removeItem('finanzen_current_user');
    localStorage.removeItem('finanzen_admin_session');
    setUser(null);
    setProfile(null);
  };

  // Checa se o usuário foi autorizado pelo Administrador
  const isApproved = () => {
    if (!user) return false;
    if (
      profile?.is_admin ||
      user?.email === 'adam.tv2004@gmail.com' ||
      user?.email === 'admin@finantemps.com'
    ) return true;
    return profile?.subscription_status === 'active';
  };

  const isSubscriptionActive = () => isApproved();

  const getDaysRemainingInTrial = () => 0;

  const refreshProfile = async () => {
    if (!user) return;
    if (isDemoMode || !supabase) {
      const list = getDemoUsers();
      const found = list.find(
        (u) => u.id === user.id || u.email.toLowerCase() === user.email?.toLowerCase()
      );
      if (found) {
        setProfile(found);
        localStorage.setItem('finanzen_current_user', JSON.stringify(found));
      }
    } else {
      await fetchProfile(user.id, user.email);
    }
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

  const isAdmin = Boolean(
    profile?.is_admin ||
    user?.email === 'adam.tv2004@gmail.com' ||
    user?.email === 'admin@finantemps.com' ||
    (isDemoMode && user?.email === 'demo@finantemps.com')
  );

  const fetchAllProfiles = async () => {
    if (isDemoMode || !supabase) {
      return getDemoUsers();
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Erro ao buscar perfis no Supabase:', error.message);
        return getDemoUsers();
      }
      return data || [];
    } catch (err) {
      console.warn('Erro ao buscar todos os perfis no Supabase, usando lista local:', err);
      return getDemoUsers();
    }
  };

  const updateUserStatus = async (targetUserId, newStatus, extraData = {}) => {
    if (isDemoMode || !supabase) {
      const list = getDemoUsers();
      const idx = list.findIndex((u) => u.id === targetUserId);
      if (idx >= 0) {
        list[idx] = { ...list[idx], subscription_status: newStatus, ...extraData };
        localStorage.setItem('finanzen_demo_profiles', JSON.stringify(list));
        const currentSaved = localStorage.getItem('finanzen_current_user');
        if (currentSaved) {
          const parsed = JSON.parse(currentSaved);
          if (parsed.id === targetUserId) {
            localStorage.setItem('finanzen_current_user', JSON.stringify(list[idx]));
            if (user?.id === targetUserId) {
              setProfile(list[idx]);
            }
          }
        }
      }
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
        isApproved,
        refreshProfile,
        loading,
        isDemoMode,
        signUp,
        signIn,
        loginAsAdmin,
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
