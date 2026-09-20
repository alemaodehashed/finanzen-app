import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { signIn, signUp, isDemoMode } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!fullName.trim()) {
          setErrorMsg('Por favor, informe seu nome.');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setErrorMsg(error.message || 'Erro ao criar conta.');
        } else {
          setSuccessMsg('Conta criada com sucesso! 7 dias grátis ativados.');
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message || 'Email ou senha inválidos.');
        } else {
          onClose();
        }
      }
    } catch (err) {
      setErrorMsg('Ocorreu um erro ao processar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '32px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              margin: '0 auto 12px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Sparkles size={28} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>
            {isRegister ? 'Criar sua Conta' : 'Acesse o FinanZen'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            {isRegister
              ? 'Comece agora com 7 dias grátis de acesso completo'
              : 'Seu controle financeiro pessoal simples e inteligente'}
          </p>
        </div>

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

        <form onSubmit={handleSubmit}>
          {isRegister && (
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
                type="password"
                className="form-control"
                style={{ paddingLeft: '38px' }}
                placeholder="Sua senha secreta"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Aguarde...' : isRegister ? 'Criar Conta e Começar' : 'Entrar na Conta'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isRegister ? 'Já possui conta? Clique para entrar' : 'Não tem conta? Teste 7 dias grátis'}
          </button>
        </div>

        <div
          style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: 'var(--text-dim)',
            fontSize: '0.78rem',
          }}
        >
          <ShieldCheck size={14} color="#10b981" />
          Seus dados são 100% privados e criptografados.
        </div>
      </div>
    </div>
  );
};
