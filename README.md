# TecClub VPS Monitor

A VPS server monitoring dashboard that allows you to track your servers' status, health metrics, and run speed tests.

## Features

- 📊 Dashboard with server metrics
- 🖥️ Server management (add, edit, delete)
- 🔒 Secure authentication
- 🌎 Country flags for server locations
- ⚡ Speed test functionality
- 📈 Health metrics monitoring
- 🔐 Secure credential storage

## Tech Stack

- **Frontend**: Next.js with React and Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Charts**: Chart.js with React-Chartjs-2
- **Icons**: React Icons
- **Form Handling**: React Hook Form
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL database

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/tecclub-monitor.git
cd tecclub-monitor
```

2. Install dependencies:

```bash
npm install
```

3. Set up your environment variables by copying the example file:

```bash
cp .env.example .env
```

4. Update the `.env` file with your database connection string and other configurations:

```
DATABASE_URL="postgresql://username:password@localhost:5432/tecclub_monitor?schema=public"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

5. Push the database schema:

```bash
npx prisma db push
```

6. Generate the Prisma client:

```bash
npx prisma generate
```

7. Start the development server:

```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Register a new account

Visit `/register` to create a new account.

### Adding a new server

1. Log in to the dashboard
2. Navigate to the Servers page
3. Click "Add Server"
4. Fill in the server details including name, IP, country, and credentials (optional)

### Running a speed test

1. Navigate to a server's detail page or click the "Speed Test" button in the server list
2. Click "Run Speed Test"
3. View the results showing download speed, upload speed, and ping

## Project Structure

```
/src
  /app
    /(auth)          # Authentication-related pages
      /login         # Login page
      /register      # Registration page
    /(dashboard)     # Dashboard and protected pages
      /dashboard     # Main dashboard
      /servers       # Server list and management
      /servers/[id]  # Server detail page
    /api            # API routes
  /components       # React components
  /lib              # Utility functions and helpers
  /prisma           # Prisma schema and client
```

## Deployment

The application can be deployed to Vercel or any other hosting provider that supports Next.js applications.

### Deploying to Vercel

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket)
2. Import your repository in Vercel
3. Configure your environment variables
4. Deploy

## License

This project is licensed under the MIT License.
