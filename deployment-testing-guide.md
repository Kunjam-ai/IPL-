# Deployment and Testing Guide

This document provides step-by-step instructions for deploying and testing the IPL Fantasy League Tracker application.

## Prerequisites

Before deployment, ensure you have:
- A Supabase account (for PostgreSQL database)
- A Render account (for backend API)
- A Vercel account (for frontend application)
- Git repository set up (optional but recommended)

## Step 1: Database Deployment (Supabase)

1. Create a new Supabase project:
   - Name: `ipl-fantasy-tracker-db`
   - Generate a secure password
   - Select the free tier

2. Once your project is created, go to the SQL Editor and run the schema.sql script:
   - Copy the contents of `/database/schema.sql`
   - Create a new query in Supabase SQL Editor
   - Paste the schema and execute

3. Get your database connection string:
   - Go to Settings > Database
   - Copy the connection string format: `postgresql://postgres:[your-password]@[project-id].supabase.co:5432/postgres`
   - Save this for configuring the backend

## Step 2: Backend Deployment (Render)

1. Create a new Web Service on Render:
   - Connect to your Git repository or use the public repository URL
   - Name: `ipl-fantasy-tracker-api`
   - Environment: Node
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node server.js`
   - Select the Free plan

2. Set up environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render will override this)
   - `JWT_SECRET`: A secure random string
   - `JWT_EXPIRES_IN`: `7d`
   - `DATABASE_URL`: Your Supabase connection string from Step 1

3. Deploy the service and wait for the build to complete
   - Note the URL of your deployed API (e.g., `https://ipl-fantasy-tracker-api.onrender.com`)

## Step 3: Frontend Deployment (Vercel)

1. Update the API URL in the frontend:
   - Create a `.env` file in the frontend directory:
   ```
   REACT_APP_API_URL=https://ipl-fantasy-tracker-api.onrender.com
   ```

2. Deploy to Vercel:
   - Run `cd frontend && vercel`
   - Follow the prompts to configure your deployment
   - Set the environment variable in Vercel dashboard

3. Once deployed, Vercel will provide a URL for your application

## Step 4: Testing the Deployed Application

### Backend API Testing

1. Test the API health endpoint:
   ```
   curl https://ipl-fantasy-tracker-api.onrender.com/
   ```
   Expected response: `{"message":"Welcome to IPL Fantasy League Tracker API"}`

2. Test user registration:
   ```
   curl -X POST https://ipl-fantasy-tracker-api.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
   ```

3. Test user login:
   ```
   curl -X POST https://ipl-fantasy-tracker-api.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```
   Save the token from the response for further testing

### Frontend Testing

1. Open the Vercel-deployed URL in a browser

2. Test user registration and login:
   - Create a new account
   - Log in with the created account

3. Test tournament functionality:
   - Create a new tournament
   - Join a tournament using the code
   - View tournament details and leaderboard

4. Test admin functionality:
   - Log in with an admin account
   - Create matches
   - Enter fantasy points

## Troubleshooting

### Database Connection Issues
- Verify the DATABASE_URL environment variable is correctly set
- Check if IP restrictions are enabled in Supabase
- Ensure the database password is correctly included in the connection string

### Backend Deployment Issues
- Check Render logs for any errors
- Verify all environment variables are correctly set
- Remember that free tier services on Render spin down after 15 minutes of inactivity

### Frontend Deployment Issues
- Verify the REACT_APP_API_URL is correctly set
- Check browser console for any errors
- Ensure CORS is properly configured in the backend

## Monitoring

- Monitor backend logs through Render dashboard
- Set up alerts for service health notifications
- Regularly check Supabase dashboard for database performance
