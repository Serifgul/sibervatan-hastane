import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'hospital_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create a connection pool
let pool;

// Function to wait/sleep for a given time
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const createConnection = async () => {
  let retries = 5;
  let lastError;
  
  while (retries > 0) {
    try {
      console.log(`Attempting to connect to MySQL (${retries} retries left)...`);
      
      // Create database if it doesn't exist
      const tempPool = mysql.createPool({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        waitForConnections: true,
        connectionLimit: 2,
        queueLimit: 0
      });
      
      console.log('Attempting to connect to MySQL with:', {
        host: dbConfig.host,
        user: dbConfig.user,
        database: 'none yet',
      });
      
      await tempPool.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
      
      // Create connection pool to the specific database
      pool = mysql.createPool(dbConfig);
      
      // Test the connection
      await pool.query('SELECT 1');
      
      // Initialize database schema
      await initializeDatabase();
      
      console.log('Database connection established');
      return pool;
    } catch (error) {
      lastError = error;
      console.error(`Database connection attempt failed: ${error.message}`);
      retries--;
      
      if (retries > 0) {
        console.log(`Retrying in 5 seconds...`);
        await sleep(5000);
      }
    }
  }
  
  console.error('Database connection failed after multiple attempts:', lastError);
  throw lastError;
};

export const getConnection = () => {
  if (!pool) {
    throw new Error('Database connection not established');
  }
  return pool;
};

const initializeDatabase = async () => {
  try {
    const connection = await getConnection();
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create patients table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        tc_id VARCHAR(11) NOT NULL UNIQUE,
        phone_number VARCHAR(20) NOT NULL,
        department VARCHAR(100) NOT NULL,
        complaint TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INT,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    
    // Create backup_logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS backup_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        filename VARCHAR(255) NOT NULL,
        filesize VARCHAR(50) NOT NULL,
        status ENUM('success', 'error') NOT NULL,
        message TEXT NOT NULL
      )
    `);
    
    // Check if admin user exists, create if not
    const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (rows.length === 0) {
      // In a real application, we would hash the password
      // For simplicity, we're using plaintext here
      await connection.query(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        ['admin', 'password', 'admin']
      );
      console.log('Admin user created');
    }
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};