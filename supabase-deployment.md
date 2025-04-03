# Deployment Configuration for Supabase (PostgreSQL Database)

This file contains instructions for setting up a free PostgreSQL database using Supabase.

## Prerequisites
- A Supabase account (free tier)

## Steps to Set Up

1. Sign up or log in to Supabase at https://supabase.com/

2. Create a new project:
   - Organization: Create or select an existing organization
   - Name: `ipl-fantasy-tracker-db`
   - Database Password: Generate a secure password
   - Region: Choose the region closest to your backend deployment
   - Pricing Plan: Free tier

3. Wait for your database to be provisioned (usually takes a few minutes)

4. Once your project is ready, go to "Settings" > "Database" to find your connection details:
   - Host: `[project-id].supabase.co`
   - Database Name: `postgres`
   - Port: `5432`
   - User: `postgres`
   - Password: The password you set during project creation

5. Construct your PostgreSQL connection string:
   ```
   postgresql://postgres:[your-password]@[project-id].supabase.co:5432/postgres
   ```

6. Use this connection string as the `DATABASE_URL` environment variable in your backend deployment

## Database Initialization

To initialize your database with the schema:

1. Go to the SQL Editor in your Supabase dashboard

2. Create a new query and paste the contents of your `schema.sql` file

3. Run the query to create all tables and indexes

## Database Management

Supabase provides several tools for database management:

1. **Table Editor**: Visual interface to view and edit data
2. **SQL Editor**: Run SQL queries directly
3. **Database Backups**: Automatic daily backups (free tier includes 7 days of backup retention)
4. **API**: Auto-generated API for your database (optional)

## Important Notes

- Free tier includes:
  - 500MB database storage
  - 2GB bandwidth
  - 50MB file storage
  - 10,000 monthly active users
  - Unlimited API requests
  - Up to 4 simultaneous database connections

- Database will remain active even when not in use (no spin-down like Render)

- For production use with higher demands, consider upgrading to a paid plan
