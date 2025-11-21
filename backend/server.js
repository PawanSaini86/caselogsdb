// COMPLETE WORKING SERVER - With CLOB handling for case logs
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

// Helper function to read CLOB data
async function readClob(clob) {
  if (!clob) return null;
  
  return new Promise((resolve, reject) => {
    let clobData = '';
    
    clob.setEncoding('utf8');
    
    clob.on('data', (chunk) => {
      clobData += chunk;
    });
    
    clob.on('end', () => {
      resolve(clobData);
    });
    
    clob.on('error', (err) => {
      reject(err);
    });
  });
}

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Get rotations with ALL joins
app.get('/api/students/:studId/rotations-summary', async (req, res) => {
  let connection;
  
  try {
    const studId = parseInt(req.params.studId);
    console.log('📊 Fetching rotations for student:', studId);
    
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
    
    const result = await connection.execute(
      query,
      { studId: studId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    console.log(`✅ Found ${result.rows.length} rotations`);
    
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
      
      rotations.push({
        id: row.ID,
        rotationNumber: row.ROTNUM,
        startDate: formatDate(row.STARTING),
        endDate: formatDate(row.ENDING),
        disciplineId: row.DISCID,
        discipline: row.DISCIPLINE_NAME || row.DISCIPLINE_SHORT || 'Unknown',
        hospitalId: row.HOSPID,
        hospital: row.HOSPITAL_NAME || 'Unknown',
        preceptorId: row.PRECID,
        preceptorFirstName: row.PRECEPTOR_FNAME,
        preceptorLastName: row.PRECEPTOR_LNAME,
        preceptorFullName: row.PRECEPTOR_FNAME && row.PRECEPTOR_LNAME 
          ? `${row.PRECEPTOR_FNAME} ${row.PRECEPTOR_LNAME}` 
          : null,
        cancelled: row.CANCELLED,
        grade: row.GRADE,
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

// Get single rotation
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
        p.FIRSTNAME as PRECEPTOR_FNAME,
        p.LASTNAME as PRECEPTOR_LNAME
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
      hospital: {
        id: row.HOSPID,
        name: row.HOSPITAL_NAME || 'Unknown'
      },
      preceptorId: row.PRECID,
      preceptor: {
        id: row.PRECID,
        name: row.PRECEPTOR_FNAME && row.PRECEPTOR_LNAME 
          ? `${row.PRECEPTOR_FNAME} ${row.PRECEPTOR_LNAME}` 
          : 'Unknown'
      },
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

// Get case logs for rotation - WITH CLOB HANDLING
app.get('/api/rotations/:rotationId/case-logs', async (req, res) => {
  let connection;
  
  try {
    const rotationId = parseInt(req.params.rotationId);
    console.log('📋 Fetching case logs for rotation:', rotationId);
    
    connection = await oracledb.getConnection(dbConfig);
    
    const query = `
      SELECT 
        ID, ROTID, STUDID, CASE_DATE, CASE_DATA, STATUS, 
        CREATED_DATE, MODIFIED_DATE
      FROM caselog
      WHERE ROTID = :rotationId AND IS_DELETED = 'N'
      ORDER BY CASE_DATE DESC
    `;
    
    const result = await connection.execute(
      query,
      { rotationId: rotationId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    console.log(`📦 Found ${result.rows.length} case logs (raw)`);
    
    // Process each row to handle CLOB data
    const caseLogs = [];
    for (const row of result.rows) {
      let caseData = null;
      
      // Check if CASE_DATA is a CLOB
      if (row.CASE_DATA) {
        if (typeof row.CASE_DATA === 'object' && row.CASE_DATA.constructor.name === 'Lob') {
          // It's a CLOB, read it
          console.log(`  📖 Reading CLOB for case log ${row.ID}...`);
          try {
            const clobText = await readClob(row.CASE_DATA);
            caseData = clobText;
            console.log(`  ✅ CLOB read successfully (${clobText.length} chars)`);
          } catch (clobError) {
            console.error(`  ❌ Error reading CLOB for case log ${row.ID}:`, clobError);
            caseData = null;
          }
        } else {
          // It's already a string
          caseData = row.CASE_DATA;
        }
      }
      
      caseLogs.push({
        id: row.ID,
        rotationId: row.ROTID,
        studentId: row.STUDID,
        caseDate: formatDate(row.CASE_DATE),
        caseData: caseData, // Now it's a string (JSON text) or null
        status: row.STATUS,
        createdDate: formatDate(row.CREATED_DATE),
        modifiedDate: formatDate(row.MODIFIED_DATE)
      });
    }
    
    console.log(`✅ Processed ${caseLogs.length} case logs successfully`);
    
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

// Get single case log - WITH CLOB HANDLING
app.get('/api/case-logs/:caseLogId', async (req, res) => {
  let connection;
  
  try {
    const caseLogId = parseInt(req.params.caseLogId);
    console.log('📄 Fetching case log:', caseLogId);
    
    connection = await oracledb.getConnection(dbConfig);
    
    const query = `
      SELECT 
        ID, ROTID, STUDID, CASE_DATE, CASE_DATA, STATUS, 
        CREATED_DATE, MODIFIED_DATE, CREATED_BY
      FROM caselog
      WHERE ID = :caseLogId AND IS_DELETED = 'N'
    `;
    
    const result = await connection.execute(
      query,
      { caseLogId: caseLogId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Case log not found'
      });
    }
    
    const row = result.rows[0];
    
    // Handle CLOB data
    let caseData = null;
    if (row.CASE_DATA) {
      if (typeof row.CASE_DATA === 'object' && row.CASE_DATA.constructor.name === 'Lob') {
        console.log(`📖 Reading CLOB for case log ${row.ID}...`);
        try {
          caseData = await readClob(row.CASE_DATA);
          console.log(`✅ CLOB read successfully`);
        } catch (clobError) {
          console.error(`❌ Error reading CLOB:`, clobError);
          caseData = null;
        }
      } else {
        caseData = row.CASE_DATA;
      }
    }
    
    const caseLog = {
      id: row.ID,
      rotationId: row.ROTID,
      studentId: row.STUDID,
      caseDate: formatDate(row.CASE_DATE),
      caseData: caseData,
      status: row.STATUS,
      createdDate: formatDate(row.CREATED_DATE),
      modifiedDate: formatDate(row.MODIFIED_DATE),
      createdBy: row.CREATED_BY
    };
    
    console.log('✅ Case log retrieved:', caseLog.id);
    
    res.json({
      success: true,
      data: caseLog
    });
    
  } catch (error) {
    console.error('❌ Error fetching case log:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch case log',
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
  console.log('🚀 Student Rotation Tracker Backend - WITH CLOB SUPPORT');
  console.log('='.repeat(60));
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('✅ Available Endpoints:');
  console.log('   GET  /api/students/:studId/rotations-summary');
  console.log('   GET  /api/rotations/:rotationId');
  console.log('   GET  /api/rotations/:rotationId/case-logs (CLOB support)');
  console.log('   GET  /api/case-logs/:caseLogId (CLOB support)');
  console.log('   GET  /api/students/:studentId/case-logs');
  console.log('   POST /api/case-logs');
  console.log('='.repeat(60));
});