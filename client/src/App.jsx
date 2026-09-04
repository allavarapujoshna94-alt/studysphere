import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './AppContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Notes from './pages/Notes.jsx';
import NoteDetail from './pages/NoteDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Upload from './pages/Upload.jsx';
import MyNotes from './pages/MyNotes.jsx';

export default function App() {
  return (
    <AppProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/notes/:id" element={<NoteDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/my-notes" element={<MyNotes />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </AppProvider>
  );
}

function NotFound() {
  return (
    <div className="container py-5">
      <div className="empty-state">
        <i className="fa-solid fa-triangle-exclamation"></i>
        <p>404 — Page not found.</p>
      </div>
    </div>
  );
}
