import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getSession, setSession, clearSession } from './api.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [session, setSessionState] = useState(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    setSessionState(getSession());
  }, []);

  // sessionData = { token, user: { id, name, email } }, returned by loginUser/registerUser
  const login = useCallback((sessionData) => {
    setSession(sessionData);
    setSessionState(sessionData);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSessionState(null);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <AppContext.Provider value={{ session, login, logout, showToast, toasts }}>
      {children}
      <ToastContainer toasts={toasts} />
    </AppContext.Provider>
  );
}

function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 2000 }}>
      {toasts.map((t) => {
        const bg =
          t.type === 'success' ? 'text-bg-success' : t.type === 'error' ? 'text-bg-danger' : 'text-bg-primary';
        return (
          <div key={t.id} className={`toast show align-items-center ${bg} border-0 mb-2`} role="alert">
            <div className="d-flex">
              <div className="toast-body">{t.message}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
