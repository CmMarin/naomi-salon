# Copy the database to the api directory for Vercel deployment
mkdir -p api/database
cp backend/database/bookings.db api/database/bookings.db 2>/dev/null || echo "Database will be created automatically"