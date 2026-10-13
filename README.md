# Student Project Tracker

A hands-on web app development workshop project. It adds, displays, edits and deletes engineering projects, with data stored in a local SQLite database.

## Run locally

Requirements: Node.js, Git and VS Code.

Open a PowerShell terminal inside the project folder and run:

```powershell
npm.cmd ci
npm.cmd start
```

Open http://localhost:3000 in your browser.

To stop the server, press `Ctrl + C` in the terminal.

## How it works

Browser HTML/CSS/JavaScript → fetch/HTTP → Express API → SQLite → JSON response → updated page.

- `public/index.html`: page structure and form.
- `public/style.css`: appearance and responsive layout.
- `public/script.js`: input handling, API requests, rendering and feedback.
- `server.js`: starts the local server.
- `app.js`: API routes, validation and responses.
- `database.js`: SQLite operations and local database setup.

The SQLite database is stored locally at `data/projects.db`.

## API endpoints

- `GET /api/health` — checks server health.
- `GET /api/projects` — retrieves all projects.
- `POST /api/projects` — creates a project.
- `PUT /api/projects/:id` — updates a project.
- `DELETE /api/projects/:id` — deletes a project.

## Verification

- **Automated API test:** Passed. `npm.cmd test` reported 1 test and 0 failures. The reference test covers CRUD, validation, persistence, API errors and the static frontend using a temporary database.
- **Health endpoint:** Verified at `http://localhost:3000/api/health`; returned `{"ok":true}`.
- **Projects endpoint:** Verified at `http://localhost:3000/api/projects`; returned a JSON project list.
- **Browser CRUD:** Not yet recorded as fully verified.
- **Restart persistence:** Not yet recorded as verified.
- **Failed-save recovery and successful retry:** Not yet recorded as verified.
- **390px mobile layout and keyboard focus:** Not yet recorded as verified.

Only mark additional checks as passed after performing them.

## Workshop limitations

This local teaching app has no sign-in or per-user permissions. Browsers connecting to the same server share the project collection.

The local SQLite database and `node_modules` are not uploaded to GitHub. Hosting the application online requires separate server and database configuration.