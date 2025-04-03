# Deployment Configuration for Render (Backend)

This file contains instructions for deploying the Node.js/Express backend to Render.

## Prerequisites
- A Render account (free tier)
- Git repository with the project code

## Steps to Deploy

1. Log in to your Render account at https://dashboard.render.com/

2. Click on "New" and select "Web Service"

3. Connect your Git repository or use the public repository URL

4. Configure the service:
   - Name: `ipl-fantasy-tracker-api`
   - Environment: `Node`
   - Region: Choose the region closest to your users
   - Branch: `main` (or your default branch)
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node server.js`
   - Plan: Free

5. Set up environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render will automatically set the PORT)
   - `JWT_SECRET`: A secure random string for JWT token generation
   - `JWT_EXPIRES_IN`: `7d`
   - `DATABASE_URL`: Your PostgreSQL connection string from Supabase

6. Click "Create Web Service"

## Auto-Deploy

Render automatically deploys when you push changes to your connected repository. No additional configuration is needed.

## Custom Domain (Optional)

To use a custom domain:
1. Go to your web service in Render dashboard
2. Navigate to "Settings" > "Custom Domain"
3. Add your domain and follow the verification steps

## Monitoring and Logs

Render provides built-in monitoring and logs:
1. Go to your web service in Render dashboard
2. Navigate to "Logs" to view application logs
3. Set up alerts in "Settings" > "Alerts" for service health notifications

## Important Notes

- Free tier services on Render will spin down after 15 minutes of inactivity
- The first request after inactivity may take a few seconds to respond
- Free tier is limited to 750 hours of runtime per month
