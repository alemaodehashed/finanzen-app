-- ==============================================================================
-- SCHEMA DEFINITIVO E IDEMPOTENTE - FINANTEMP'S (PAINEL DO DONO & SINCRONIZAÇÃO EM NUVEM)
-- Execute este script no SQL Editor do seu projeto Supabase:
-- https://supabase.com/dashboard/project/dninsqoqjeiedkpflwwb/sql
-- ==============================================================================

-- 1. TABELA DE PERFIS DOS CLIENTES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Remove restrição estrita com auth.users para permitir cadastros com CPF/email flexível
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

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
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- 2. TABELA DE LANÇAMENTOS FINANCEIROS DOS CLIENTES
CREATE TABLE IF NOT EXISTS public.finance_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL,         -- 'renda', 'renda_extra', 'despesa_casa', 'negocio'
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Remove restrição de chave estrangeira com auth.users se existir
ALTER TABLE public.finance_records DROP CONSTRAINT IF EXISTS finance_records_user_id_fkey;

-- 3. HABILITA RLS E CONFIGURA POLÍTICAS PERMISSIVAS PARA ANON E AUTHENTICATED
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_records ENABLE ROW LEVEL SECURITY;

-- Limpeza de políticas antigas em profiles
DROP POLICY IF EXISTS "Permitir tudo perfis select" ON public.profiles;
DROP POLICY IF EXISTS "Permitir tudo perfis insert" ON public.profiles;
DROP POLICY IF EXISTS "Permitir tudo perfis update" ON public.profiles;
DROP POLICY IF EXISTS "Permitir tudo perfis delete" ON public.profiles;
DROP POLICY IF EXISTS "Ver perfis" ON public.profiles;
DROP POLICY IF EXISTS "Perfis públicos para leitura" ON public.profiles;
DROP POLICY IF EXISTS "Inserir perfis" ON public.profiles;
DROP POLICY IF EXISTS "Atualizar perfis" ON public.profiles;
DROP POLICY IF EXISTS "Deletar perfis" ON public.profiles;

-- Criação das políticas ativas em profiles
CREATE POLICY "Permitir tudo perfis select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Permitir tudo perfis insert" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir tudo perfis update" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Permitir tudo perfis delete" ON public.profiles FOR DELETE USING (true);

-- Limpeza de políticas antigas em finance_records
DROP POLICY IF EXISTS "Permitir tudo finance select" ON public.finance_records;
DROP POLICY IF EXISTS "Permitir tudo finance insert" ON public.finance_records;
DROP POLICY IF EXISTS "Permitir tudo finance update" ON public.finance_records;
DROP POLICY IF EXISTS "Permitir tudo finance delete" ON public.finance_records;
DROP POLICY IF EXISTS "Usuários podem ver apenas suas finanças" ON public.finance_records;
DROP POLICY IF EXISTS "Usuários podem inserir apenas suas finanças" ON public.finance_records;
DROP POLICY IF EXISTS "Usuários podem atualizar apenas suas finanças" ON public.finance_records;
DROP POLICY IF EXISTS "Usuários podem excluir apenas suas finanças" ON public.finance_records;

-- Criação das políticas ativas em finance_records
CREATE POLICY "Permitir tudo finance select" ON public.finance_records FOR SELECT USING (true);
CREATE POLICY "Permitir tudo finance insert" ON public.finance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir tudo finance update" ON public.finance_records FOR UPDATE USING (true);
CREATE POLICY "Permitir tudo finance delete" ON public.finance_records FOR DELETE USING (true);

-- Permissões de acesso aos papéis do Supabase
GRANT ALL ON public.profiles TO anon, authenticated, service_role;
GRANT ALL ON public.finance_records TO anon, authenticated, service_role;

-- Índices otimizados para busca rápida
CREATE INDEX IF NOT EXISTS idx_finance_user_date ON public.finance_records (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_finance_user_id ON public.finance_records (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_cpf ON public.profiles (cpf);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
