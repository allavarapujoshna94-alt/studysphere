# ShareMyNotes — MERN Stack (College Project)

A full-stack digital notes sharing platform built with **MongoDB, Express, React, and Node.js.**

```
sharemynotes-mern/
├── client/     ← React frontend (Vite)
└── server/     ← Express + MongoDB backend
```

---

## 1. Install MongoDB

You need MongoDB running somewhere. Pick ONE option:

### Option A: MongoDB Atlas (cloud, recommended — no install needed)
1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account
2. Create a free "M0" cluster
3. Under **Database Access**, create a database user (username + password)
4. Under **Network Access**, click "Add IP Address" → "Allow access from anywhere" (fine for a college project)
5. Click **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with what you created, and add `/sharemynotes` before the `?` so it saves to a database named `sharemynotes`:
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/sharemynotes?retryWrites=true&w=majority
   ```

### Option B: MongoDB installed locally on your PC
1. Download and install MongoDB Community Server: https://www.mongodb.com/try/download/community
2. During install, choose "Install as a Service" — it will start automatically
3. Your connection string is simply:
   ```
   mongodb://127.0.0.1:27017/sharemynotes
   ```

---

## 2. Set up the backend (`server/`)

1. Open a terminal in the `server` folder:
   ```
   cd server
   npm install
   ```
2. Copy `.env.example` to a new file named `.env`:
   ```
   copy .env.example .env
   ```
   (On Mac/Linux: `cp .env.example .env`)
3. Open `.env` and paste in your MongoDB connection string from Step 1 as `MONGO_URI`. Set `JWT_SECRET` to any random long string (e.g., mash your keyboard).
4. Seed the database with sample notes:
   ```
   npm run seed
   ```
   You should see `Seeded 18 notes.`
5. Start the backend server:
   ```
   npm run dev
   ```
   You should see:
   ```
   MongoDB connected: ...
   Server running on http://localhost:5000
   ```
   Leave this terminal running.

---

## 3. Set up the frontend (`client/`)

1. Open a **second** terminal (keep the backend one running) in the `client` folder:
   ```
   cd client
   npm install
   npm run dev
   ```
2. Open the URL shown (usually `http://localhost:5173`)

The frontend talks to the backend automatically — `vite.config.js` proxies any `/api/...` request to `http://localhost:5000`, so no extra configuration is needed.

---

## 4. Verify it's working

- Visit `http://localhost:5000/api/health` in your browser — you should see `{"status":"ok",...}`
- Visit `http://localhost:5173` — you should see notes loaded (fetched live from MongoDB, not localStorage anymore)
- Register a new account, then log in, then try "Upload Notes" — the new note is now saved permanently in your MongoDB database

---

## Architecture Overview (for your viva)

```
React (client, :5173)  →  fetch("/api/notes")  →  Vite proxy  →  Express (server, :5000)  →  Mongoose  →  MongoDB
```

### Backend structure
- `server.js` — starts Express, connects to MongoDB, mounts routes
- `config/db.js` — MongoDB connection logic (Mongoose)
- `models/User.js`, `models/Note.js` — Mongoose schemas defining the shape of documents in MongoDB
- `routes/authRoutes.js` — `POST /api/auth/register`, `POST /api/auth/login`
- `routes/noteRoutes.js` — `GET /api/notes`, `GET /api/notes/:id`, `POST /api/notes` (protected)
- `middleware/auth.js` — verifies the JWT token sent in the `Authorization` header, protecting the upload route
- `seed.js` — one-time script to populate the database with sample notes

### Frontend structure
- `src/api.js` — replaces the old `data.js`; every function now makes a real HTTP request (`fetch`) to the Express API instead of touching `localStorage`
- `src/AppContext.jsx` — still manages login state, but the session now holds a real JWT token issued by the server
- Pages (`Home.jsx`, `Notes.jsx`, etc.) — updated to `await` the API calls inside `useEffect`/event handlers, since network requests are asynchronous

### Authentication flow
1. User registers/logs in → password is hashed with **bcrypt** before ever being saved
2. Server verifies credentials and returns a **JWT token** (a signed, tamper-proof string identifying the user)
3. React stores that token in `localStorage` (just the token — not the password)
4. When uploading a note, React sends the token in the `Authorization: Bearer <token>` header
5. The `requireAuth` middleware on the server verifies the token before allowing the note to be created

### Why this is more "real" than the localStorage version
- Data is now stored centrally in a real database, not per-browser
- Passwords are hashed, not stored in plain text
- Multiple people (or your professor grading it) can register their own accounts and see the same shared notes
- This is the standard architecture used in real production web apps

---

## Common issues

**"MongoDB connection failed"** — Check your `MONGO_URI` in `server/.env`. For Atlas, make sure you replaced `<password>` with your actual password (no `<` `>` characters) and whitelisted your IP under Network Access.

**Frontend shows "Could not load notes from the server"** — Make sure the backend terminal is still running and shows `Server running on http://localhost:5000`.

**`npm install` fails with a PowerShell script error** — Run this once in PowerShell:
```
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## Updated features (bug fixes)

The project now includes:
- Real file upload using Multer (maximum 25MB).
- PDF, DOC/DOCX, PPT/PPTX, JPG, PNG and WEBP validation.
- Real file download from the Express server.
- User-owned notes using `uploadedBy` and JWT identity.
- My Notes page with View, Download, Edit and Delete actions.
- Edit notes with optional file replacement.
- Server-side search, category filtering and sorting.
- Better invalid-ID and upload error handling.
- Dynamic note metadata such as actual file name and size.

### Important
The new `server/uploads/` directory is created automatically. Uploaded files are stored there while note metadata is stored in MongoDB. For a production deployment, replace local file storage with object storage such as S3/Cloudinary.

If you already have old notes in MongoDB from the original version, those old notes do not have an uploaded file or `uploadedBy` value. They can still be viewed, but they cannot be edited/deleted by users until migrated or re-created.

## Download troubleshooting

The Download button now downloads the actual uploaded file through the Express API. Start both applications:

Terminal 1:
```bash
cd server
npm install
npm start
```

Terminal 2:
```bash
cd client
npm install
npm run dev
```

Keep the server running on `http://localhost:5000`. The client automatically uses `http://localhost:5000/api` when running locally, so downloads also work with Vite preview. If you deploy the API elsewhere, set `VITE_API_URL` to the deployed API URL.

Only files uploaded after the real upload feature was added have an actual stored file. Older database notes without `file.filename` will correctly show as unavailable.
