# Schola Backend (MVC) - Sample Scaffold

This scaffold provides a Node.js (Express) + Firebase Admin (Firestore) backend structured in MVC style.
It includes controllers with working sample CRUD logic against Firestore (you must provide a Firebase service account).

## Setup

1. Copy your Firebase service account JSON to project root and set path in `.env` as `FIREBASE_SERVICE_ACCOUNT=./serviceAccountKey.json`.
2. Copy `.env.example` to `.env` and edit `JWT_SECRET` and other values.
3. Install:
   ```bash
   npm install
   ```
4. Run:
   ```bash
   node app.js
   ```

## Notes
- Controllers here contain example logic and minimal validation. Harden validation and add authentication & authorization for production.
- Do not commit service account JSON to version control.
