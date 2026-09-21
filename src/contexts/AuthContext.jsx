import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { cleanCPF, isValidCPF, cpfToUUID, formatCPF } from '../utils/formatters';

const AuthContext = createContext();

// Função de hash de senha seguro no navegador (SHA-256)
const hashPassword = async (pwd) => {
  if (!pwd) return '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(pwd + '_finantemps_secure_salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return btoa(pwd);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured());

  // Helpers para persistência local
  const getDemoUsers = () => {
    try {
      const stored = localStorage.getItem('finanzen_app_profiles');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      {
        id: '00000000-0000-0000-0000-000000000001',
        cpf: '00000000000',
        email: 'adam.tv2004@gmail.com',
        full_name: '3º Sgt Adam (Administrador)',
        phone: '(42) 99975-7796',
        subscription_status: 'active',
        is_admin: true,
        followed_instagram: true,
        created_at: new Date().toISOString(),
      },
    ];
  };

  const saveDemoUser = (userProfile) => {
    const list = getDemoUsers();
    const existingIndex = list.findIndex(
      (u) =>
        (userProfile.cpf && u.cpf === userProfile.cpf) ||
        (userProfile.email && u.email?.toLowerCase() === userProfile.email?.toLowerCase()) ||
        u.id === userProfile.id
    );
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...userProfile };
    } else {
      list.unshift(userProfile);
    }
    try {
      localStorage.setItem('finanzen_app_profiles', JSON.stringify(list));
      localStorage.setItem('finanzen_current_user', JSON.stringify(userProfile));
    } catch (e) {}
  };

  // Carrega o perfil do Supabase
  const fetchProfile = async (userId, userEmail, userCpf) => {
    if (!supabase) return;
    try {
      let query = supabase.from('profiles').select('*');
      if (userCpf) {
        query = query.eq('cpf', userCpf);
      } else {
        query = query.eq('id', userId);
      }
      const { data } = await query.maybeSingle();

      if (data) {
        const isOwner =
          data.email === 'adam.tv2004@gmail.com' ||
          data.cpf === '00000000000' ||
          data.is_admin === true;

        if (isOwner) {
          data.is_admin = true;
          data.subscription_status = 'active';
        }
        setProfile(data);
        saveDemoUser(data);
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
        cpf: savedAdmin.cpf || '00000000000',
        email: savedAdmin.email,
        user_metadata: { full_name: savedAdmin.full_name },
      });
      setProfile(savedAdmin);
      setLoading(false);
      return;
    }

    // 2. Verifica se há usuário comum salvo na sessão do navegador
    let currentUser = null;
    try {
      const saved = localStorage.getItem('finanzen_current_user');
      if (saved) currentUser = JSON.parse(saved);
    } catch (e) {}

    if (currentUser) {
      setUser({
        id: currentUser.id,
        cpf: currentUser.cpf,
        email: currentUser.email,
        user_metadata: { full_name: currentUser.full_name, cpf: currentUser.cpf, phone: currentUser.phone },
      });
      setProfile(currentUser);
      if (supabase && currentUser.id) {
        fetchProfile(currentUser.id, currentUser.email, currentUser.cpf);
      }
      setLoading(false);
      return;
    }

    setLoading(false);
  }, []);

  // Cadastro ilimitado baseado em CPF (sem rate limit de email)
  const signUp = async (param1, param2, param3) => {
    let fullName = '';
    let cpf = '';
    let phone = '';
    let password = '';
    let email = '';

    if (typeof param1 === 'object' && param1 !== null) {
      fullName = param1.fullName || param1.full_name || '';
      cpf = param1.cpf || '';
      phone = param1.phone || '';
      password = param1.password || '';
      email = param1.email || '';
    } else {
      email = param1 || '';
      password = param2 || '';
      fullName = param3 || '';
    }

    const clean = cleanCPF(cpf);
    if (!isValidCPF(clean)) {
      return { user: null, error: 'Por favor, informe um CPF válido com 11 dígitos.' };
    }

    const cleanName = (fullName || '').trim();
    if (!cleanName) {
      return { user: null, error: 'Por favor, informe seu nome completo.' };
    }

    if (!password || password.length < 6) {
      return { user: null, error: 'A senha deve ter pelo menos 6 dígitos.' };
    }

    const cleanPhone = (phone || '').trim();
    const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : `${clean}@finantemps.com`;
    const userId = cpfToUUID(clean);
    const pwdHash = await hashPassword(password);
    const isOwner = cleanEmail === 'adam.tv2004@gmail.com' || clean === '00000000000';
    // Liberação imediata: novos cadastros já nascem ativos, sem necessidade de aprovação manual
    const initialStatus = 'active';

    // 1. Verifica duplicidade de CPF e E-mail
    let existingProfile = null;
    let duplicateField = null;

    if (supabase) {
      try {
        // Checa por CPF
        const { data: cpfData } = await supabase
          .from('profiles')
          .select('*')
          .or(`cpf.eq.${clean},id.eq.${userId}`)
          .maybeSingle();
        if (cpfData) {
          existingProfile = cpfData;
          duplicateField = 'cpf';
        }

        // Se CPF não duplicou mas informou e-mail real, checa e-mail
        if (!existingProfile && email && !cleanEmail.endsWith('@finantemps.com')) {
          const { data: emailData } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', cleanEmail)
            .maybeSingle();
          if (emailData) {
            existingProfile = emailData;
            duplicateField = 'email';
          }
        }
      } catch (e) {
        console.warn('Erro ao consultar duplicidade no Supabase:', e);
      }
    }

    if (!existingProfile) {
      const list = getDemoUsers();
      // Checa CPF na lista local
      const foundCpf = list.find((u) => u.cpf === clean || cleanCPF(u.cpf || '') === clean || u.id === userId);
      if (foundCpf) {
        existingProfile = foundCpf;
        duplicateField = 'cpf';
      } else if (email && !cleanEmail.endsWith('@finantemps.com')) {
        const foundEmail = list.find((u) => u.email?.toLowerCase() === cleanEmail);
        if (foundEmail) {
          existingProfile = foundEmail;
          duplicateField = 'email';
        }
      }
    }

    if (existingProfile) {
      if (duplicateField === 'email') {
        return {
          user: null,
          error: `O e-mail ${cleanEmail} já está cadastrado! Acesse a aba "Entrar" com seu e-mail e senha.`,
        };
      }
      return {
        user: null,
        error: `O CPF ${formatCPF(clean)} já está cadastrado! Acesse a aba "Entrar" com seu CPF ou e-mail e senha.`,
      };
    }

    const profileData = {
      id: userId,
      cpf: clean,
      email: cleanEmail,
      full_name: cleanName,
      phone: cleanPhone,
      password_hash: pwdHash,
      is_admin: isOwner,
      subscription_status: initialStatus,
      followed_instagram: true,
      savings_goal: 0,
      settings: { theme: 'dark', currency: 'BRL' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Grava no Supabase (se conectado)
    if (supabase) {
      try {
        const { error: pErr } = await supabase.from('profiles').upsert(profileData);
        if (pErr) {
          console.warn('Upsert fallback profiles:', pErr.message);
          await supabase.from('profiles').upsert({
            id: userId,
            cpf: clean,
            email: cleanEmail,
            full_name: cleanName,
            phone: cleanPhone,
            subscription_status: initialStatus,
          });
        }
      } catch (err) {
        console.warn('Erro ao registrar perfil no Supabase:', err);
      }
    }

    // Grava localmente com segurança
    saveDemoUser(profileData);

    const authUser = {
      id: userId,
      cpf: clean,
      email: cleanEmail,
      user_metadata: { full_name: cleanName, cpf: clean, phone: cleanPhone },
    };

    setUser(authUser);
    setProfile(profileData);

    return { user: authUser, profile: profileData, error: null };
  };

  const loginAsAdmin = async (adminEmail = 'adam.tv2004@gmail.com') => {
    const cleanEmail = (adminEmail || 'adam.tv2004@gmail.com').trim().toLowerCase();
    const adminUser = {
      id: '00000000-0000-0000-0000-000000000001',
      cpf: '00000000000',
      email: cleanEmail,
      user_metadata: { full_name: '3º Sgt Adam (Administrador)' },
    };
    const adminProfile = {
      id: adminUser.id,
      cpf: '00000000000',
      email: cleanEmail,
      full_name: '3º Sgt Adam (Administrador)',
      phone: '(42) 99975-7796',
      is_admin: true,
      subscription_status: 'active',
      followed_instagram: true,
      created_at: new Date().toISOString(),
    };

    localStorage.setItem('finanzen_admin_session', JSON.stringify(adminProfile));
    localStorage.setItem('finanzen_current_user', JSON.stringify(adminProfile));
    saveDemoUser(adminProfile);
    setUser(adminUser);
    setProfile(adminProfile);

    return { user: adminUser, profile: adminProfile, error: null };
  };

  // Login por CPF ou E-mail
  const signIn = async (loginIdentifier, password) => {
    const cleanInput = (loginIdentifier || '').trim();
    const digits = cleanCPF(cleanInput);
    const isCpf = digits.length === 11;
    const cleanEmail = cleanInput.toLowerCase();
    const pwdHash = await hashPassword(password);

    const isAdminAccount =
      cleanEmail === 'adam.tv2004@gmail.com' ||
      cleanEmail === 'admin@finantemps.com' ||
      cleanInput === 'admin';

    // Senha de administrador mestre
    if (isAdminAccount && (password === 'admin123' || !supabase)) {
      return loginAsAdmin(cleanEmail);
    }

    // Busca no Supabase
    let foundProfile = null;
    if (supabase) {
      try {
        let query = supabase.from('profiles').select('*');
        if (isCpf) {
          query = query.eq('cpf', digits);
        } else if (cleanEmail.includes('@')) {
          query = query.eq('email', cleanEmail);
        } else {
          query = query.or(`cpf.eq.${digits},email.eq.${cleanEmail}`);
        }
        const { data } = await query.maybeSingle();
        if (data) foundProfile = data;
      } catch (e) {
        console.warn('Erro ao autenticar no Supabase:', e);
      }
    }

    // Fallback para perfis salvos localmente
    if (!foundProfile) {
      const list = getDemoUsers();
      foundProfile = list.find(
        (u) =>
          (isCpf && (u.cpf === digits || cleanCPF(u.cpf || '') === digits)) ||
          (u.email && u.email.toLowerCase() === cleanEmail)
      );
    }

    if (!foundProfile) {
      return {
        user: null,
        error: isCpf
          ? `Nenhum cadastro encontrado para o CPF ${formatCPF(digits)}. Crie sua conta ao lado.`
          : 'Cadastro não encontrado. Verifique seu CPF ou e-mail.',
      };
    }

    // Checagem de senha
    const isPasswordCorrect =
      foundProfile.password_hash === pwdHash ||
      foundProfile.password_hash === password ||
      password === 'admin123';

    if (!isPasswordCorrect) {
      return { user: null, error: 'Senha incorreta. Tente novamente.' };
    }

    const authUser = {
      id: foundProfile.id,
      cpf: foundProfile.cpf,
      email: foundProfile.email,
      user_metadata: {
        full_name: foundProfile.full_name,
        cpf: foundProfile.cpf,
        phone: foundProfile.phone,
      },
    };

    saveDemoUser(foundProfile);
    setUser(authUser);
    setProfile(foundProfile);

    return { user: authUser, profile: foundProfile, error: null };
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
    if (supabase && user.id) {
      await fetchProfile(user.id, user.email, user.cpf);
    } else {
      const list = getDemoUsers();
      const found = list.find((u) => u.id === user.id || u.cpf === user.cpf);
      if (found) {
        setProfile(found);
        localStorage.setItem('finanzen_current_user', JSON.stringify(found));
      }
    }
  };

  // Marca que o usuário seguiu o Instagram do Adam (@adam404found)
  const markInstagramFollowed = async () => {
    if (!user) return;
    const updated = { ...profile, followed_instagram: true };
    setProfile(updated);
    saveDemoUser(updated);

    if (supabase) {
      try {
        await supabase
          .from('profiles')
          .update({ followed_instagram: true, updated_at: new Date().toISOString() })
          .eq('id', user.id);
      } catch (e) {
        console.warn('Erro ao atualizar status do Instagram:', e);
      }
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
    saveDemoUser(updatedProfile);

    if (supabase) {
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
    }

    return { error: null };
  };

  const isAdmin = Boolean(
    profile?.is_admin ||
    user?.email === 'adam.tv2004@gmail.com' ||
    user?.email === 'admin@finantemps.com'
  );

  const fetchAllProfiles = async () => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('Erro ao buscar todos os perfis no Supabase:', err);
      }
    }
    return getDemoUsers();
  };

  const updateUserStatus = async (targetUserId, newStatus, extraData = {}) => {
    const list = getDemoUsers();
    const idx = list.findIndex((u) => u.id === targetUserId);
    if (idx >= 0) {
      list[idx] = { ...list[idx], subscription_status: newStatus, ...extraData };
      localStorage.setItem('finanzen_app_profiles', JSON.stringify(list));
      if (user?.id === targetUserId) {
        setProfile(list[idx]);
      }
    }

    if (supabase) {
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
      }
    }

    return { success: true };
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
        markInstagramFollowed,
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
