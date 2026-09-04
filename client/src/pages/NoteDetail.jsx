import React, { useEffect, useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { useParams, Link } from 'react-router-dom';
import {
  getNoteById,
  CATEGORIES,
  getFileUrl,
  downloadFile
} from '../api.js';

export default function NoteDetail() {
  const { id } = useParams();
  const { showToast } = useApp();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');

    getNoteById(id)
      .then(setNote)
      .catch((e) => setError(e.message || 'Unable to load note.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5">
        <p className="text-muted">Loading note...</p>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="container py-5">
        <div className="empty-state">
          <i className="fa-regular fa-face-frown"></i>
          <p>{error || 'Note not found.'}</p>

          <Link
            to="/notes"
            className="btn btn-gradient mt-2"
          >
            Back to Browse Notes
          </Link>
        </div>
      </div>
    );
  }

  const cat = CATEGORIES.find((c) => c.id === note.category);

  const fileName =
    note.file?.originalName ||
    note.file?.filename ||
    'note-file';

  const fileUrl = note.file?.filename
    ? getFileUrl(note._id)
    : '';

  const extension = fileName
    .split('.')
    .pop()
    .toLowerCase();

  const isPdf = extension === 'pdf';

  const isImage = [
    'jpg',
    'jpeg',
    'png',
    'webp',
    'gif'
  ].includes(extension);

  const isOfficeFile = [
    'doc',
    'docx',
    'ppt',
    'pptx'
  ].includes(extension);

  async function handleDownload() {
    if (!note.file?.filename || downloading) return;

    setDownloading(true);

    try {
      await downloadFile(
        note._id,
        fileName
      );

      showToast('Download started.');
    } catch (e) {
      showToast(
        e.message || 'Unable to download the file.',
        'error'
      );
    } finally {
      setDownloading(false);
    }
  }

  function handleView() {
    if (!note.file?.filename) {
      showToast(
        'No file is attached to this note.',
        'error'
      );
      return;
    }

    setShowPreview(true);
  }

  function handleClosePreview() {
    setShowPreview(false);
  }

  return (
    <div className="container py-5">

      {/* =========================
          BREADCRUMB
      ========================== */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>

          <li className="breadcrumb-item">
            <Link to="/notes">Notes</Link>
          </li>

          <li className="breadcrumb-item active">
            {note.title}
          </li>
        </ol>
      </nav>


      <div className="row g-4">

        {/* =========================
            MAIN CONTENT
        ========================== */}
        <div className="col-lg-8">

          {/* Category */}
          <span className="badge-cat mb-3 d-inline-block">
            {cat ? cat.name : note.category}
          </span>


          {/* Title */}
          <h1 className="fw-bold">
            {note.title}
          </h1>


          {/* Note information */}
          <p className="text-muted">

            <i className="fa-regular fa-user me-1"></i>
            {note.author}

            &nbsp;•&nbsp;

            <i className="fa-regular fa-eye me-1"></i>
            {(note.views || 0).toLocaleString()} views

            &nbsp;•&nbsp;

            <i className="fa-regular fa-file me-1"></i>
            {note.fileType || extension.toUpperCase()}

          </p>

          <hr />


          {/* =========================
              DESCRIPTION
          ========================== */}
          <h5 className="fw-bold">
            Description
          </h5>

          <p>
            {note.description}
          </p>


          {/* =========================
              FILE PREVIEW AREA
          ========================== */}

          {!showPreview && (
            <div
              className="note-thumb rounded mt-4 d-flex flex-column align-items-center justify-content-center"
              style={{
                height: 280,
                background: '#f5f6fa',
                border: '1px solid #e5e7eb'
              }}
            >
              <i
                className={
                  isPdf
                    ? 'fa-solid fa-file-pdf fa-4x text-danger'
                    : isImage
                    ? 'fa-solid fa-image fa-4x text-primary'
                    : isOfficeFile
                    ? 'fa-solid fa-file-word fa-4x text-primary'
                    : 'fa-solid fa-file-lines fa-4x text-secondary'
                }
              ></i>

              <p className="mt-3 mb-0 fw-semibold">
                {fileName}
              </p>

              {note.file?.size && (
                <small className="text-muted">
                  {(note.file.size / 1024 / 1024).toFixed(2)} MB
                </small>
              )}
            </div>
          )}


          {/* =========================
              PREVIEW
          ========================== */}

          {showPreview && note.file?.filename && (
            <div className="mt-4">

              {/* Preview header */}
              <div className="d-flex justify-content-between align-items-center mb-3">

                <h5 className="fw-bold mb-0">
                  <i className="fa-solid fa-eye me-2"></i>
                  Preview
                </h5>

                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleClosePreview}
                >
                  <i className="fa-solid fa-xmark me-1"></i>
                  Close
                </button>

              </div>


              {/* PDF Preview */}
              {isPdf && (
                <div
                  style={{
                    width: '100%',
                    height: '650px',
                    border: '1px solid #ddd',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: '#f8f9fa'
                  }}
                >
                  <iframe
                    src={fileUrl}
                    title={fileName}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                  />
                </div>
              )}


              {/* Image Preview */}
              {isImage && (
                <div
                  className="text-center p-3"
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '10px',
                    background: '#f8f9fa'
                  }}
                >
                  <img
                    src={fileUrl}
                    alt={fileName}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '650px',
                      objectFit: 'contain',
                      borderRadius: '8px'
                    }}
                  />
                </div>
              )}


              {/* Office File */}
              {isOfficeFile && (
                <div
                  className="text-center p-5"
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '10px',
                    background: '#f8f9fa'
                  }}
                >
                  <i
                    className="fa-solid fa-file-lines fa-4x mb-3"
                  ></i>

                  <h5 className="fw-bold">
                    Preview not available
                  </h5>

                  <p className="text-muted">
                    Browser preview is not available for
                    {` ${extension.toUpperCase()}`} files.
                  </p>

                  <p className="text-muted small">
                    You can download the file and open it
                    using Microsoft Word or PowerPoint.
                  </p>
                </div>
              )}


              {/* Other file types */}
              {!isPdf &&
                !isImage &&
                !isOfficeFile && (
                  <div
                    className="text-center p-5"
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '10px',
                      background: '#f8f9fa'
                    }}
                  >
                    <i className="fa-solid fa-file fa-4x mb-3"></i>

                    <h5 className="fw-bold">
                      Preview not available
                    </h5>

                    <p className="text-muted">
                      This file type cannot be previewed
                      directly in the browser.
                    </p>
                  </div>
                )}

            </div>
          )}


          {/* =========================
              ACTION BUTTONS
          ========================== */}

          <div className="d-flex flex-wrap gap-2 mt-4">

            {/* View Button */}
            {note.file?.filename ? (
              <button
                type="button"
                className="btn btn-gradient btn-lg"
                onClick={handleView}
              >
                <i className="fa-solid fa-eye me-2"></i>
                {showPreview ? 'Previewing' : 'View Note'}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                disabled
              >
                <i className="fa-solid fa-ban me-2"></i>
                File unavailable
              </button>
            )}


            {/* Open in New Tab */}
            {note.file?.filename && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary btn-lg"
              >
                <i className="fa-solid fa-up-right-from-square me-2"></i>
                Open
              </a>
            )}


            {/* Download Button */}
            {note.file?.filename && (
              <button
                type="button"
                className="btn btn-outline-dark btn-lg"
                onClick={handleDownload}
                disabled={downloading}
              >
                <i className="fa-solid fa-download me-2"></i>

                {downloading
                  ? 'Downloading...'
                  : 'Download'}
              </button>
            )}

          </div>

        </div>


        {/* =========================
            SIDEBAR
        ========================== */}

        <div className="col-lg-4">

          <div className="category-card">

            <h5 className="fw-bold mb-3">
              Uploaded by
            </h5>


            {/* Author */}
            <div className="d-flex align-items-center gap-2 mb-3">

              <div className="contributor-avatar">
                {note.author
                  ? note.author.charAt(0).toUpperCase()
                  : '?'}
              </div>

              <div className="fw-semibold">
                {note.author}
              </div>

            </div>


            {/* Note information */}
            <h6 className="fw-bold mt-4">
              Note Info
            </h6>

            <ul className="list-unstyled small text-muted">

              <li className="mb-2">
                <i className="fa-regular fa-file me-2"></i>
                <strong>File:</strong>{' '}
                {fileName || 'Not attached'}
              </li>


              <li className="mb-2">
                <i className="fa-solid fa-hard-drive me-2"></i>
                <strong>Size:</strong>{' '}
                {note.file?.size
                  ? `${(
                      note.file.size /
                      1024 /
                      1024
                    ).toFixed(2)} MB`
                  : '—'}
              </li>


              <li className="mb-2">
                <i className="fa-regular fa-eye me-2"></i>
                <strong>Views:</strong>{' '}
                {(note.views || 0).toLocaleString()}
              </li>


              <li>
                <i className="fa-solid fa-file-code me-2"></i>
                <strong>Type:</strong>{' '}
                {extension
                  ? extension.toUpperCase()
                  : note.fileType || '—'}
              </li>

            </ul>

          </div>

        </div>

      </div>

    </div>
  );
}