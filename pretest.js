// Copyright IBM Corp. 2016,2019. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';
if (!process.env.CI) {
  return console.log('not seeding DB with test db');
}

const fs = require('fs');
const cp = require('child_process');

const sql = fs.createReadStream(require.resolve('./test/schema.sql'));
const stdio = ['pipe', process.stdout, process.stderr];
process.env.PGHOST = process.env.TEST_POSTGRESQL_HOST ||
  process.env.POSTGRESQL_HOST || process.env.PGHOST || 'localhost';
process.env.PGPORT = process.env.TEST_POSTGRESQL_PORT ||
  process.env.POSTGRESQL_PORT || process.env.PGPORT || 5432;
process.env.PGUSER = process.env.TEST_POSTGRESQL_USER ||
  process.env.POSTGRESQL_USER || process.env.PGUSER || 'test';
process.env.PGPASSWORD = process.env.TEST_POSTGRESQL_PASSWORD ||
  process.env.POSTGRESQL_PASSWORD || process.env.PGPASSWORD || 'test';

console.log('seeding DB with test db...');
const args = process.env.POSTGRESQL_DATABASE ?
  ['-U', process.env.PGUSER, process.env.POSTGRESQL_DATABASE] :
  ['-U', process.env.PGUSER];
const psql = cp.spawn('psql', args, {stdio: stdio});
sql.pipe(psql.stdin);
psql.on('exit', function(code) {
  console.log('done seeding DB');
  setTimeout(function() {
    process.exit(code);
  }, 200);
});
