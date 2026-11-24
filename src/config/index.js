require('dotenv').config();
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { PrismaClient } = require('@prisma/client');

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
const adapter = new PrismaLibSql({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;