import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { addNote, updateNote, getNoteById, CATEGORIES } from '../api.js';
import { useApp } from '../AppContext.jsx';

const allowed = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.webp'];
const maxSize = 25 * 1024 * 1024;

export default function Upload() {
  const { session, showToast } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get('edit');
  const isEdit = Boolean(editId);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [existingFile, setExistingFile] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!session) {
      showToast('Please login to upload notes.', 'error');
      const t = setTimeout(() => navigate('/login'), 800);
      return () => clearTimeout(t);
    }
    if (isEdit) {
      getNoteById(editId).then((n) => {
        if (String(n.uploadedBy) !== String(session.user.id)) throw new Error('You can only edit your own notes.');
        setTitle(n.title); setCategory(n.category); setDescription(n.description); setExistingFile(n.file?.originalName || 'No file attached');
      }).catch((err) => { showToast(err.message, 'error'); navigate('/my-notes'); }).finally(() => setLoading(false));
    }
  }, [session, navigate, showToast, isEdit, editId]);

  function chooseFile(selected) {
    if (!selected) return;
    const ext = `.${selected.name.split('.').pop()?.toLowerCase()}`;
    if (!allowed.includes(ext)) return showToast('Unsupported file type.', 'error');
    if (selected.size > maxSize) return showToast('File is too large. Maximum size is 25MB.', 'error');
    setFile(selected);
  }

  function handleDrop(e) {
    e.preventDefault(); setDragOver(false); chooseFile(e.dataTransfer.files?.[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity() || (!isEdit && !file)) { setValidated(true); if (!file && !isEdit) showToast('Please select a file.', 'error'); return; }
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', title.trim()); data.append('category', category); data.append('description', description.trim());
      if (file) { data.append('fileType', file.name.split('.').pop().toUpperCase()); data.append('file', file); }
      const saved = isEdit ? await updateNote(editId, data, session.token) : await addNote(data, session.token);
      showToast(isEdit ? 'Note updated successfully!' : 'Note published successfully!');
      setTimeout(() => navigate(`/notes/${saved._id}`), 500);
    } catch (err) { showToast(err.message, 'error'); } finally { setSubmitting(false); }
  }

  if (!session || loading) return <div className="container py-5"><p className="text-muted">Loading...</p></div>;

  return <>
    <header className="page-hero text-center"><div className="container"><h1 className="fw-bold">{isEdit ? 'Edit Note' : 'Upload Notes'}</h1><p className="mb-0">{isEdit ? 'Update your shared study material' : 'Share your study material with the community'}</p></div></header>
    <div className="container pb-5"><div className="auth-card" style={{ maxWidth: 620 }}>
      <form noValidate className={validated ? 'was-validated' : ''} onSubmit={handleSubmit}>
        <div className="mb-3"><label className="form-label">Note Title</label><input type="text" maxLength="120" className="form-control" required value={title} onChange={(e) => setTitle(e.target.value)} /><div className="invalid-feedback">Please enter a title.</div></div>
        <div className="mb-3"><label className="form-label">Category</label><select className="form-select" required value={category} onChange={(e) => setCategory(e.target.value)}><option value="" disabled>Select a category</option>{CATEGORIES.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}</select><div className="invalid-feedback">Please select a category.</div></div>
        <div className="mb-3"><label className="form-label">Description</label><textarea className="form-control" rows="4" maxLength="1000" required value={description} onChange={(e) => setDescription(e.target.value)} /><div className="invalid-feedback">Please add a short description.</div></div>
        <div className="mb-4"><label className="form-label">File {isEdit && <span className="text-muted small">(leave empty to keep current file)</span>}</label>
          <div className={`upload-dropzone ${dragOver ? 'dragover' : ''}`} onClick={() => fileInputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}>
            <i className="fa-solid fa-cloud-arrow-up fa-2x mb-2" style={{ color: '#667eea' }}></i>
            <p className="mb-1 fw-semibold">{file?.name || existingFile || 'Click to choose a file or drag it here'}</p>
            <p className="text-muted small mb-0">PDF, DOC/DOCX, PPT/PPTX, JPG, PNG or WEBP up to 25MB</p>
            <input type="file" className="d-none" ref={fileInputRef} accept={allowed.join(',')} onChange={(e) => chooseFile(e.target.files?.[0])} />
          </div>
        </div>
        <button type="submit" className="btn btn-gradient w-100 py-2 fw-semibold" disabled={submitting}>{submitting ? (isEdit ? 'Updating...' : 'Publishing...') : (isEdit ? 'Update Note' : 'Publish Note')}</button>
      </form>
    </div></div>
  </>;
}
