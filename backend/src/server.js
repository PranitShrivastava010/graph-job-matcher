require('dotenv').config();
const app = require('./app');
const { verifyConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  console.log('⚡ Checking CognoDB graph database connection...');
  const conn = await verifyConnection();
  if (conn.success) {
    console.log('🚀 Connected to CognoDB successfully!');
  } else {
    console.warn('⚠️ Warning: CognoDB connection issue:', conn.error);
  }

  app.listen(PORT, () => {
    console.log(`🌐 Graph Job Matcher API running on port ${PORT}`);
    console.log(`📍 Health endpoint: http://localhost:${PORT}/api/graph/health`);
  });
}

startServer();
