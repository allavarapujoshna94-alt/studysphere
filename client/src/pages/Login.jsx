import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api.js';
import { useApp } from '../AppContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login, showToast } = useApp();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }

    setSubmitting(true);
    try {
      const data = await loginUser(email, password); // { token, user }
      login(data);
      showToast(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      setTimeout(() => navigate('/'), 700);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <div className="auth-card">
        <div className="text-center mb-4">
          <h2>Welcome Back</h2>
          <p className="text-muted">Sign in to continue to ShareMyNotes</p>
        </div>
        <form noValidate className={validated ? 'was-validated' : ''} onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input type="email" className="form-control" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="invalid-feedback">Please enter a valid email.</div>
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="invalid-feedback">Password is required.</div>
          </div>
          <button type="submit" className="btn btn-gradient w-100 py-2 fw-semibold" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-muted mt-4 mb-0">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
