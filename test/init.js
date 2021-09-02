// Copyright IBM Corp. 2013,2019. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';
const juggler = require('loopback-datasource-juggler');
let DataSource = juggler.DataSource;

let config = require('rc')('loopback', {test: {postgresql: {}}}).test.postgresql;

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
process.env.ENCRYPTION_HEX_KEY = process.env.ENCRYPTION_HEX_KEY || 'abcdef0123456789abcdef0123456789';
process.env.ENCRYPTION_HEX_IV = process.env.ENCRYPTION_HEX_IV || '0123456789abcdef0123456789abcdef';

config = {
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.POSTGRESQL_DATABASE ||
      process.env.PGDATABASE ||
      'emptytest',
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
};

const url = 'postgres://' + (config.username || config.user) + ':' +
  config.password + '@' + (config.host || config.hostname) + ':' +
  config.port + '/' + config.database;

global.getDBConfig = function(useUrl) {
  let settings = config;
  if (useUrl) {
    settings = {url: url};
  }
  return settings;
};

let db;
global.getDataSource = global.getSchema = function(useUrl) {
  // Return cached data source if possible to avoid too many client error
  // due to multiple instances of connection pools
  if (!useUrl && db) return db;
  const settings = global.getDBConfig(useUrl);
  db = new DataSource(require('../'), settings);
  db.log = function(a) {
    // console.log(a);
  };
  return db;
};

global.resetDataSourceClass = function(ctor) {
  DataSource = ctor || juggler.DataSource;
  const promise = db ? db.disconnect() : Promise.resolve();
  db = undefined;
  return promise;
};

global.connectorCapabilities = {
  ilike: false,
  nilike: false,
  // TODO: [b-admike] we do not support arrays at the moment
  // see https://github.com/strongloop/loopback-connector-postgresql/issues/342
  supportsArrays: false,
};
