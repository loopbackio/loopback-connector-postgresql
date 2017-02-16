// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var connector = require('..');
var DataSource = require('loopback-datasource-juggler').DataSource;
var should = require('should');
var db;

before(function() {
  db = getDBConfig();
});

describe('initialization', function() {
  it('honours user-defined pg-pool settings', function() {
    var dataSource = new DataSource(connector, {});
    var pool = dataSource.connector.pg.pool;
    pool._factory.max.should.not.equal(999);

    var settings = {max: 999}; // non-default value
    var dataSource = new DataSource(connector, settings);
    var pool = dataSource.connector.pg.pool;
    pool._factory.max.should.equal(999);
  });

  it('honours user-defined url settings', function() {
    var settings = {url: 'postgres://' + db.username + ':' + db.password + '@' +
    db.host + ':' + db.port + '/' + db.database};

    var dataSource = new DataSource(connector, {});
    var clientConfig = dataSource.connector.clientConfig;
    should.not.exist(clientConfig.connectionString);

    var dataSource = new DataSource(connector, settings);
    var clientConfig = dataSource.connector.clientConfig;
    clientConfig.connectionString.should.equal(settings.url);
  });

  it('honours multiple user-defined settings', function() {
    var settings = {url: 'postgres://' + db.username + ':' + db.password + '@' +
    db.host + ':' + db.port + '/' + db.database, max: 999};

    var dataSource = new DataSource(connector, settings);
    var pool = dataSource.connector.pg.pool;
    pool._factory.max.should.equal(999);

    var clientConfig = dataSource.connector.clientConfig;
    clientConfig.connectionString.should.equal(settings.url);
  });
});
