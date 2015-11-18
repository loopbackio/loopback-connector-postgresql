var DataSource = require('loopback-datasource-juggler').DataSource;

var config = require('rc')('loopback', {test: {postgresql: {}}}).test.postgresql;

if (process.env.CI) {
  config = {
    host: process.env.POSTGRESQL_HOST || config.host || 'localhost',
    port: process.env.POSTGRESQL_PORT || config.port || 5432,
    database: 'test',
    username: process.env.POSTGRESQL_USER || config.username,
    password: process.env.POSTGRESQL_PASSWORD || config.password
  };
}

global.getDataSource = global.getSchema = function () {
  var db = new DataSource(require('../'), config);
  db.log = function (a) {
    // console.log(a);
  };
  return db;
};

global.sinon = require('sinon');
