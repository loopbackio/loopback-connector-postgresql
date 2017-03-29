// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';
require('./init');
var Promise = require('bluebird');
var connector = require('..');
var DataSource = require('loopback-datasource-juggler').DataSource;
var should = require('should');

// simple wrapper that uses JSON.parse(JSON.stringify()) as cheap clone
function newConfig(withURL) {
  return JSON.parse(JSON.stringify(getDBConfig(withURL)));
}

describe('initialization', function() {
  it('honours user-defined pg-pool settings', function() {
    var dataSource = new DataSource(connector, newConfig());
    var pool = dataSource.connector.pg.pool;
    pool._factory.max.should.not.equal(999);

    var settings = newConfig();
    settings.max = 999; // non-default value
    var dataSource = new DataSource(connector, settings);
    var pool = dataSource.connector.pg.pool;
    pool._factory.max.should.equal(999);
  });

  it('honours user-defined url settings', function() {
    var settings = newConfig();

    var dataSource = new DataSource(connector, settings);
    var clientConfig = dataSource.connector.clientConfig;
    should.not.exist(clientConfig.connectionString);

    settings = newConfig(true);
    var dataSource = new DataSource(connector, settings);
    var clientConfig = dataSource.connector.clientConfig;
    clientConfig.connectionString.should.equal(settings.url);
  });

  it('honours multiple user-defined settings', function() {
    var urlOnly = {url: newConfig(true).url, max: 999};

    var dataSource = new DataSource(connector, urlOnly);
    var pool = dataSource.connector.pg.pool;
    pool._factory.max.should.equal(999);

    var clientConfig = dataSource.connector.clientConfig;
    clientConfig.connectionString.should.equal(urlOnly.url);
  });
});

describe('postgresql connector errors', function() {
  it('Should complete these 4 queries without dying', function(done) {
    var dataSource = getDataSource();
    var db = dataSource.connector;
    var pool = db.pg.pool;
    pool._factory.max = 5;
    pool._factory.min = null;
    var errors = 0;
    var shouldGet = 0;
    function runErrorQuery() {
      shouldGet++;
      return new Promise(function(resolve, reject) {
        db.executeSQL("SELECT 'asd'+1 ", [], {}, function(err, res) {
          if (err) {
            errors++;
            console.log('got err', errors);
            resolve(err);
          } else {
            reject(res); // this should always error
          }
        });
      });
    };
    var ps = [];
    for (var i = 0; i < 12; i++) {
      ps.push(runErrorQuery());
    }
    Promise.all(ps).then(function() {
      shouldGet.should.equal(errors);
      done();
    });
  });
});
