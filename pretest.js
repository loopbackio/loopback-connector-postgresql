'use strict';
if (!process.env.TEST_POSTGRESQL_USER && !process.env.CI) {
  console.log('not seeding DB with test db');
  return;
}

var fs = require('fs');
var cp = require('child_process');

var sql = fs.createReadStream(require.resolve('./test/schema.sql'));
var stdio = ['pipe', process.stdout, process.stderr];
process.env.PGHOST = process.env.TEST_POSTGRESQL_HOST ||
  process.env.POSTGRESQL_HOST || process.env.PGHOST || 'localhost';
process.env.PGPORT = process.env.TEST_POSTGRESQL_PORT ||
  process.env.POSTGRESQL_PORT || process.env.PGPORT || 5432;
process.env.PGUSER = process.env.TEST_POSTGRESQL_USER ||
  process.env.POSTGRESQL_USER || process.env.PGUSER || 'test';
process.env.PGPASSWORD = process.env.TEST_POSTGRESQL_PASSWORD ||
  process.env.POSTGRESQL_PASSWORD || process.env.PGPASSWORD || 'test';

console.log('seeding DB with test db...');
var psql = cp.spawn('psql', {stdio: stdio});
sql.pipe(psql.stdin);
psql.on('exit', function(code) {
  console.log('done seeding DB');
  setTimeout(function() {
    process.exit(code);
  }, 200);
});
