import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../api.js';

export default function NoteCard({ note }) {
  const cat = CATEGORIES.find((c) => c.id === note.category);

  return (
    <div className="col-md-6 col-lg-4 col-xl-3">
      <Link to={`/notes/${note._id}`} className="text-decoration-none">
        <div className="note-card">
          <div className="note-thumb">
            <i className="fa-solid fa-file-lines"></i>
          </div>
          <div className="body">
            <span className="badge-cat mb-2 align-self-start">{cat ? cat.name : note.category}</span>
            <div className="title">{note.title}</div>
            <div className="meta">
              <span><i className="fa-regular fa-eye me-1"></i>{(note.views || 0).toLocaleString()}</span>
              <span><i className="fa-regular fa-user me-1"></i>{note.author}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
