import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, initialEmail = '', initialMode = 'login' }) => {
  const { signIn, signUp } = useAuth();
  
  // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode === 'register' ? 'register' : 'login');
      setEmail(initialEmail || '');
      setPassword('');
      setFullName('');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, initialEmail, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (activeTab === 'register') {
        if (!fullName.trim()) {
          setErrorMsg('Por favor, informe seu nome completo.');
          setLoading(false);
          return;
        }
        const res = await signUp(email, password, fullName);
        if (res.error) {
          setErrorMsg(typeof res.error === 'string' ? res.error : res.error.message || 'Erro ao criar conta.');
        } else {
          setSuccessMsg('Conta cadastrada com sucesso! Bem-vindo.');
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      } else {
        // Login padrão (a conta admin entra por aqui normalmente e ganha os privilégios)
        const res = await signIn(email, password);
        if (res.error) {
          setErrorMsg(typeof res.error === 'string' ? res.error : res.error.message || 'E-mail ou senha incorretos.');
        } else {
          setSuccessMsg('Login realizado com sucesso!');
          setTimeout(() => {
            onClose();
          }, 800);
        }
      }
    } catch (err) {
      setErrorMsg('Ocorreu um erro ao processar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal-content"
        style={{
          padding: '28px 24px',
          maxWidth: '440px',
          position: 'relative',
          borderRadius: '16px',
        }}
      >
        {/* Botão de Voltar (topo esquerdo) */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--border-color)',
            color: '#e2e8f0',
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.82rem',
            fontWeight: 600,
            transition: 'background 0.2s ease',
          }}
          title="Voltar ao início"
        >
          <ArrowLeft size={16} />
          <span>Voltar</span>
        </button>

        {/* Botão de Fechar (topo direito) */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Fechar"
        >
          <X size={18} />
        </button>

        {/* Topo com Logo e Missão */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{ margin: '0 auto 8px', display: 'inline-block' }}>
            <img
              src="/logo.png"
              alt="Divisa 3º Sgt Infantaria 13º BIB"
              style={{
                width: '60px',
                height: 'auto',
                borderRadius: '8px',
                border: '2px solid rgba(16, 185, 129, 0.4)',
                background: '#1a3323',
                padding: '4px',
                boxShadow: '0 6px 18px rgba(16, 185, 129, 0.35)',
              }}
            />
          </div>
          <div style={{ fontSize: '0.70rem', color: '#10b981', fontWeight: 800, letterSpacing: '0.5px' }}>
            FORJADO NO 13º BATALHÃO DE INFANTARIA BLINDADO
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
            {activeTab === 'register' ? 'Criar sua Conta' : 'Acesse o FinanTEMP\'s'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '2px', marginBottom: 0 }}>
            {activeTab === 'register'
              ? 'Organize suas finanças com simplicidade e disciplina'
              : 'Assuma o comando total do seu dinheiro'}
          </p>
        </div>

        {/* Seletor de Abas: Entrar | Cadastrar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px',
            background: 'rgba(0, 0, 0, 0.25)',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '1px solid var(--border-color)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s ease',
              background: activeTab === 'login' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'login' ? '#000' : 'var(--text-muted)',
            }}
          >
            Entrar
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s ease',
              background: activeTab === 'register' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'register' ? '#000' : 'var(--text-muted)',
            }}
          >
            Cadastrar
          </button>
        </div>

        {/* Mensagens de Erro e Sucesso */}
        {errorMsg && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#f43f5e',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '16px',
            }}
          >
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CheckCircle2 size={16} />
            {successMsg}
          </div>
        )}

        {/* Formulário de Login / Cadastro */}
        <form onSubmit={handleSubmit}>
          {activeTab === 'register' && (
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <div style={{ position: 'relative' }}>
                <User
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }}
                />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="Seu nome"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">E-mail</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }}
              />
              <input
                type="email"
                className="form-control"
                style={{ paddingLeft: '38px' }}
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                style={{ paddingLeft: '38px', paddingRight: '38px' }}
                placeholder="Sua senha secreta"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: 0,
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '12px',
              fontWeight: 800,
            }}
            disabled={loading}
          >
            {loading ? (
              'Processando...'
            ) : activeTab === 'register' ? (
              <>
                <span>Criar Conta</span>
                <ArrowRight size={18} />
              </>
            ) : (
              <>
                <span>Entrar na Conta</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            type="button"
            onClick={() => {
              setActiveTab(activeTab === 'register' ? 'login' : 'register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {activeTab === 'register'
              ? 'Já possui conta? Clique para entrar'
              : 'Não tem conta? Clique aqui para criar'}
          </button>
        </div>

        <div
          style={{
            marginTop: '20px',
            paddingTop: '14px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: 'var(--text-dim)',
            fontSize: '0.76rem',
          }}
        >
          <ShieldCheck size={14} color="#10b981" />
          Seus dados são 100% privados e criptografados.
        </div>
      </div>
    </div>
  );
};
