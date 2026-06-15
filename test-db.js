const mariadb = require('mariadb');

async function test() {
  console.log('Testing mariadb direct connection...');
  try {
    const pool = mariadb.createPool({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      database: 'mpc_repairs'
    });
    const conn = await pool.getConnection();
    console.log('Connected successfully!');
    const rows = await conn.query('SHOW TABLES');
    console.log('Tables:', rows);
    await conn.release();
    await pool.end();
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

test();
