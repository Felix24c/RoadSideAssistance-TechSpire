### QuickAssist Frontend Setup & Usage

## 1. Clone the repository

```powershell
git clone <your-repo-url>
cd RoadSideAssistance-TechSpire/frontend
```
---

## 2. Install Node.js dependencies
Make sure you have Node.js and npm installed, then run:

```powershell
npm install
```

This will install all required packages, including React, React Router, and CSS dependencies.
---

## 3. Start the development server

```powershell
npm start
```

This starts the frontend development server.
---

Open your browser and visit:
```powershell
http://localhost:3000
```

The frontend will automatically reload if you edit any files in src/.
---

## 4. Connect to the backend

Make sure the backend server is running (see backend README).
---

## 5. Build for production (optional)

```powershell
npm run build
```

This generates optimized static files in the build/ folder.
You can deploy these static files to any hosting service.

### Notes

Node.js version >= 18 is recommended.

Frontend changes are automatically hot-reloaded during development.

Ensure the backend server is running before interacting with API endpoints.

