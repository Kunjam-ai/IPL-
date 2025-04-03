# IPL Fantasy League Tracker

A custom fantasy league tracker for IPL cricket matches with real-time updates, user authentication, and tournament management.

## Features

- **User Authentication**: Secure registration and login with JWT
- **Tournament Management**: Create and join tournaments with unique codes
- **Fantasy Points Tracking**: Real-time updates for player performance
- **Leaderboards**: Live tournament rankings with visualizations
- **Admin Interface**: Match management and points entry
- **Real-time Updates**: Socket.io integration for instant updates

## Technology Stack

- **Frontend**: React.js with Bootstrap for responsive design
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **Deployment**: Vercel (frontend), Render (backend), Supabase (database)

## Project Structure

```
ipl-fantasy-tracker/
├── backend/               # Node.js/Express API
│   ├── controllers/       # API controllers
│   ├── middleware/        # Auth middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   └── server.js          # Main server file
├── frontend/              # React.js application
│   ├── public/            # Static files
│   └── src/               # React source code
│       ├── components/    # Reusable components
│       ├── context/       # Context providers
│       ├── pages/         # Application pages
│       └── App.js         # Main App component
├── database/              # Database scripts
│   ├── schema.sql         # SQL schema
│   └── init.js            # Database initialization
└── docs/                  # Documentation
    ├── simplified-deployment-guide.md  # Non-technical guide
    ├── deployment-testing-guide.md     # Detailed guide
    ├── supabase-deployment.md          # Database setup
    ├── render-deployment.md            # Backend setup
    └── vercel-deployment.md            # Frontend setup
```

## Getting Started

For non-technical users, please follow the [Simplified Deployment Guide](./docs/simplified-deployment-guide.md).

For developers, follow these steps:

1. Clone the repository
2. Install dependencies:
   ```
   npm run install:all
   ```
3. Set up environment variables:
   - Create `.env` file in the backend directory
   - Create `.env` file in the frontend directory
4. Initialize the database:
   - Set up PostgreSQL (local or using Supabase)
   - Run the schema.sql script
5. Start the development servers:
   ```
   # Backend
   npm run dev:backend
   
   # Frontend
   npm run dev:frontend
   ```

## Deployment

This application is designed to be deployed using free-tier services:

- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Backend**: [Render](https://render.com/) (Node.js)
- **Frontend**: [Vercel](https://vercel.com/) (React)

Detailed deployment instructions are available in the `docs` directory.

## License

This project is licensed under the ISC License.

## Acknowledgements

- React.js and Node.js communities
- Bootstrap for responsive UI components
- Chart.js for data visualization
- Socket.io for real-time functionality
