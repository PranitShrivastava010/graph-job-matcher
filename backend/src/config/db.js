const neo4j = require('neo4j-driver');
require('dotenv').config();

const uri = process.env.COGNODB_URI;
const user = process.env.COGNODB_USER;
const password = process.env.COGNODB_PASSWORD;

if (!uri || !user || !password) {
  console.warn('⚠️ Warning: CognoDB credentials in .env are incomplete.');
}

const driver = neo4j.driver(
  uri || 'bolt+s://localhost:7687',
  neo4j.auth.basic(user || 'cognodb', password || ''),
  {
    maxConnectionLifetime: 3 * 60 * 60 * 1000,
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 30000,
    disableLosslessIntegers: true
  }
);

function normalizeNeo4jValue(val) {
  if (val === null || val === undefined) return val;
  if (neo4j.isInt(val)) return val.toNumber();
  if (Array.isArray(val)) return val.map(normalizeNeo4jValue);
  if (typeof val === 'object') {
    if (val.properties) {
      const props = {};
      for (const k in val.properties) {
        props[k] = normalizeNeo4jValue(val.properties[k]);
      }
      return props;
    }
    const plain = {};
    for (const k in val) {
      plain[k] = normalizeNeo4jValue(val[k]);
    }
    return plain;
  }
  return val;
}

/**
 * Execute a parameterized Cypher query.
 * Guarantees zero SQL/Cypher injection via parameterization.
 */
async function runQuery(cypher, params = {}, mode = 'READ') {
  const session = driver.session({
    defaultAccessMode: mode === 'WRITE' ? neo4j.session.WRITE : neo4j.session.READ
  });

  try {
    const result = await session.run(cypher, params);
    return result.records.map(record => {
      const row = {};
      record.keys.forEach(key => {
        row[key] = normalizeNeo4jValue(record.get(key));
      });
      return row;
    });
  } catch (error) {
    console.error('Cypher Query Execution Error:', error.message);
    throw error;
  } finally {
    await session.close();
  }
}

async function verifyConnection() {
  const session = driver.session();
  try {
    const res = await session.run('RETURN 1 AS connected, datetime() AS serverTime');
    const row = res.records[0];
    const connected = row ? normalizeNeo4jValue(row.get('connected')) : 0;
    return { success: connected === 1 };
  } catch (err) {
    return { success: false, error: err.message };
  } finally {
    await session.close();
  }
}

module.exports = {
  driver,
  runQuery,
  verifyConnection,
  neo4j
};
