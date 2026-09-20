-- ==============================================================================
-- SCHEMA MULTIUSUÁRIO (SAAS) - FINANZEN / FINANÇAS PESSOAIS
-- Execute este script no SQL Editor do seu projeto Supabase
-- ==============================================================================

-- 1. TABELA DE PERFIS E ASSINATURAS DOS CLIENTES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  subscription_status TEXT DEFAULT 'trial', -- 'trial', 'active', 'expired', 'lifetime'
  trial_ends_at TIMESTAMPTZ DEFAULT (timezone('utc'::text, now()) + INTERVAL '7 days'),
  subscription_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Habilita RLS na tabela de perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seu próprio perfil" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 2. TRIGGER AUTOMÁTICO PARA CRIAR PERFIL AO CADASTRAR NOVO USUÁRIO
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, subscription_status, trial_ends_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'trial',
    (timezone('utc'::text, now()) + INTERVAL '7 days')
  );
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
CREATE POLICY "Usuários podem ver apenas suas finanças" 
  ON public.finance_records FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir apenas suas finanças" 
  ON public.finance_records FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas finanças" 
  ON public.finance_records FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar apenas suas finanças" 
  ON public.finance_records FOR DELETE 
  USING (auth.uid() = user_id);

-- Índices para carregamento ultra rápido dos gráficos
CREATE INDEX IF NOT EXISTS idx_finance_user_date ON public.finance_records (user_id, date);
