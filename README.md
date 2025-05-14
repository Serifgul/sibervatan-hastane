# Hospital Patient Registration System

A comprehensive web application for hospital patient registration and database backup management.

## Features

- **User Authentication**
  - Role-based access (admin/staff)
  - Secure login and registration
  - Permission-based access control

- **Patient Management**
  - Add new patients with detailed information
  - View and filter patient records
  - Comprehensive patient details

- **Database Backup System**
  - Automated weekly backups via cron job
  - Manual backup triggers
  - Backup logs and status monitoring
  - File viewer for backup logs

- **Security**
  - Protection against SQL Injection
  - Protection against IDOR (Insecure Direct Object Reference)
  - Protection against LFI (Local File Inclusion)
  - Input validation and sanitization

## Technologies Used

- **Frontend**
  - React (with TypeScript)
  - React Router for navigation
  - Tailwind CSS for styling
  - Lucide React for icons

- **Backend**
  - Node.js with Express
  - MySQL database
  - JWT for authentication
  - Parameterized SQL queries

## Installation and Setup

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- Docker and Docker Compose (for containerized setup)

### Option 1: Local Development Setup

1. Clone the repository
   ```
   git clone https://github.com/yourusername/hospital-registration-system.git
   cd hospital-registration-system
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Configure environment variables
   - Create a `.env` file in the root directory based on the provided `.env.example`
   - Update database credentials and other settings

4. Set up the database
   ```
   mysql -u root -p < db_setup.sql
   ```

5. Start the development server
   ```
   npm run dev
   ```

6. In a separate terminal, start the backend server
   ```
   npm run server
   ```

7. Access the application at `http://localhost:5173`

### Option 2: Docker Setup (Recommended for Production)

1. Clone the repository
   ```
   git clone https://github.com/yourusername/hospital-registration-system.git
   cd hospital-registration-system
   ```

2. Build and start the containers
   ```
   docker-compose up -d
   ```

3. Access the application at `http://localhost:3000`

## Database Backup Configuration

The system is configured to perform automatic weekly backups using a cron job:

1. The backup script is located at `server/scripts/backup.sh`
2. Logs are stored in `/var/log/backup.log` (mapped to `./logs/backup.log` in development)
3. To configure the cron job manually:
   ```
   crontab -e
   ```
   Add the following line:
   ```
   0 2 * * 0 /path/to/your/project/server/scripts/backup.sh
   ```
   This schedules a backup every Sunday at 2:00 AM.

## Security Considerations

This application implements several security measures:

- **SQL Injection Protection**
  - All database queries use parameterized statements
  - Input validation before database operations

- **IDOR Protection**
  - Role-based access control
  - Resource ownership verification for each access attempt
  - JWT verification for all protected routes

- **LFI Protection**
  - Path sanitization for file access
  - File extension validation
  - Directory traversal prevention

## Default Login Credentials

- **Admin User**
  - Username: admin
  - Password: password

- **Staff User**
  - Username: doctor
  - Password: doctor123

## Project Structure

```
hospital-registration-system/
├── src/                  # Frontend React application
│   ├── components/       # Reusable UI components
│   ├── context/          # React context providers
│   ├── pages/            # Page components
│   ├── services/         # API service functions
│   ├── styles/           # Global CSS styles
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── server/               # Backend Node.js application
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── scripts/          # Backup and utility scripts
│   ├── database.js       # Database connection setup
│   └── index.js          # Server entry point
├── public/               # Static assets
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile            # Docker configuration
└── README.md             # Project documentation
```

## License

MIT License

## Contributors

- Your Name
- Team Members

---

© 2023 Hospital Patient Registration System