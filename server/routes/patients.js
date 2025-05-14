import express from 'express';
import { getConnection } from '../database.js';
import { isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all patients (filtered by user permissions)
router.get('/', async (req, res) => {
  try {
    const connection = await getConnection();
    const { id: userId, role } = req.user;
    
    let query;
    let params = [];
    
    // If admin, get all patients, otherwise only get patients created by the user
    if (role === 'admin') {
      query = `
        SELECT 
          p.id, p.first_name as firstName, p.last_name as lastName, 
          p.tc_id as tcId, p.phone_number as phoneNumber, 
          p.department, p.complaint, p.created_at as createdAt, 
          p.created_by as createdBy
        FROM patients p
        ORDER BY p.created_at DESC
      `;
    } else {
      query = `
        SELECT 
          p.id, p.first_name as firstName, p.last_name as lastName, 
          p.tc_id as tcId, p.phone_number as phoneNumber, 
          p.department, p.complaint, p.created_at as createdAt, 
          p.created_by as createdBy
        FROM patients p
        WHERE p.created_by = ?
        ORDER BY p.created_at DESC
      `;
      params = [userId];
    }
    
    const [patients] = await connection.query(query, params);
    
    res.json({
      success: true,
      patients
    });
    
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients'
    });
  }
});

// Get patient by ID (with permission check)
router.get('/:id', async (req, res) => {
  try {
    const connection = await getConnection();
    const { id: userId, role } = req.user;
    const patientId = req.params.id;
    
    // Validate patientId
    if (!patientId || isNaN(parseInt(patientId))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID'
      });
    }
    
    // First get the patient
    const [patients] = await connection.query(
      `SELECT 
        p.id, p.first_name as firstName, p.last_name as lastName, 
        p.tc_id as tcId, p.phone_number as phoneNumber, 
        p.department, p.complaint, p.created_at as createdAt, 
        p.created_by as createdBy
      FROM patients p
      WHERE p.id = ?`,
      [patientId]
    );
    
    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    const patient = patients[0];
    
    // Check if user has permission to view this patient
    if (role !== 'admin' && patient.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this patient'
      });
    }
    
    res.json({
      success: true,
      patient
    });
    
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient'
    });
  }
});

// Add new patient
router.post('/', async (req, res) => {
  try {
    const connection = await getConnection();
    const { id: userId } = req.user;
    const { firstName, lastName, tcId, phoneNumber, department, complaint } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !tcId || !phoneNumber || !department || !complaint) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Validate TC ID format (11 digits)
    if (!/^\d{11}$/.test(tcId)) {
      return res.status(400).json({
        success: false,
        message: 'TC Kimlik No must be 11 digits'
      });
    }
    
    // Check if TC ID already exists
    const [existingPatients] = await connection.query(
      'SELECT id FROM patients WHERE tc_id = ?',
      [tcId]
    );
    
    if (existingPatients.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A patient with this TC Kimlik No already exists'
      });
    }
    
    // Insert new patient
    await connection.query(
      `INSERT INTO patients 
        (first_name, last_name, tc_id, phone_number, department, complaint, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, tcId, phoneNumber, department, complaint, userId]
    );
    
    res.json({
      success: true,
      message: 'Patient added successfully'
    });
    
  } catch (error) {
    console.error('Error adding patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add patient'
    });
  }
});

// Update patient (with permission check)
router.put('/:id', async (req, res) => {
  try {
    const connection = await getConnection();
    const { id: userId, role } = req.user;
    const patientId = req.params.id;
    const { firstName, lastName, phoneNumber, department, complaint } = req.body;
    
    // Validate patientId
    if (!patientId || isNaN(parseInt(patientId))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID'
      });
    }
    
    // Validate required fields
    if (!firstName || !lastName || !phoneNumber || !department || !complaint) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Check if patient exists and user has permission
    const [patients] = await connection.query(
      'SELECT id, created_by FROM patients WHERE id = ?',
      [patientId]
    );
    
    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    const patient = patients[0];
    
    // Check if user has permission to update this patient
    if (role !== 'admin' && patient.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this patient'
      });
    }
    
    // Update patient
    await connection.query(
      `UPDATE patients 
       SET first_name = ?, last_name = ?, phone_number = ?, department = ?, complaint = ? 
       WHERE id = ?`,
      [firstName, lastName, phoneNumber, department, complaint, patientId]
    );
    
    res.json({
      success: true,
      message: 'Patient updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update patient'
    });
  }
});

// Delete patient (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const connection = await getConnection();
    const patientId = req.params.id;
    
    // Validate patientId
    if (!patientId || isNaN(parseInt(patientId))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID'
      });
    }
    
    // Check if patient exists
    const [patients] = await connection.query(
      'SELECT id FROM patients WHERE id = ?',
      [patientId]
    );
    
    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // Delete patient
    await connection.query(
      'DELETE FROM patients WHERE id = ?',
      [patientId]
    );
    
    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete patient'
    });
  }
});

export default router;