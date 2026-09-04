import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deleteNote, getMyNotes, downloadFile } from '../api.js';
import { useApp } from '../AppContext.jsx';

export default function MyNotes() {
  const { session, showToast } = useApp();
  const [downloadingId, setDownloadingId] = useState(null);
  async function handleDownload(note) {
    if (!note.file?.filename) return;
    setDownloadingId(note._id);
    try { await downloadFile(note._id, note.file.originalName || note.file.filename); showToast('Download started.'); }
    catch (e) { showToast(e.message || 'Unable to download the file.', 'error'); }
    finally { setDownloadingId(null); }
  }
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) { navigate('/login'); return; }
    getMyNotes(session.token).then(setNotes).catch(e => showToast(e.message, 'error')).finally(() => setLoading(false));
  }, [session, navigate, showToast]);

  async function remove(id) {
    if (!window.confirm('Delete this note permanently?')) return;
    try { await deleteNote(id, session.token); setNotes(prev => prev.filter(n => n._id !== id)); showToast('Note deleted successfully.'); }
    catch (e) { showToast(e.message, 'error'); }
  }

  if (!session) return null;
  return <>
    <header className="page-hero text-center"><div className="container"><h1 className="fw-bold">My Notes</h1><p className="mb-0">Manage the notes you have shared</p></div></header>
    <div className="container py-5">
      {loading ? <p className="text-muted">Loading your notes...</p> : notes.length === 0 ? <div className="empty-state"><i className="fa-regular fa-folder-open"></i><p>You haven't uploaded any notes yet.</p><Link to="/upload" className="btn btn-gradient">Upload Your First Note</Link></div> :
      <div className="row g-4">{notes.map(n => <div className="col-md-6 col-lg-4" key={n._id}><div className="category-card h-100"><span className="badge-cat mb-2 d-inline-block">{n.category}</span><h5 className="fw-bold">{n.title}</h5><p className="text-muted small">{n.description}</p><div className="small text-muted mb-3">{n.views || 0} views · {n.file?.originalName || 'No file'}</div><div className="d-flex gap-2 flex-wrap"><Link to={`/notes/${n._id}`} className="btn btn-outline-primary btn-sm">View</Link>{n.file?.filename && <button type="button" onClick={() => handleDownload(n)} disabled={downloadingId === n._id} className="btn btn-outline-success btn-sm">{downloadingId === n._id ? 'Downloading...' : 'Download'}</button>}<Link to={`/upload?edit=${n._id}`} className="btn btn-outline-secondary btn-sm">Edit</Link><button onClick={() => remove(n._id)} className="btn btn-outline-danger btn-sm">Delete</button></div></div></div>)}</div>}
    </div>
  </>;
}
