# 🚀 Quick Start Guide

## How to Start the Naomi's Barbershop Booking App

You have **3 different ways** to start both the frontend and backend servers:

### Option 1: Double-click the Batch File (Easiest)
```
🖱️ Double-click: start.bat
```
This opens two separate command windows - one for backend, one for frontend.

### Option 2: Run the PowerShell Script
```powershell
./start.ps1
```
This also opens two separate PowerShell windows.

### Option 3: Use npm script (Single Terminal)
```bash
npm run start:all
```
This runs both servers in a single terminal with colored output.

---

## 🌐 Access the Application

Once started, you can access:

- **Main Booking Site**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Backend API**: http://localhost:3001/api

### 👤 Admin Credentials
- **Username**: admin
- **Password**: admin123

---

## 🛠️ Manual Setup (if scripts don't work)

If the automated scripts have issues, you can start manually:

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
npm run dev
```

---

## 🔧 Troubleshooting

### PowerShell Execution Policy Issues:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port Conflicts:
- Backend should run on port 3001
- Frontend should run on port 3000 (or next available)

### Database Issues:
```bash
cd backend
npm run db:migrate
```

---

## 📁 Project Structure
```
NaomiAPP/
├── start.bat          # Windows batch startup script
├── start.ps1          # PowerShell startup script  
├── frontend files...  # Next.js frontend
└── backend/           # Express.js API server
```

## ✅ Everything Working?
You should see:
- ✅ Backend: "Server is running on port 3001"
- ✅ Frontend: "Ready in X.Xs" on localhost:3000
- ✅ No errors in either terminal