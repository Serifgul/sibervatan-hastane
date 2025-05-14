export const mockUsers = [
  {
    id: 1,
    username: "admin",
    password: "password",
    role: "admin" as const
  },
  {
    id: 2,
    username: "doctor",
    password: "doctor123",
    role: "staff" as const
  }
];

export const mockPatients = [
  {
    id: 1,
    firstName: "Ayşe",
    lastName: "Yılmaz",
    tcId: "12345678901",
    phoneNumber: "05321234567",
    department: "Cardiology",
    complaint: "Chest pain and shortness of breath",
    createdAt: "2023-04-10T08:30:00Z",
    createdBy: 1
  },
  {
    id: 2,
    firstName: "Mehmet",
    lastName: "Kaya",
    tcId: "98765432109",
    phoneNumber: "05359876543",
    department: "Orthopedics",
    complaint: "Severe back pain after falling",
    createdAt: "2023-04-10T09:15:00Z",
    createdBy: 2
  },
  {
    id: 3,
    firstName: "Zeynep",
    lastName: "Demir",
    tcId: "56789012345",
    phoneNumber: "05425678901",
    department: "Neurology",
    complaint: "Frequent headaches and dizziness",
    createdAt: "2023-04-10T10:45:00Z",
    createdBy: 1
  }
];

export const mockBackupLogs = [
  {
    id: 1,
    timestamp: "2023-04-09T02:00:00Z",
    filename: "hospital_db_20230409.sql",
    filesize: "1.2 MB",
    status: "success",
    message: "Weekly backup completed successfully"
  },
  {
    id: 2,
    timestamp: "2023-04-02T02:00:00Z",
    filename: "hospital_db_20230402.sql",
    filesize: "1.1 MB",
    status: "success",
    message: "Weekly backup completed successfully"
  },
  {
    id: 3,
    timestamp: "2023-03-26T02:00:00Z",
    filename: "hospital_db_20230326.sql",
    filesize: "1.1 MB",
    status: "error",
    message: "Backup failed: Insufficient disk space"
  },
  {
    id: 4,
    timestamp: "2023-03-19T02:00:00Z",
    filename: "hospital_db_20230319.sql",
    filesize: "1.0 MB",
    status: "success",
    message: "Weekly backup completed successfully"
  }
];