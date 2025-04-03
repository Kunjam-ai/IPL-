# Deployment Configuration for Vercel (Frontend)

This file contains instructions for deploying the React frontend to Vercel.

## Prerequisites
- A Vercel account (free tier)
- Git repository with the project code

## Steps to Deploy

1. Create a production build of the React application:
```
cd frontend
npm run build
```

2. Install Vercel CLI (if not already installed):
```
npm install -g vercel
```

3. Login to Vercel:
```
vercel login
```

4. Deploy the application:
```
vercel
```

5. Follow the prompts:
   - Set up and deploy: `Y`
   - Which scope: Select your account
   - Link to existing project: `N`
   - Project name: `ipl-fantasy-tracker`
   - Directory: `frontend`
   - Override settings: `N`

6. Once deployed, Vercel will provide a URL for your application.

## Environment Variables

Make sure to set the following environment variables in the Vercel dashboard:
- `REACT_APP_API_URL`: URL of your backend API (e.g., https://ipl-fantasy-tracker-api.onrender.com)

## Continuous Deployment

Vercel automatically deploys when you push changes to your connected repository. To set up continuous deployment:

1. Connect your Git repository in the Vercel dashboard
2. Configure the build settings:
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

## Custom Domain (Optional)

To use a custom domain:
1. Go to your project settings in Vercel dashboard
2. Navigate to "Domains"
3. Add your domain and follow the verification steps
