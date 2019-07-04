// Copyright IBM Corp. 2016,2017. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';
require('./init');
const Promise = require('bluebird');
const connector = require('..');
const DataSource = require('loopback-datasource-juggler').DataSource;
const should = require('should');

// simple wrapper that uses JSON.parse(JSON.stringify()) as cheap clone
function newConfig(withURL) {
  return JSON.parse(JSON.stringify(getDBConfig(withURL)));
}

describe('initialization', function() {
  it('honours user-defined pg-pool settings', function() {
    var dataSource = new DataSource(connector, newConfig());
    var pool = dataSource.connector.pg;
    pool.options.max.should.not.equal(999);

    const settings = newConfig();
    settings.max = 999; // non-default value
    var dataSource = new DataSource(connector, settings);
    var pool = dataSource.connector.pg;
    pool.options.max.should.equal(999);
  });

  it('honours user-defined url settings', function() {
    let settings = newConfig();

    var dataSource = new DataSource(connector, settings);
    var clientConfig = dataSource.connector.clientConfig;
    should.not.exist(clientConfig.connectionString);

    settings = newConfig(true);
    var dataSource = new DataSource(connector, settings);
    var clientConfig = dataSource.connector.clientConfig;
    clientConfig.connectionString.should.equal(settings.url);
  });

  it('honours multiple user-defined settings', function() {
    const urlOnly = {url: newConfig(true).url, max: 999};

    const dataSource = new DataSource(connector, urlOnly);
    const pool = dataSource.connector.pg;
    pool.options.max.should.equal(999);

    const clientConfig = dataSource.connector.clientConfig;
    clientConfig.connectionString.should.equal(urlOnly.url);
  });
});

describe('postgresql connector errors', function() {
  it('Should complete these 4 queries without dying', function(done) {
    const dataSource = getDataSource();
    const db = dataSource.connector;
    const pool = db.pg;
    pool.options.max = 5;
    let errors = 0;
    let shouldGet = 0;
    function runErrorQuery() {
      shouldGet++;
      return new Promise(function(resolve, reject) {
        db.executeSQL("SELECT 'asd'+1 ", [], {}, function(err, res) {
          if (err) {
            errors++;
            resolve(err);
          } else {
            reject(res); // this should always error
          }
        });
      });
    }
    const ps = [];
    for (let i = 0; i < 12; i++) {
      ps.push(runErrorQuery());
    }
    Promise.all(ps).then(function() {
      shouldGet.should.equal(errors);
      done();
    });
  });
});
