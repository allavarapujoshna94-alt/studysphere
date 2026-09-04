const configuredApi = import.meta.env.VITE_API_URL;
const BASE_URL = (configuredApi || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000/api' : '/api')).replace(/\/$/, '');

export const CATEGORIES = [
  { id: 'iit-jee', name: 'IIT-JEE', icon: 'fa-flask' },
  { id: 'programming', name: 'Programming', icon: 'fa-code' },
  { id: 'education', name: 'Education', icon: 'fa-graduation-cap' },
  { id: 'computer-science', name: 'Computer Science', icon: 'fa-laptop-code' },
  { id: 'science', name: 'Science', icon: 'fa-atom' },
  { id: 'competitive-exams', name: 'Competitive Exams', icon: 'fa-trophy' },
  { id: 'engineering', name: 'Engineering', icon: 'fa-cogs' },
  { id: 'psychology', name: 'Psychology', icon: 'fa-brain' },
  { id: 'history', name: 'History', icon: 'fa-landmark' },
  { id: 'neet', name: 'NEET', icon: 'fa-briefcase-medical' },
];

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = { ...(options.headers || {}) };
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export function getNotes(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.category) query.set('category', params.category);
  if (params.sort) query.set('sort', params.sort);
  return request(`/notes${query.toString() ? `?${query}` : ''}`);
}

export function getNoteById(id) { return request(`/notes/${id}`); }
export function getMyNotes(token) { return request('/notes/mine', { headers: { Authorization: `Bearer ${token}` } }); }

export function addNote(note, token) {
  return request('/notes', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: note });
}

export function updateNote(id, note, token) {
  return request(`/notes/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: note });
}

export function deleteNote(id, token) {
  return request(`/notes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
}

export function getFileUrl(id) { return `${BASE_URL}/notes/${encodeURIComponent(id)}/file`; }

export async function downloadFile(id, fileName, token = '') {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(getFileUrl(id), { headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Download failed (${res.status})`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName || 'note-file';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function categoryStats(notes) {
  return CATEGORIES.map((cat) => {
    const catNotes = notes.filter((n) => n.category === cat.id);
    return { ...cat, count: catNotes.length, views: catNotes.reduce((sum, n) => sum + (n.views || 0), 0) };
  });
}

export function registerUser(user) { return request('/auth/register', { method: 'POST', body: JSON.stringify(user) }); }
export function loginUser(email, password) { return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); }

const SESSION_KEY = 'smn_session';
export function getSession() {
  try { const raw = localStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
export function setSession(sessionData) { localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData)); }
export function clearSession() { localStorage.removeItem(SESSION_KEY); }
