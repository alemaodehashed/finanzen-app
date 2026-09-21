-- ==============================================================================
-- SCHEMA MULTIUSUÁRIO (SAAS) - FINANZEN / FINANÇAS PESSOAIS
-- Execute este script no SQL Editor do seu projeto Supabase
-- ==============================================================================

-- 1. TABELA DE PERFIS, ASSINATURAS E CONFIGURAÇÕES DOS CLIENTES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  savings_goal NUMERIC DEFAULT 0,
  settings JSONB DEFAULT '{"theme": "dark", "currency": "BRL"}'::jsonb,
  is_admin BOOLEAN DEFAULT false,
  subscription_status TEXT DEFAULT 'pending', -- 'pending' (aguardando aprovação do admin), 'active' (aprovado/liberado), 'blocked'
  trial_ends_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Habilita RLS na tabela de perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- FUNÇÃO SEGURA PARA CHECAR SE É ADMIN (SEM RECURSÃO)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (is_admin = true OR email = 'adam.tv2004@gmail.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FUNÇÃO PARA CHECAR SE O USUÁRIO ESTÁ AUTORIZADO PELO ADMIN
CREATE OR REPLACE FUNCTION public.is_user_authorized()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (subscription_status = 'active' OR is_admin = true OR email = 'adam.tv2004@gmail.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLÍTICAS DE ACESSO A PERFIS
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Ver perfis" ON public.profiles;
CREATE POLICY "Ver perfis" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem inserir seu próprio perfil" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Atualizar perfis" ON public.profiles;
CREATE POLICY "Atualizar perfis" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id OR public.is_admin());

-- 2. TRIGGER AUTOMÁTICO: NOVO USUÁRIO FICA COMO PENDENTE (DONO FICA ATIVO AUTOMATICAMENTE)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_first_or_owner BOOLEAN;
  user_email TEXT;
  user_name TEXT;
BEGIN
  user_email := lower(trim(COALESCE(new.email, new.raw_user_meta_data->>'email', '')));
  user_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(user_email, '@', 1), 'Usuário');

  -- Dono ou primeiro usuário vira admin e já fica ativo na hora
  is_first_or_owner := (user_email = 'adam.tv2004@gmail.com') OR NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    is_admin,
    subscription_status,
    savings_goal
  )
  VALUES (
    new.id,
    user_email,
    user_name,
    is_first_or_owner,
    CASE WHEN is_first_or_owner THEN 'active' ELSE 'pending' END,
    0
  )
  ON CONFLICT (id) DO UPDATE SET
    email = CASE 
      WHEN public.profiles.email IS NULL OR public.profiles.email = '' 
      THEN EXCLUDED.email 
      ELSE public.profiles.email 
    END,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    is_admin = CASE WHEN user_email = 'adam.tv2004@gmail.com' THEN true ELSE public.profiles.is_admin END;
    
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sincronizar contas antigas que possam ter sido cadastradas sem salvar o email
UPDATE public.profiles p
SET email = lower(trim(u.email)),
    full_name = COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1))
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

-- 3. TABELA DE LANÇAMENTOS FINANCEIROS (ISOLADOS POR USUÁRIO AUTORIZADO)
CREATE TABLE IF NOT EXISTS public.finance_records (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  type TEXT NOT NULL,         -- 'renda', 'renda_extra', 'despesa_casa', 'negocio'
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Habilita RLS na tabela de lançamentos
ALTER TABLE public.finance_records ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACESSO: CADA CLIENTE AUTORIZADO SÓ ENXERGA E EDITA OS SEUS PRÓPRIOS DADOS
DROP POLICY IF EXISTS "Usuários podem ver apenas suas finanças" ON public.finance_records;
CREATE POLICY "Usuários podem ver apenas suas finanças" 
  ON public.finance_records FOR SELECT 
  USING (auth.uid() = user_id AND public.is_user_authorized());

DROP POLICY IF EXISTS "Usuários podem inserir apenas suas finanças" ON public.finance_records;
CREATE POLICY "Usuários podem inserir apenas suas finanças" 
  ON public.finance_records FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND public.is_user_authorized());

DROP POLICY IF EXISTS "Usuários podem atualizar apenas suas finanças" ON public.finance_records;
CREATE POLICY "Usuários podem atualizar apenas suas finanças" 
  ON public.finance_records FOR UPDATE 
  USING (auth.uid() = user_id AND public.is_user_authorized());

DROP POLICY IF EXISTS "Usuários podem deletar apenas suas finanças" ON public.finance_records;
CREATE POLICY "Usuários podem deletar apenas suas finanças" 
  ON public.finance_records FOR DELETE 
  USING (auth.uid() = user_id AND public.is_user_authorized());

-- Índices para carregamento ultra rápido
CREATE INDEX IF NOT EXISTS idx_finance_user_date ON public.finance_records (user_id, date);
