# IPL Fantasy League Tracker - Simplified Deployment Guide

This guide provides easy-to-follow instructions for deploying the IPL Fantasy League Tracker application, even if you're not a technical person. We'll go through each step carefully.

## What You'll Need

1. A computer with internet access
2. Email address to create accounts on free services
3. About 30-45 minutes of your time

## Step 1: Create a Supabase Account (for the Database)

1. Open your web browser and go to: https://supabase.com/
2. Click on "Start your project" or "Sign Up"
3. You can sign up with GitHub if you have an account, or use your email
4. If using email, enter your email address and create a password
5. Verify your email by clicking the link sent to your inbox
6. Once logged in, click "New Project"
7. Fill in the following details:
   - Name: `IPL-Fantasy-Tracker`
   - Database Password: Create a strong password and SAVE IT somewhere safe
   - Region: Choose the one closest to you
   - Pricing Plan: Free tier
8. Click "Create new project" and wait for it to be created (takes 1-2 minutes)
9. When the project is ready, click on "SQL Editor" in the left sidebar
10. Click "New Query"
11. Open the file `/home/ubuntu/ipl-fantasy-tracker/database/schema.sql` from the project files
12. Copy ALL the text from this file
13. Paste it into the SQL Editor on Supabase
14. Click "Run" to create all the database tables
15. Go to "Project Settings" (gear icon) → "Database" → "Connection Pooling"
16. Copy the "Connection string" - it looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres`
17. Save this connection string somewhere safe - you'll need it for the next step

## Step 2: Deploy the Backend to Render

1. Go to: https://render.com/
2. Click "Sign Up"
3. Sign up with GitHub or your email
4. Once logged in, click "New" and select "Web Service"
5. You'll need to connect to a Git repository. If you don't have one:
   - Download the project as a ZIP file
   - Create a GitHub account if you don't have one: https://github.com/
   - Create a new repository on GitHub
   - Upload the ZIP contents to your repository
   - Connect Render to your GitHub account
6. Select your repository
7. Fill in these details:
   - Name: `ipl-fantasy-tracker-api`
   - Environment: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node server.js`
   - Select "Free" plan
8. Click "Advanced" and add these Environment Variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: Type any random string of letters and numbers (at least 16 characters)
   - `JWT_EXPIRES_IN`: `7d`
   - `DATABASE_URL`: Paste the Supabase connection string you saved earlier
9. Click "Create Web Service"
10. Wait for the deployment to complete (5-10 minutes)
11. Once deployed, copy the URL (looks like `https://ipl-fantasy-tracker-api.onrender.com`)
12. Save this URL - you'll need it for the frontend

## Step 3: Deploy the Frontend to Vercel

1. Go to: https://vercel.com/
2. Click "Sign Up" and create an account (GitHub sign-up is easiest)
3. Once logged in, click "Add New" → "Project"
4. Import your GitHub repository (same one you used for Render)
5. Configure the project:
   - Framework Preset: Select "Create React App"
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
6. Click "Environment Variables" and add:
   - `REACT_APP_API_URL`: Paste the Render URL you saved earlier
   - `REACT_APP_SOCKET_URL`: Paste the same Render URL
7. Click "Deploy"
8. Wait for the deployment to complete (3-5 minutes)
9. Once deployed, Vercel will provide a URL for your application
10. Click on the URL to open your deployed application!

## Step 4: Test Your Application

1. Open the application URL from Vercel
2. Register a new account:
   - Click "Register" and fill in the form
   - Use a valid email and password
3. Log in with your new account
4. Create a tournament:
   - Click "Create Tournament" on the dashboard
   - Fill in the tournament details and submit
5. Note the tournament code that's generated
6. You can share this code with friends so they can join your tournament
7. To test as an admin:
   - Register another account with email: `admin@example.com`
   - Go to your Supabase dashboard → "Table Editor" → "users" table
   - Find this user and change the "role" from "user" to "admin"
   - Log in with this admin account
   - You'll now see the Admin section in the menu

## Troubleshooting Common Issues

1. **If the frontend can't connect to the backend:**
   - Check that you entered the correct API URL in the Vercel environment variables
   - Make sure your backend on Render is running (check the Render dashboard)

2. **If you see database connection errors:**
   - Verify the DATABASE_URL environment variable in Render is correct
   - Check that you ran the SQL script in Supabase correctly

3. **If the application is slow to load initially:**
   - This is normal for free tier services - the backend "goes to sleep" after 15 minutes of inactivity
   - The first request will wake it up, which takes 30-60 seconds

## Getting Help

If you encounter any issues, you can:
1. Check the documentation in the `/docs` folder of the project
2. Look at the error messages in the browser console (right-click → Inspect → Console)
3. Contact a developer friend for assistance

Congratulations! You've successfully deployed your IPL Fantasy League Tracker application!
