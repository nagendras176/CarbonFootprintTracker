# Environment Setup for Carbon Footprint Tracker

## Required Environment Variables

Create a `.env` file in the root directory of the project with the following variables:

```env
# Node Environment
NODE_ENV=development

# Server Configuration
PORT=8080

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/carbon_footprint_db

# API Configuration
VITE_API_BASE_URL=http://localhost:9000

# JWT Secret (change this in production)
JWT_SECRET=your-secret-key-change-in-production
```

## Environment Variables Explained

### `NODE_ENV`
- **Development**: `development`
- **Production**: `production`
- Controls build optimization and error handling

### `PORT`
- Default: `8080`
- The port on which the server will run

### `DATABASE_URL`
- **Format**: `postgresql://username:password@host:port/database_name`
- **Example**: `postgresql://myuser:mypassword@localhost:5432/carbon_footprint_db`
- Required for database connections using Neon PostgreSQL

### `VITE_API_BASE_URL`
- **Development**: `http://localhost:9000`
- **Production**: Your production API URL
- Used by the client to connect to the server API

### `JWT_SECRET`
- **Development**: Can use default value
- **Production**: Must be a strong, unique secret
- Used for JWT token signing and verification

## Setup Instructions

1. **Create the `.env` file**:
   ```bash
   touch .env
   ```

2. **Copy the environment variables** above into the `.env` file

3. **Update the values** according to your setup:
   - Replace `username`, `password`, `host`, `port`, and `database_name` in `DATABASE_URL`
   - Change `JWT_SECRET` to a strong secret in production
   - Update `VITE_API_BASE_URL` for production deployment

4. **Verify the setup**:
   ```bash
   npm run dev
   ```

## Production Considerations

- Set `NODE_ENV=production`
- Use a strong, unique `JWT_SECRET`
- Use your production database URL
- Update `VITE_API_BASE_URL` to your production domain
- Ensure all secrets are properly secured

## Database Setup

The application uses Neon PostgreSQL. Make sure your database is properly configured and the connection string is correct.

## Security Notes

- Never commit `.env` files to version control
- Use different secrets for development and production
- Rotate secrets regularly in production
- Consider using environment variable management services for production 