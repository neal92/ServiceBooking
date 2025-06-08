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

## Avatars

The application supports both predefined avatars and custom user uploads. 

### Predefined Avatars
A set of predefined avatars is available in the `/public/avatars/` directory. To set them up:

1. Go to `/public/avatars/README.md` for the list of avatar URLs
2. Download each avatar from the provided DiceBear URLs
3. Save them in the `/public/avatars/` directory with the corresponding names (avatar1.png, avatar2.png, etc.)

### Custom Avatars
Users can also upload their own avatar images through the profile page. Supported formats:
- PNG
- JPEG
- SVG

Custom avatars are stored in the `server/public/uploads/` directory.
