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
  subscription_status TEXT DEFAULT 'trial', -- 'trial', 'active', 'expired', 'lifetime'
  trial_ends_at TIMESTAMPTZ DEFAULT (timezone('utc'::text, now()) + INTERVAL '7 days'),
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

-- 2. TRIGGER AUTOMÁTICO PARA CRIAR PERFIL AO CADASTRAR NOVO USUÁRIO
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_first_or_owner BOOLEAN;
BEGIN
  -- Se o email for do dono ou for o primeiro usuário, vira admin automaticamente
  is_first_or_owner := (new.email = 'adam.tv2004@gmail.com') OR NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    is_admin,
    subscription_status,
    trial_ends_at,
    savings_goal
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    is_first_or_owner,
    CASE WHEN is_first_or_owner THEN 'lifetime' ELSE 'trial' END,
    (timezone('utc'::text, now()) + INTERVAL '7 days'),
    0
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    is_admin = CASE WHEN new.email = 'adam.tv2004@gmail.com' THEN true ELSE public.profiles.is_admin END;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. TABELA DE LANÇAMENTOS FINANCEIROS (ISOLADOS POR USUÁRIO)
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

-- POLÍTICAS DE ACESSO: CADA CLIENTE SÓ ENXERGA E EDITA OS SEUS PRÓPRIOS DADOS
DROP POLICY IF EXISTS "Usuários podem ver apenas suas finanças" ON public.finance_records;
CREATE POLICY "Usuários podem ver apenas suas finanças" 
  ON public.finance_records FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir apenas suas finanças" ON public.finance_records;
CREATE POLICY "Usuários podem inserir apenas suas finanças" 
  ON public.finance_records FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar apenas suas finanças" ON public.finance_records;
CREATE POLICY "Usuários podem atualizar apenas suas finanças" 
  ON public.finance_records FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar apenas suas finanças" ON public.finance_records;
CREATE POLICY "Usuários podem deletar apenas suas finanças" 
  ON public.finance_records FOR DELETE 
  USING (auth.uid() = user_id);

-- Índices para carregamento ultra rápido
CREATE INDEX IF NOT EXISTS idx_finance_user_date ON public.finance_records (user_id, date);
