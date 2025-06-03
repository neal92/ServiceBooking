# ServiceBooking Application

## Running the Application

To run both the frontend and backend together:

```bash
# From the project root
npm run start-dev
```

This will start:
- The React frontend on http://localhost:5173
- The Node.js backend on http://localhost:5000

## Development

For separate development:

```bash
# Frontend only
npm run dev

# Backend only (from the server directory)
cd server
npm run dev
```

## User Credentials

To check existing user credentials:

```bash
# From the server directory
cd server
node scripts/check-users.js
```

## Database Setup

If you need to initialize the database:

```bash
# From the server directory
cd server
npm run init-db
```
