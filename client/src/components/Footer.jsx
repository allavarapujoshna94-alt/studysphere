import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="brand mb-2">ShareMyNotes</div>
            <p>Empowering students and educators to share knowledge through our digital notes sharing platform.</p>
          </div>
          <div className="col-6 col-lg-2">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/notes">Browse Notes</Link></li>
              <li><Link to="/upload">Upload Notes</Link></li>
            </ul>
          </div>
          <div className="col-6 col-lg-2">
            <h5>Account</h5>
            <ul className="list-unstyled">
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>
          <div className="col-lg-4">
            <h5>About This Project</h5>
            <p>A MERN stack college project — React frontend, Express + MongoDB backend.</p>
          </div>
        </div>
        <hr className="border-secondary mt-4" />
        <p className="text-center mb-0 small">&copy; {year} ShareMyNotes Clone. Built for educational purposes.</p>
      </div>
    </footer>
  );
}
