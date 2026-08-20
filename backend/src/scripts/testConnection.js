const { verifyConnection, driver } = require('../config/db');

async function test() {
  console.log('Testing connection to CognoDB Cloud...');
  const result = await verifyConnection();
  console.log('Connection test result:', result);
  await driver.close();
  process.exit(result.success ? 0 : 1);
}

test();
