const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const logger = require('../utils/logger');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL || 'mysql://root@127.0.0.1:3306/mpc_repairs';

let adapter;
let prisma;

try {
  let host = '127.0.0.1';
  let port = 3306;
  let user = 'root';
  let password = '';
  let database = 'mpc_repairs';

  const match = dbUrl.match(/mysql:\/\/([^:]*)(?::([^@]*))?@([^:/]*)(?::(\d+))?\/([^?]+)/);
  if (match) {
    user = match[1] || user;
    password = match[2] || '';
    host = match[3] || host;
    port = match[4] ? parseInt(match[4]) : port;
    database = match[5] || database;
  }

  logger.info(`Initializing PrismaMariaDb adapter for host=${host}, port=${port}, database=${database}, user=${user}`);

  // PrismaMariaDb expects connection options object directly, NOT a mariadb pool instance!
  adapter = new PrismaMariaDb({
    host,
    port,
    user,
    password,
    database,
    connectionLimit: 10,
    allowPublicKeyRetrieval: true
  });

  prisma = new PrismaClient({ adapter });

} catch (err) {
  logger.error('Failed to initialize Prisma client with MariaDB driver adapter:', err);
  throw err;
}

module.exports = {
  prisma
};
