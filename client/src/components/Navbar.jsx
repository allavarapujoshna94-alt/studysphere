import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext.jsx';

export default function Navbar() {
  const { session, logout, showToast } = useApp();
  const navigate = useNavigate();
  const user = session?.user;

  function handleLogout() {
    logout();
    showToast('You have been logged out.', 'info');
    setTimeout(() => navigate('/'), 500);
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/">StudySphere</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navMain">
          <ul className="navbar-nav me-auto ms-lg-4">
            <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/notes">Browse Notes</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/upload">Upload</Link></li>
          </ul>
          <ul className="navbar-nav ms-auto align-items-lg-center">
            {user ? (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle d-flex align-items-center gap-2" href="#" role="button" data-bs-toggle="dropdown">
                  <span className="contributor-avatar" style={{ width: 32, height: 32, fontSize: '0.85rem' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  {user.name.split(' ')[0]}
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><Link className="dropdown-item" to="/my-notes"><i className="fa-solid fa-folder-open me-2"></i>My Notes</Link></li>
                  <li><Link className="dropdown-item" to="/upload"><i className="fa-solid fa-upload me-2"></i>Upload Notes</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item text-danger" href="#" onClick={handleLogout}><i className="fa-solid fa-right-from-bracket me-2"></i>Logout</a></li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                <li className="nav-item"><Link className="btn btn-gradient btn-sm px-3 ms-lg-2" to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
