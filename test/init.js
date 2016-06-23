// Copyright IBM Corp. 2013,2015. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var DataSource = require('loopback-datasource-juggler').DataSource;

var config = require('rc')('loopback', {test: {postgresql: {}}}).test.postgresql;

if (process.env.CI) {
  config = {
    host: process.env.TEST_POSTGRESQL_HOST || config.host || 'localhost',
    port: process.env.TEST_POSTGRESQL_PORT || config.port || 5432,
    database: 'test',
    username: process.env.TEST_POSTGRESQL_USER || config.username,
    password: process.env.TEST_POSTGRESQL_PASSWORD || config.password
  };
}

var url = 'postgres://' + config.username || config.user + ':' +
  config.password + '@' + config.host || config.hostname + ':' +
  config.port + '/' + config.database;

global.getDataSource = global.getSchema = function(useUrl) {
  var settings = config;
  if (useUrl) {
    settings = {url: url};
  }
  var db = new DataSource(require('../'), config);
  db.log = function(a) {
    // console.log(a);
  };
  return db;
};

global.sinon = require('sinon');
