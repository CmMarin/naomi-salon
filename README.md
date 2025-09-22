# Naomi's Barbershop Booking App

A full-stack booking application for Naomi's Barbershop built with Next.js, React, Node.js, Express, and SQLite.

## Features

### Customer Features
- **Service Selection**: Browse available barbershop services
- **Calendar Booking**: Interactive calendar to select appointment dates and times
- **Real-time Availability**: See booked and available time slots
- **Customer Information**: Enter name, phone, and optional email
- **Booking Confirmation**: Instant confirmation with appointment details

### Admin Features
- **Secure Login**: Admin authentication system
- **Dashboard Overview**: Stats and booking summary
- **Booking Management**: View, update status, and delete bookings
- **Date Organization**: Bookings grouped by date for easy management

## Tech Stack

### Frontend
- **Next.js 15.5.3** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling and responsive design

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **SQLite3** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## Project Structure

```
NaomiAPP/
├── src/                          # Frontend source
│   ├── app/                      # Next.js App Router
│   │   ├── admin/               # Admin dashboard
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   └── globals.css          # Global styles
│   ├── components/              # React components
│   │   ├── ServicesList.tsx     # Service selection
│   │   ├── Calendar.tsx         # Date/time picker
│   │   └── BookingForm.tsx      # Customer form
│   ├── lib/                     # Utilities
│   │   ├── api.ts              # API client functions
│   │   └── utils.ts            # Helper functions
│   └── types/                   # TypeScript definitions
│       └── index.ts            # Shared types
├── backend/                     # Backend source
│   ├── src/
│   │   ├── database/           # Database setup
│   │   │   ├── database.ts     # DB connection & schema
│   │   │   └── migrate.ts      # Migration script
│   │   ├── routes/             # API routes
│   │   │   ├── bookings.ts     # Booking endpoints
│   │   │   ├── services.ts     # Service endpoints
│   │   │   └── admin.ts        # Admin endpoints
│   │   └── server.ts           # Express server
│   ├── database/               # SQLite database files
│   └── package.json           # Backend dependencies
└── package.json               # Frontend dependencies
```

## 🚀 Quick Start

**Choose your preferred method to start the app:**

### Method 1: One-Click Start (Recommended)
```bash
# Double-click this file in Windows Explorer:
start.bat
```

### Method 2: PowerShell Script
```powershell
./start.ps1
```

### Method 3: npm Script (Single Terminal)
```bash
npm run start:all
```

### Method 4: Manual Setup
```bash
# Install dependencies first (only needed once)
npm install
cd backend && npm install && cd ..

# Start both servers
npm run dev          # Frontend (Terminal 1)
cd backend && npm run dev  # Backend (Terminal 2)
```

**📖 For detailed instructions, see: [START_HERE.md](START_HERE.md)**

## Access Points

- **Main App**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin (admin/admin123)
- **API**: http://localhost:3001/api

## Getting Started (Detailed)

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install frontend dependencies:**
   ```bash
   npm install
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Initialize the database:**
   ```bash
   npm run db:migrate
   ```

### Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   The API will be available at `http://localhost:3001`

2. **Start the frontend development server:**
   ```bash
   # In the root directory
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

## Usage

### Customer Booking Flow

1. **Select Service**: Choose from available barbershop services
2. **Pick Date & Time**: Use the calendar to select an appointment slot
3. **Enter Details**: Provide name, phone, and optional email
4. **Confirm Booking**: Review and submit the appointment

### Admin Dashboard

1. **Access**: Navigate to `/admin` or click "Admin Dashboard" link
2. **Login**: Use credentials (default: admin/admin123)
3. **Manage**: View all bookings, update status, or delete appointments
4. **Monitor**: See booking stats and daily schedules

## Database Schema

### Services Table
- `id` - Primary key
- `name` - Service name
- `duration` - Duration in minutes
- `price` - Service price
- `description` - Service description

### Bookings Table
- `id` - Primary key
- `customer_name` - Customer full name
- `customer_phone` - Contact phone
- `customer_email` - Contact email (optional)
- `service_id` - Foreign key to services
- `appointment_date` - Booking date
- `appointment_time` - Booking time
- `status` - confirmed/completed/cancelled
- `notes` - Additional notes

### Admin Table
- `id` - Primary key
- `username` - Admin username
- `password_hash` - Hashed password

## API Endpoints

### Services
- `GET /api/services` - Get all services

### Bookings
- `GET /api/bookings` - Get all bookings (admin)
- `GET /api/bookings/date/:date` - Get bookings for specific date
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/:id/status` - Update booking status
- `DELETE /api/bookings/:id` - Delete booking

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/verify` - Verify admin token

## Default Data

### Services
- Basic Haircut ($25, 30min)
- Beard Trim ($15, 15min)
- Haircut + Beard ($35, 45min)
- Hot Towel Shave ($30, 30min)
- Kids Cut ($20, 20min)

### Admin Credentials
- **Username**: admin
- **Password**: admin123

## Environment Variables

Backend environment variables (`.env` file):
```
PORT=3001
JWT_SECRET=your_jwt_secret_here_change_in_production
ADMIN_PASSWORD=admin123
DB_PATH=./database/bookings.db
```

## Development Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build production app
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript
- `npm run start` - Start production server
- `npm run db:migrate` - Initialize database

## Customization

### Adding New Services
1. Insert into the services table via admin or directly in the database
2. Services will automatically appear in the booking flow

### Changing Operating Hours
Modify `generateTimeSlots()` function in `src/lib/utils.ts`

### Styling
- Tailwind CSS classes can be modified in component files
- Global styles in `src/app/globals.css`

## Deployment

### Frontend (Vercel)
1. Build the app: `npm run build`
2. Deploy the `.next` folder and `package.json`

### Backend (Railway/Heroku)
1. Ensure environment variables are set
2. The database will be created automatically on first run

## Security Notes

- Change the default admin password in production
- Use a strong JWT secret
- Consider implementing rate limiting for production use
- Validate all user inputs on both client and server sides

## Troubleshooting

### Common Issues

1. **Database not found**: Run `npm run db:migrate` in the backend folder
2. **API connection failed**: Ensure backend server is running on port 3001
3. **Build errors**: Check TypeScript types and ensure all dependencies are installed

## License

This project is for educational and personal use.