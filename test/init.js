// Copyright IBM Corp. 2013,2015. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';
var DataSource = require('loopback-datasource-juggler').DataSource;

var config = require('rc')('loopback', {test: {postgresql: {}}}).test.postgresql;

if (process.env.CI) {
  process.env.PGHOST = process.env.POSTGRESQL_HOST ||
    process.env.PGHOST ||
    'localhost';
  process.env.PGPORT = process.env.POSTGRESQL_PORT ||
    process.env.PGPORT ||
    5432;
  process.env.PGUSER = process.env.POSTGRESQL_USER ||
    process.env.PGUSER ||
    'test';
  process.env.PGPASSWORD = process.env.POSTGRESQL_PASSWORD ||
    process.env.PGPASSWORD ||
    '';
  config = {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.POSTGRESQL_DATABASE ||
      process.env.PGDATABASE ||
      'emptytest',
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
  };
}

var url = 'postgres://' + (config.username || config.user) + ':' +
  config.password + '@' + (config.host || config.hostname) + ':' +
  config.port + '/' + config.database;

global.getDBConfig = function(useUrl) {
  var settings = config;
  if (useUrl) {
    settings = {url: url};
  };
  return settings;
};
global.getDataSource = global.getSchema = function(useUrl) {
  var settings = getDBConfig(useUrl);
  var db = new DataSource(require('../'), settings);
  db.log = function(a) {
    // console.log(a);
  };
  return db;
};

global.connectorCapabilities = {
  ilike: false,
  nilike: false,
};

global.sinon = require('sinon');
