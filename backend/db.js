const path = require('path');
const Database = require('better-sqlite3');

const isTestEnv = process.env.NODE_ENV === 'test';
const dbPath = path.resolve(__dirname, '../database/mydb.sqlite');

const db = isTestEnv
  ? new Database(':memory:')
  : new Database(dbPath, {
      fileMustExist: false, // Create the database file if it doesn't exist
      readonly: false,      // Ensure write permissions
      verbose: console.log  // Optional: Log all SQL queries for debugging
    });

module.exports = db;
