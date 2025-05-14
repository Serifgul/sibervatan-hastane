import express from 'express';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getConnection } from '../database.js';
import { isAdmin } from '../middleware/auth.js';

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get backup logs
router.get('/logs', isAdmin, async (req, res) => {
  try {
    const connection = await getConnection();
    
    const [logs] = await connection.query(
      `SELECT 
        id, timestamp, filename, filesize, status, message
       FROM backup_logs
       ORDER BY timestamp DESC`
    );
    
    res.json({
      success: true,
      logs
    });
    
  } catch (error) {
    console.error('Error fetching backup logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch backup logs'
    });
  }
});

// Perform backup
router.post('/', isAdmin, async (req, res) => {
  try {
    const scriptPath = path.join(__dirname, '../scripts/backup.sh');
    
    // Ensure backup directory exists
    const backupDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Execute the backup script
    const backupProcess = spawn('/bin/bash', [scriptPath], {
      env: {
        ...process.env,
        DB_HOST: process.env.DB_HOST || 'localhost',
        DB_USER: process.env.DB_USER || 'root',
        DB_PASSWORD: process.env.DB_PASSWORD || '',
        DB_NAME: process.env.DB_NAME || 'hospital_db'
      }
    });
    
    let stdoutData = '';
    let stderrData = '';
    
    backupProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
      console.log('Backup stdout:', data.toString());
    });
    
    backupProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
      console.error('Backup stderr:', data.toString());
    });
    
    backupProcess.on('close', async (code) => {
      console.log('Backup process exited with code:', code);
      console.log('Stdout:', stdoutData);
      console.log('Stderr:', stderrData);
      
      const connection = await getConnection();
      
      let status = 'success';
      let message = 'Backup completed successfully';
      let filename = '';
      let filesize = '';
      
      if (code === 0 && stdoutData) {
        // Extract filename and filesize from script output
        const outputLines = stdoutData.split('\n');
        for (const line of outputLines) {
          if (line.startsWith('FILENAME:')) {
            filename = line.replace('FILENAME:', '').trim();
          } else if (line.startsWith('FILESIZE:')) {
            filesize = line.replace('FILESIZE:', '').trim();
          }
        }
      } else {
        status = 'error';
        message = `Backup failed with error: ${stderrData || 'Unknown error'}`;
      }
      
      // Insert backup log
      const [result] = await connection.query(
        'INSERT INTO backup_logs (filename, filesize, status, message) VALUES (?, ?, ?, ?)',
        [filename, filesize, status, message]
      );
      
      // Get the inserted log
      const [logs] = await connection.query(
        'SELECT id, timestamp, filename, filesize, status, message FROM backup_logs WHERE id = ?',
        [result.insertId]
      );
      
      res.json({
        success: status === 'success',
        message,
        logs: logs[0]
      });
    });
    
  } catch (error) {
    console.error('Error performing backup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform backup'
    });
  }
});

// Get log file content
router.get('/logfile', isAdmin, (req, res) => {
  try {
    let { filename } = req.query;
    
    // Security check: prevent path traversal
    if (!filename) {
      filename = 'backup.log';
    }
    
    // Sanitize filename to prevent directory traversal
    const sanitizedFilename = path.basename(filename);
    
    // Check file extension
    if (!sanitizedFilename.endsWith('.log')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file format. Only .log files are allowed.'
      });
    }
    
    // Try to read the log file (in a real app, this would be from /var/log)
    const logPath = path.join(__dirname, '../logs', sanitizedFilename);
    
    if (!fs.existsSync(logPath)) {
      return res.status(404).json({
        success: false,
        message: 'Log file not found'
      });
    }
    
    const fileContent = fs.readFileSync(logPath, 'utf8');
    
    res.json({
      success: true,
      filename: sanitizedFilename,
      content: fileContent
    });
    
  } catch (error) {
    console.error('Error reading log file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to read log file'
    });
  }
});

export default router;