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
    var pool = dataSource.connector.pg;
    pool.options.max.should.not.equal(999);

    var settings = newConfig();
    settings.max = 999; // non-default value
    var dataSource = new DataSource(connector, settings);
    var pool = dataSource.connector.pg;
    pool.options.max.should.equal(999);
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
});

describe('postgresql connector errors', function() {
  it('Should complete these 4 queries without dying', function(done) {
    var dataSource = getDataSource();
    var db = dataSource.connector;
    var pool = db.pg;
    pool.options.max = 5;
    var errors = 0;
    var shouldGet = 0;
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
