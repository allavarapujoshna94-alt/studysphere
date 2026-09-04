import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getNotes, categoryStats, CATEGORIES } from '../api.js';
import NoteCard from '../components/NoteCard.jsx';
import { getSession } from '../api.js';



export default function Home() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const session=getSession();
  const isLoggedIn= !!session;

  useEffect(() => {
    let cancelled = false;
    getNotes()
      .then((data) => { if (!cancelled) setNotes(data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    navigate(query ? `/notes?q=${encodeURIComponent(query)}` : '/notes');
  }

  const stats = categoryStats(notes);
  const totalViews = notes.reduce((s, n) => s + (n.views || 0), 0);
  const contributorMap = notes.reduce((map, n) => {
    map[n.author] = (map[n.author] || 0) + 1;
    return map;
  }, {});
  const contributors = Object.entries(contributorMap).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const contributorCount = Object.keys(contributorMap).length;
  const recent = notes.slice(0, 8);

  return (
    <>
      <header className="hero text-center">
        <div className="container">
          <h1>Share Knowledge, Learn Together</h1>
          <p className="lead mt-3 mb-0">
            Join thousands of students and educators sharing notes, documents, and study materials.
            <br />Build your digital library and discover valuable resources.
          </p>
          <div className="d-flex justify-content-center gap-3 mt-4">
  {isLoggedIn ? (
    <>
      <Link
        to="/upload"
        className="btn btn-light btn-lg fw-semibold"
      >
        <i className="fa-solid fa-upload me-2"></i>
        Upload Note
      </Link>

      <Link
        to="/my-notes"
        className="btn btn-outline-light btn-lg"
      >
        <i className="fa-solid fa-folder me-2"></i>
        My Notes
      </Link>
    </>
  ) : (
    <>
      <Link
        to="/register"
        className="btn btn-light btn-lg fw-semibold"
      >
        Get Started
      </Link>

      <Link
        to="/login"
        className="btn btn-outline-light btn-lg"
      >
        Sign In
      </Link>
    </>
  )}
</div>
          <form className="search-box d-flex" onSubmit={handleSearch}>
            <input
              type="search"
              className="form-control form-control-lg"
              placeholder='Try: "mathematics", "computer science"...'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn btn-light fw-semibold" type="submit">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </form>
        </div>
      </header>

      <div className="container stats-strip">
        <div className="row g-3">
          <div className="col-6 col-md-3"><div className="stat-card"><h3>{notes.length}</h3><small>Total Notes</small></div></div>
          <div className="col-6 col-md-3"><div className="stat-card"><h3>{totalViews.toLocaleString()}</h3><small>Total Views</small></div></div>
          <div className="col-6 col-md-3"><div className="stat-card"><h3>{CATEGORIES.length}</h3><small>Categories</small></div></div>
          <div className="col-6 col-md-3"><div className="stat-card"><h3>{contributorCount}</h3><small>Contributors</small></div></div>
        </div>
      </div>

      {error && (
        <div className="container mt-4">
          <div className="alert alert-danger">
            Could not load notes from the server: {error}. Make sure the backend is running on port 5000.
          </div>
        </div>
      )}

      <section className="container py-5">
        <h2 className="section-title">Top Categories</h2>
        <p className="section-sub">Explore the most popular study material categories with comprehensive collections</p>
        <div className="row g-4">
          {stats.slice(0, 8).map((cat) => (
            <div className="col-md-6 col-lg-3" key={cat.id}>
              <Link to={`/notes?category=${cat.id}`} className="text-decoration-none">
                <div className="category-card">
                  <div className="category-icon"><i className={`fa-solid ${cat.icon}`}></i></div>
                  <div className="fw-bold text-dark">{cat.name}</div>
                  <div className="text-muted small">{cat.count} notes &bull; {cat.views.toLocaleString()} views</div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-4">
        <h2 className="section-title">Recently Added Notes</h2>
        <p className="section-sub">Fresh study material shared by the community</p>
        <div className="row g-4">
          {loading ? (
            <p className="text-muted">Loading notes...</p>
          ) : recent.length ? (
            recent.map((note) => <NoteCard note={note} key={note._id} />)
          ) : (
            <div className="col-12"><div className="empty-state"><i className="fa-regular fa-folder-open"></i><p>No notes yet.</p></div></div>
          )}
        </div>
        <div className="text-center mt-4">
          <Link to="/notes" className="btn btn-outline-gradient px-4">Browse All Notes</Link>
        </div>
      </section>

      <section className="container py-5">
        <h2 className="section-title">Top Contributors</h2>
        <p className="section-sub">Meet our most dedicated community members</p>
        <div className="row g-4">
          {contributors.length ? contributors.map(([name, count], i) => (
            <div className="col-md-6 col-lg-3" key={name}>
              <div className="category-card text-center">
                <div className="contributor-avatar mx-auto mb-3" style={{ width: 56, height: 56, fontSize: '1.3rem' }}>{name.charAt(0).toUpperCase()}</div>
                <div className="fw-bold">{name}</div>
                <div className="text-muted small mb-1">Rank #{i + 1}</div>
                <div className="badge-cat">{count} note{count !== 1 ? 's' : ''}</div>
              </div>
            </div>
          )) : <p className="text-muted">No contributors yet.</p>}
        </div>
      </section>

      <section className="py-5" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
        <div className="container text-center text-white">
          <h2 className="fw-bold mb-2">Community Driven Learning</h2>
          <p className="mb-4">Every note, rating, and discussion is created by our amazing community.</p>
          <Link to="/register" className="btn btn-light btn-lg fw-semibold">Join Community</Link>
        </div>
      </section>
    </>
  );
}
