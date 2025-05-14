import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Database, FileDown, RefreshCw, AlertTriangle } from 'lucide-react';

type BackupLog = {
  id: number;
  timestamp: string;
  filename: string;
  filesize: string;
  status: string;
  message: string;
};

const Backup: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<BackupLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [customFilename, setCustomFilename] = useState('backup.log');
  const [vulnerabilityDetected, setVulnerabilityDetected] = useState(false);

  useEffect(() => {
    fetchBackupLogs();
  }, []);

  const fetchBackupLogs = async (filename: string = 'backup.log') => {
    setIsLoading(true);
    setVulnerabilityDetected(false);
    
    try {
      // Clear any previous messages
      setMessage(null);
      
      const response = await api.getBackupLog(filename, user?.role === 'admin');
      
      if (response.success && response.logs) {
        setLogs(response.logs);
        
        // Check if LFI vulnerability was detected
        if (response.logs.some(log => log.message.includes('SECURITY BREACH'))) {
          setVulnerabilityDetected(true);
          setMessage({
            text: 'Security alert: Attempted unauthorized file access detected!',
            type: 'error'
          });
        }
      } else {
        setMessage({
          text: response.message || 'Failed to fetch backup logs',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Failed to fetch backup logs:', error);
      setMessage({
        text: 'Failed to fetch backup logs. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    setMessage(null);
    
    try {
      const response = await api.performBackup(user?.role === 'admin');
      
      if (response.success) {
        // Add the new log to the top of the list
        if (response.logs && response.logs.length > 0) {
          setLogs(prevLogs => [...response.logs, ...prevLogs]);
        }
        
        setMessage({
          text: 'Backup completed successfully',
          type: 'success'
        });
      } else {
        setMessage({
          text: response.message || 'Backup failed',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Backup failed:', error);
      setMessage({
        text: 'Backup failed. Please try again.',
        type: 'error'
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Database Backup Management</h1>
        <button 
          className="btn btn-primary flex items-center" 
          onClick={handleBackup}
          disabled={isBackingUp}
        >
          {isBackingUp ? (
            <>
              <RefreshCw size={18} className="mr-1 animate-spin" /> Backing Up...
            </>
          ) : (
            <>
              <FileDown size={18} className="mr-1" /> Backup Now
            </>
          )}
        </button>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mb-4`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card col-span-2">
          <div className="card-header flex justify-between items-center">
            <h2 className="card-title">Backup Logs</h2>
            <button 
              className="btn btn-secondary flex items-center" 
              onClick={() => fetchBackupLogs()}
              disabled={isLoading}
            >
              <RefreshCw size={18} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          <div className="card-body">
            {isLoading ? (
              <div className="text-center py-4">
                <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
                <p>Loading backup logs...</p>
              </div>
            ) : logs.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Filename</th>
                      <th>Size</th>
                      <th>Status</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className={log.status === 'error' ? 'bg-red-50' : ''}>
                        <td>{formatDate(log.timestamp)}</td>
                        <td className="font-mono text-sm">{log.filename}</td>
                        <td>{log.filesize}</td>
                        <td>
                          <span 
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td>{log.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-4">No backup logs found.</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Backup Settings</h2>
          </div>
          <div className="card-body">
            <div className="mb-4">
              <p className="mb-2 font-semibold">Backup Schedule</p>
              <div className="p-3 bg-gray-50 rounded">
                <p>Weekly backups are scheduled using cron:</p>
                <code className="block mt-2 p-2 bg-gray-100 rounded font-mono text-sm">
                  0 2 * * 0 /path/to/backup.sh
                </code>
                <p className="mt-2 text-sm text-gray-600">Runs every Sunday at 2:00 AM</p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="mb-2 font-semibold">Backup Log File</p>
              <div className="flex">
                <input
                  type="text"
                  className="form-input flex-grow"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  placeholder="Enter log filename"
                />
                <button
                  className="btn btn-secondary ml-2"
                  onClick={() => fetchBackupLogs(customFilename)}
                >
                  View
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-600">Default: backup.log</p>
            </div>
            
            {vulnerabilityDetected && (
              <div className="p-3 bg-red-50 border border-red-200 rounded flex items-start mt-4">
                <AlertTriangle className="text-red-500 mr-2 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-red-700">Security Alert</p>
                  <p className="text-sm text-red-600">
                    Potential Local File Inclusion (LFI) vulnerability detected. 
                    Unauthorized file access attempt has been logged.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Database className="inline-block mr-2" size={20} />
            Log Viewer
          </h2>
        </div>
        <div className="card-body">
          <div className="log-viewer">
            {isLoading ? (
              <p>Loading logs...</p>
            ) : logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="log-entry">
                  <span className="log-date">[{formatDate(log.timestamp)}]</span>{' '}
                  <span className={log.status === 'success' ? 'log-success' : 'log-error'}>
                    {log.status.toUpperCase()}
                  </span>:{' '}
                  {log.message} - File: {log.filename} ({log.filesize})
                </div>
              ))
            ) : (
              <p>No logs available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backup;