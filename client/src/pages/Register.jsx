import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api.js';
import { useApp } from '../AppContext.jsx';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login, showToast } = useApp();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const confirmField = form.elements.confirm;
    confirmField.setCustomValidity(password !== confirm ? 'mismatch' : '');

    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }

    setSubmitting(true);
    try {
      const data = await registerUser({ name: name.trim(), email: email.trim(), password }); // { token, user }
      login(data);
      showToast(`Account created! Welcome, ${data.user.name.split(' ')[0]}.`);
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
          <h2>Create Account</h2>
          <p className="text-muted">Join the ShareMyNotes community</p>
        </div>
        <form noValidate className={validated ? 'was-validated' : ''} onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-control" required value={name} onChange={(e) => setName(e.target.value)} />
            <div className="invalid-feedback">Please enter your name.</div>
          </div>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input type="email" className="form-control" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="invalid-feedback">Please enter a valid email.</div>
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="invalid-feedback">Password must be at least 6 characters.</div>
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input type="password" name="confirm" className="form-control" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            <div className="invalid-feedback">Passwords do not match.</div>
          </div>
          <button type="submit" className="btn btn-gradient w-100 py-2 fw-semibold" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-muted mt-4 mb-0">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
