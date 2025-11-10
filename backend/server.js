// Updated Case Log Endpoint - For Simplified Table (Everything in CLOB)
// Add this to your backend/server.js

// Create a new case log (simplified version)
app.post('/api/case-logs', async (req, res) => {
  let connection;
  
  try {
    const {
      rotationId,
      studentId,
      caseDate,
      caseData,  // Complete form data object
      status = 'DRAFT',
      createdBy
    } = req.body;
    
    // Validate required fields
    if (!rotationId || !studentId || !caseDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: rotationId, studentId, caseDate'
      });
    }
    
    connection = await oracledb.getConnection(dbConfig);
    
    // Convert caseData object to JSON string for CLOB
    const caseDataJson = JSON.stringify(caseData);
    
    console.log('Inserting case log for rotation:', rotationId, 'student:', studentId);
    
    const query = `
      INSERT INTO caselog (
        ROTID,
        STUDID,
        CASE_DATE,
        CASE_DATA,
        STATUS,
        CREATED_BY
      ) VALUES (
        :rotid,
        :studid,
        TO_DATE(:caseDate, 'YYYY-MM-DD'),
        :caseData,
        :status,
        :createdBy
      ) RETURNING ID INTO :id
    `;
    
    const result = await connection.execute(
      query,
      {
        rotid: rotationId,
        studid: studentId,
        caseDate: caseDate.split('T')[0], // Extract date part
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
      data: {
        id: newId,
        rotationId,
        studentId,
        caseDate,
        status
      },
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

// Get all case logs for a rotation (simplified)
app.get('/api/rotations/:rotationId/case-logs', async (req, res) => {
  let connection;
  
  try {
    const rotationId = req.params.rotationId;
    
    connection = await oracledb.getConnection(dbConfig);
    
    const query = `
      SELECT 
        ID,
        ROTID,
        STUDID,
        CASE_DATE,
        STATUS,
        CREATED_DATE,
        MODIFIED_DATE
      FROM caselog
      WHERE ROTID = :rotationId
        AND IS_DELETED = 'N'
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
    
    res.json({
      success: true,
      data: caseLogs,
      count: caseLogs.length
    });
    
  } catch (error) {
    console.error('Error fetching case logs:', error);
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

// Get a single case log with full data (including CLOB)
app.get('/api/case-logs/:id', async (req, res) => {
  let connection;
  
  try {
    const caseLogId = req.params.id;
    
    connection = await oracledb.getConnection(dbConfig);
    
    const query = `
      SELECT 
        ID,
        ROTID,
        STUDID,
        CASE_DATE,
        CASE_DATA,
        STATUS,
        CREATED_DATE,
        MODIFIED_DATE,
        CREATED_BY,
        MODIFIED_BY
      FROM caselog
      WHERE ID = :id
        AND IS_DELETED = 'N'
    `;
    
    const result = await connection.execute(
      query,
      { id: caseLogId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Case log not found'
      });
    }
    
    const row = result.rows[0];
    
    // Parse the CLOB JSON data
    let caseData = null;
    if (row.CASE_DATA) {
      try {
        caseData = JSON.parse(row.CASE_DATA);
      } catch (e) {
        console.error('Error parsing CASE_DATA JSON:', e);
        caseData = row.CASE_DATA; // Return as string if parse fails
      }
    }
    
    const caseLog = {
      id: row.ID,
      rotationId: row.ROTID,
      studentId: row.STUDID,
      caseDate: formatDate(row.CASE_DATE),
      caseData: caseData,  // Parsed JSON object
      status: row.STATUS,
      createdDate: formatDate(row.CREATED_DATE),
      modifiedDate: formatDate(row.MODIFIED_DATE),
      createdBy: row.CREATED_BY,
      modifiedBy: row.MODIFIED_BY
    };
    
    res.json({
      success: true,
      data: caseLog
    });
    
  } catch (error) {
    console.error('Error fetching case log:', error);
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

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}