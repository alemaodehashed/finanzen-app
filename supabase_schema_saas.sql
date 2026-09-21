-- ==============================================================================
-- SCHEMA DEFINITIVO E IDEMPOTENTE - FINANTEMP'S (PAINEL DO DONO & LANÇAMENTOS)
-- Execute este script no SQL Editor do seu projeto Supabase:
-- https://supabase.com/dashboard/project/dninsqoqjeiedkpflwwb/sql
-- ==============================================================================

-- 1. TABELA DE PERFIS DOS CLIENTES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Adiciona todas as colunas necessárias na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS followed_instagram BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS savings_goal NUMERIC DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"theme": "dark", "currency": "BRL"}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'pending';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Habilita RLS na tabela de perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE PERFIS: O Dono e a aplicação podem listar, criar e aprovar contas
DROP POLICY IF EXISTS "Ver perfis" ON public.profiles;
DROP POLICY IF EXISTS "Perfis públicos para leitura" ON public.profiles;
CREATE POLICY "Ver perfis" 
  ON public.profiles FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Inserir perfis" ON public.profiles;
CREATE POLICY "Inserir perfis" 
  ON public.profiles FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Atualizar perfis" ON public.profiles;
CREATE POLICY "Atualizar perfis" 
  ON public.profiles FOR UPDATE 
  USING (true);

DROP POLICY IF EXISTS "Deletar perfis" ON public.profiles;
CREATE POLICY "Deletar perfis" 
  ON public.profiles FOR DELETE 
  USING (true);

-- 2. TRIGGER AUTOMÁTICO: NOVO USUÁRIO CADASTRA PERFIL COMO PENDENTE (DONO FICA ATIVO)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  is_owner BOOLEAN;
BEGIN
  user_email := lower(trim(COALESCE(new.email, new.raw_user_meta_data->>'email', '')));
  user_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(user_email, '@', 1), 'Usuário');
  is_owner := (user_email = 'adam.tv2004@gmail.com');

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
    is_owner,
    CASE WHEN is_owner THEN 'active' ELSE 'pending' END,
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

-- Sincronizar contas já existentes no auth.users que ainda não tenham perfil criado
INSERT INTO public.profiles (id, email, full_name, is_admin, subscription_status)
SELECT 
  u.id, 
  lower(trim(u.email)), 
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  (lower(trim(u.email)) = 'adam.tv2004@gmail.com'),
  CASE WHEN lower(trim(u.email)) = 'adam.tv2004@gmail.com' THEN 'active' ELSE 'pending' END
FROM auth.users u
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  is_admin = CASE WHEN EXCLUDED.email = 'adam.tv2004@gmail.com' THEN true ELSE public.profiles.is_admin END;

-- Garantir que a conta do Adam seja sempre Administrador Ativo
UPDATE public.profiles
SET is_admin = true, subscription_status = 'active'
WHERE email = 'adam.tv2004@gmail.com';

-- 3. TABELA DE LANÇAMENTOS FINANCEIROS DOS CLIENTES
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

-- Políticas de lançamentos financeiros: cada cliente lê e grava apenas os seus lançamentos
DROP POLICY IF EXISTS "Usuários podem ver apenas suas finanças" ON public.finance_records;
CREATE POLICY "Usuários podem ver apenas suas finanças" 
  ON public.finance_records FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Usuários podem inserir apenas suas finanças" ON public.finance_records;
CREATE POLICY "Usuários podem inserir apenas suas finanças" 
  ON public.finance_records FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Usuários podem atualizar apenas suas finanças" ON public.finance_records;
CREATE POLICY "Usuários podem atualizar apenas suas finanças" 
  ON public.finance_records FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Usuários podem deletar apenas suas finanças" ON public.finance_records;
CREATE POLICY "Usuários podem deletar apenas suas finanças" 
  ON public.finance_records FOR DELETE 
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Índices otimizados
CREATE INDEX IF NOT EXISTS idx_finance_user_date ON public.finance_records (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_finance_user_id ON public.finance_records (user_id);
