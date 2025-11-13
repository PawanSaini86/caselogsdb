// COMPLETE WORKING SERVER - With hospital table included
// All correct column names and table joins

const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const dbConfig = {
  user: process.env.DB_USER || 'pa_rot',
  password: process.env.DB_PASSWORD || 'wulrc102',
  connectString: `${process.env.DB_HOST || 'dbtest02.westernu.edu'}:${process.env.DB_PORT || '1521'}/${process.env.DB_SERVICE || 'wsdata2.westernu.edu'}`
};

try {
  oracledb.initOracleClient({ libDir: '/opt/homebrew/opt/instantclient/lib' });
  console.log('✅ Oracle client initialized');
} catch (err) {
  console.log('⚠️ Oracle client initialization skipped');
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Get rotations with ALL joins - discipline, preceptor, AND hospital
app.get('/api/students/:studId/rotations-summary', async (req, res) => {
  let connection;
  
  try {
    const studId = parseInt(req.params.studId);
    console.log('📊 Fetching rotations for student:', studId);
    
    connection = await oracledb.getConnection(dbConfig);
    
    // Complete query with ALL table joins
    const query = `
      SELECT 
        r.ID,
        r.ROTNUM,
        r.STARTING,
        r.ENDING,
        r.DISCID,
        r.HOSPID,
        r.PRECID,
        r.CANCELLED,
        r.GRADE,
        d.NAME as DISCIPLINE_NAME,
        d.SHORTNAME as DISCIPLINE_SHORT,
        h.NAME as HOSPITAL_NAME,
        p.FIRSTNAME as PRECEPTOR_FNAME,
        p.LASTNAME as PRECEPTOR_LNAME
      FROM rotation r
      LEFT JOIN discipline d ON r.DISCID = d.DISCID
      LEFT JOIN hospital h ON r.HOSPID = h.ID
      LEFT JOIN preceptor p ON r.PRECID = p.ID
      WHERE r.STUDID = :studId
      ORDER BY r.STARTING DESC
    `;
    
    console.log('🔍 Executing complete query with all joins...');
    
    const result = await connection.execute(
      query,
      { studId: studId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    console.log(`✅ Found ${result.rows.length} rotations`);
    
    // Get case log counts
    const rotations = [];
    for (const row of result.rows) {
      let caseLogCount = 0;
      
      try {
        const countResult = await connection.execute(
          'SELECT COUNT(*) as CNT FROM caselog WHERE ROTID = :rotid AND IS_DELETED = \'N\'',
          { rotid: row.ID },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        caseLogCount = countResult.rows[0]?.CNT || 0;
      } catch (err) {
        console.error(`⚠️ Could not count case logs for rotation ${row.ID}:`, err.message);
      }
      
      console.log(`  Rotation ${row.ID} (${row.ROTNUM}): ${caseLogCount} case logs - ${row.DISCIPLINE_NAME || 'Unknown'} at ${row.HOSPITAL_NAME || 'Unknown'}`);
      
      rotations.push({
        id: row.ID,
        rotationNumber: row.ROTNUM,
        startDate: formatDate(row.STARTING),
        endDate: formatDate(row.ENDING),
        
        // Discipline info
        disciplineId: row.DISCID,
        discipline: row.DISCIPLINE_NAME || row.DISCIPLINE_SHORT || 'Unknown',
        
        // Hospital info
        hospitalId: row.HOSPID,
        hospital: row.HOSPITAL_NAME || 'Unknown',
        
        // Preceptor info
        preceptorId: row.PRECID,
        preceptorFirstName: row.PRECEPTOR_FNAME,
        preceptorLastName: row.PRECEPTOR_LNAME,
        preceptorFullName: row.PRECEPTOR_FNAME && row.PRECEPTOR_LNAME 
          ? `${row.PRECEPTOR_FNAME} ${row.PRECEPTOR_LNAME}` 
          : null,
        
        // Other info
        cancelled: row.CANCELLED,
        grade: row.GRADE,
        
        // Case log count
        caseLogCount: caseLogCount
      });
    }
    
    res.json({
      success: true,
      data: rotations,
      studentId: studId
    });
    
  } catch (error) {
    console.error('❌ Error fetching rotations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rotations',
      message: error.message
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
});

// Get single rotation with all details
app.get('/api/rotations/:rotationId', async (req, res) => {
  let connection;
  
  try {
    const rotationId = parseInt(req.params.rotationId);
    console.log('📄 Fetching rotation:', rotationId);
    
    connection = await oracledb.getConnection(dbConfig);
    
    const query = `
      SELECT 
        r.ID,
        r.ROTNUM,
        r.STARTING,
        r.ENDING,
        r.DISCID,
        r.HOSPID,
        r.PRECID,
        r.CANCELLED,
        r.GRADE,
        r.NOTES,
        d.NAME as DISCIPLINE_NAME,
        h.NAME as HOSPITAL_NAME,
        h.PHONE as HOSPITAL_PHONE,
        h.ADDRESS1 as HOSPITAL_ADDRESS,
        p.FIRSTNAME as PRECEPTOR_FNAME,
        p.LASTNAME as PRECEPTOR_LNAME,
        p.EMAIL as PRECEPTOR_EMAIL,
        p.PHONE1 as PRECEPTOR_PHONE
      FROM rotation r
      LEFT JOIN discipline d ON r.DISCID = d.DISCID
      LEFT JOIN hospital h ON r.HOSPID = h.ID
      LEFT JOIN preceptor p ON r.PRECID = p.ID
      WHERE r.ID = :rotationId
    `;
    
    const result = await connection.execute(
      query,
      { rotationId: rotationId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rotation not found'
      });
    }
    
    const row = result.rows[0];
    const rotation = {
      id: row.ID,
      rotationNumber: row.ROTNUM,
      startDate: formatDate(row.STARTING),
      endDate: formatDate(row.ENDING),
      disciplineId: row.DISCID,
      discipline: row.DISCIPLINE_NAME || 'Unknown',
      hospitalId: row.HOSPID,
      hospital: row.HOSPITAL_NAME || 'Unknown',
      hospitalPhone: row.HOSPITAL_PHONE,
      hospitalAddress: row.HOSPITAL_ADDRESS,
      preceptorId: row.PRECID,
      preceptorFirstName: row.PRECEPTOR_FNAME,
      preceptorLastName: row.PRECEPTOR_LNAME,
      preceptorEmail: row.PRECEPTOR_EMAIL,
      preceptorPhone: row.PRECEPTOR_PHONE,
      cancelled: row.CANCELLED,
      grade: row.GRADE,
      notes: row.NOTES
    };
    
    res.json({
      success: true,
      data: rotation
    });
    
  } catch (error) {
    console.error('❌ Error fetching rotation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rotation',
      message: error.message
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
});

// Create case log
app.post('/api/case-logs', async (req, res) => {
  let connection;
  
  try {
    const {
      rotationId,
      studentId,
      caseDate,
      caseData,
      status = 'DRAFT',
      createdBy
    } = req.body;
    
    if (!rotationId || !studentId || !caseDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: rotationId, studentId, caseDate'
      });
    }
    
    console.log('💾 Creating case log for rotation:', rotationId);
    
    connection = await oracledb.getConnection(dbConfig);
    
    const caseDataJson = JSON.stringify(caseData);
    
    const query = `
      INSERT INTO caselog (
        ROTID, STUDID, CASE_DATE, CASE_DATA, STATUS, CREATED_BY
      ) VALUES (
        :rotid, :studid, TO_DATE(:caseDate, 'YYYY-MM-DD'),
        :caseData, :status, :createdBy
      ) RETURNING ID INTO :id
    `;
    
    const result = await connection.execute(
      query,
      {
        rotid: rotationId,
        studid: studentId,
        caseDate: caseDate.split('T')[0],
        caseData: caseDataJson,
        status: status,
        createdBy: createdBy || null,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );
    
    const newId = result.outBinds.id[0];
    
    console.log('✅ Case log created with ID:', newId);
    
    res.json({
      success: true,
      data: { id: newId, rotationId, studentId, caseDate, status },
      message: 'Case log created successfully'
    });
    
  } catch (error) {
    console.error('❌ Error creating case log:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create case log',
      message: error.message
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
});

// Get case logs for rotation
app.get('/api/rotations/:rotationId/case-logs', async (req, res) => {
  let connection;
  
  try {
    const rotationId = parseInt(req.params.rotationId);
    console.log('📋 Fetching case logs for rotation:', rotationId);
    
    connection = await oracledb.getConnection(dbConfig);
    
    const query = `
      SELECT 
        ID, ROTID, STUDID, CASE_DATE, STATUS, CREATED_DATE, MODIFIED_DATE
      FROM caselog
      WHERE ROTID = :rotationId AND IS_DELETED = 'N'
      ORDER BY CASE_DATE DESC
    `;
    
    const result = await connection.execute(
      query,
      { rotationId: rotationId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    const caseLogs = result.rows.map(row => ({
      id: row.ID,
      rotationId: row.ROTID,
      studentId: row.STUDID,
      caseDate: formatDate(row.CASE_DATE),
      status: row.STATUS,
      createdDate: formatDate(row.CREATED_DATE),
      modifiedDate: formatDate(row.MODIFIED_DATE)
    }));
    
    console.log(`✅ Found ${caseLogs.length} case logs`);
    
    res.json({
      success: true,
      data: caseLogs,
      count: caseLogs.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching case logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch case logs',
      message: error.message
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
});

// Get single case log with full data
app.get('/api/students/:studentId/rotations-summary', (req, res) => {
  const { studentId } = req.params;
  
  console.log('📋 Fetching rotations with case log count for student:', studentId);
  
  const query = `
    SELECT 
  r.ID as id,
  r.ROTNUM as rotationNumber,
  TO_CHAR(r.STARTING, 'MM/DD/YYYY') as startDate,
  TO_CHAR(r.ENDING, 'MM/DD/YYYY') as endDate,
  'Rotation ' || r.ROTNUM as discipline, 
  
  h.NAME as hospital,
  h.CITY as hospitalCity,
  h.STATE as hospitalState,
  
  p.FIRSTNAME || ' ' || p.LASTNAME as preceptorFullName,
  p.EMAIL as preceptorEmail,
  p.PHONE1 as preceptorPhone,
  
  (SELECT COUNT(*) 
   FROM caselog c 
   WHERE c.ROTID = r.ID 
     AND c.IS_DELETED = 'N') as caseLogCount
  
FROM rotation r
LEFT JOIN hospital h ON r.HOSPID = h.ID
LEFT JOIN preceptor p ON r.PRECID = p.ID
WHERE r.STUDID = :studentId
ORDER BY r.STARTING DESC
  `;
  
  connection.query(query, [studentId], (error, results) => {
    if (error) {
      console.error('❌ Error fetching rotations:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching rotations',
        error: error.message 
      });
    }
    
    console.log(`✅ Found ${results.length} rotations for student ${studentId}`);
    console.log('📊 Case log counts:', results.map(r => ({
      rotation: r.rotationNumber,
      discipline: r.discipline,
      caseLogCount: r.caseLogCount
    })));
    
    res.json({
      success: true,
      data: results,
      studentId: parseInt(studentId)
    });
  });
});

// Get all case logs for student
app.get('/api/students/:studentId/case-logs', async (req, res) => {
  let connection;
  
  try {
    const studentId = parseInt(req.params.studentId);
    console.log('📋 Fetching all case logs for student:', studentId);
    
    connection = await oracledb.getConnection(dbConfig);
    
    const query = `
      SELECT 
        c.ID,
        c.ROTID,
        c.CASE_DATE,
        c.STATUS,
        r.ROTNUM,
        d.NAME as DISCIPLINE_NAME
      FROM caselog c
      JOIN rotation r ON c.ROTID = r.ID
      LEFT JOIN discipline d ON r.DISCID = d.DISCID
      WHERE c.STUDID = :studentId AND c.IS_DELETED = 'N'
      ORDER BY c.CASE_DATE DESC
    `;
    
    const result = await connection.execute(
      query,
      { studentId: studentId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    const caseLogs = result.rows.map(row => ({
      id: row.ID,
      rotationId: row.ROTID,
      rotationNumber: row.ROTNUM,
      discipline: row.DISCIPLINE_NAME || 'Unknown',
      caseDate: formatDate(row.CASE_DATE),
      status: row.STATUS
    }));
    
    console.log(`✅ Found ${caseLogs.length} case logs for student`);
    
    res.json({
      success: true,
      data: caseLogs,
      count: caseLogs.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching case logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch case logs',
      message: error.message
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
});

app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 Student Rotation Tracker Backend - COMPLETE');
  console.log('='.repeat(60));
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('✅ All tables joined:');
  console.log('   - rotation');
  console.log('   - discipline');
  console.log('   - hospital');
  console.log('   - preceptor');
  console.log('   - caselog');
  console.log('='.repeat(60));
});