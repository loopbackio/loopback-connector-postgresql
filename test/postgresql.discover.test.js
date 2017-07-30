// Copyright IBM Corp. 2013,2014. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';
process.env.NODE_ENV = 'test';
require('should');

var assert = require('assert');
var _ = require('lodash');

var DataSource = require('loopback-datasource-juggler').DataSource;
var db, City;

before(function() {
  var config = getDBConfig();
  config.database = 'strongloop';
  db = new DataSource(require('../'), config);
});

describe('discoverModels', function() {
  describe('Discover database schemas', function() {
    it('should return an array of db schemas', function(done) {
      db.connector.discoverDatabaseSchemas(function(err, schemas) {
        if (err) return done(err);
        schemas.should.be.an.array;
        schemas.length.should.be.above(0);
        done();
      });
    });
  });

  describe('Discover models including views', function() {
    it('should return an array of tables and views', function(done) {
      db.discoverModelDefinitions({
        views: true,
        limit: 3,
      }, function(err, models) {
        if (err) {
          console.error(err);
          done(err);
        } else {
          var views = false;
          models.forEach(function(m) {
            // console.dir(m);
            if (m.type === 'view') {
              views = true;
            }
          });
          assert(views, 'Should have views');
          done(null, models);
        }
      });
    });
  });

  describe('Discover models excluding views', function() {
    it('should return an array of only tables', function(done) {
      db.discoverModelDefinitions({
        views: false,
        limit: 3,
      }, function(err, models) {
        if (err) {
          console.error(err);
          done(err);
        } else {
          var views = false;
          models.forEach(function(m) {
            // console.dir(m);
            if (m.type === 'view') {
              views = true;
            }
          });
          models.should.have.length(3);
          assert(!views, 'Should not have views');
          done(null, models);
        }
      });
    });
  });
});

describe('Discover models including other users', function() {
  it('should return an array of all tables and views', function(done) {
    db.discoverModelDefinitions({
      all: true,
      limit: 3,
    }, function(err, models) {
      if (err) {
        console.error(err);
        done(err);
      } else {
        var others = false;
        models.forEach(function(m) {
          // console.dir(m);
          if (m.owner !== 'strongloop') {
            others = true;
          }
        });
        assert(others, 'Should have tables/views owned by others');
        done(err, models);
      }
    });
  });
});

describe('Discover model properties', function() {
  before(function(done) {
    City = db.define('City', {
      name: {type: String},
      code: {type: String},
      lng: {type: Number, postgresql: {
        dataType: 'double precision',
      }},
      lat: {type: Number, postgresql: {
        dataType: 'real',
      }},
    });
    db.automigrate(done);
  });

  after(function(done) {
    City.destroyAll(done);
  });

  it('discover model properties', function(done) {
    db.discoverModelProperties('city', function(err, properties) {
      assert(!err);
      assert(properties);
      var dataTypes = _.map(properties, function(prop) {
        return prop.dataType;
      });
      assert(dataTypes);
      assert.equal(dataTypes[2], 'float');
      assert.equal(dataTypes[3], 'float');
      done();
    });
  });

  it('discover model definition and autoupdate', function(done) {
    db.discoverSchemas('city', function(err, schema) {
      assert(!err);
      assert(schema);
      schema = schema['public.city'];
      schema.properties.country = {
        type: String,
      };
      db.createModel(schema.name, schema.properties, schema.options);
      db.autoupdate(function(err) {
        assert(!err);
        var sql = db.connector.buildQueryColumns('public', 'city');
        db.connector.execute(sql, function(err, columns) {
          assert(!err);
          assert(columns);
          var cols = _.filter(columns, function(col) {
            return col.dataType === 'real' || col.dataType === 'double precision';
          });
          assert(cols);
          assert.equal(cols[0].columnName, 'lng');
          assert.equal(cols[0].dataType, 'double precision');
          assert.equal(cols[1].columnName, 'lat');
          assert.equal(cols[1].dataType, 'real');
          done();
        });
      });
    });
  });

  describe('Discover a named model', function() {
    it('should return an array of columns for product', function(done) {
      db.discoverModelProperties('product', function(err, models) {
        if (err) {
          console.error(err);
          done(err);
        } else {
          models.forEach(function(m) {
            // console.dir(m);
            assert(m.tableName === 'product');
          });
          done(null, models);
        }
      });
    });
  });
});

describe('Discover model primary keys', function() {
  it('should return an array of primary keys for product', function(done) {
    db.discoverPrimaryKeys('product', function(err, models) {
      if (err) {
        console.error(err);
        done(err);
      } else {
        models.forEach(function(m) {
          assert.deepEqual(m, {owner: 'strongloop',
            tableName: 'product',
            columnName: 'id',
            keySeq: 1,
            pkName: 'product_pkey'});
        });
        done(null, models);
      }
    });
  });

  it('should return an array of primary keys for strongloop.product', function(done) {
    db.discoverPrimaryKeys('product', {owner: 'strongloop'}, function(err, models) {
      if (err) {
        console.error(err);
        done(err);
      } else {
        models.forEach(function(m) {
          // console.dir(m);
          assert(m.tableName === 'product');
        });
        done(null, models);
      }
    });
  });
});

describe('Discover model foreign keys', function() {
  it('should return an array of foreign keys for inventory', function(done) {
    db.discoverForeignKeys('inventory', function(err, models) {
      if (err) {
        console.error(err);
        done(err);
      } else {
        models.forEach(function(m) {
          // console.dir(m);
          assert(m.fkTableName === 'inventory');
        });
        done(null, models);
      }
    });
  });
  it('should return an array of foreign keys for strongloop.inventory', function(done) {
    db.discoverForeignKeys('inventory', {owner: 'strongloop'}, function(err, models) {
      if (err) {
        console.error(err);
        done(err);
      } else {
        models.forEach(function(m) {
          // console.dir(m);
          assert(m.fkTableName === 'inventory');
        });
        done(null, models);
      }
    });
  });
});

describe('Discover LDL schema from a table', function() {
  it('should return an LDL schema for inventory', function(done) {
    db.discoverSchema('inventory', {owner: 'strongloop'}, function(err, schema) {
      console.log('This is our err: ', err);
      console.log('This is our schema: ', schema);
      assert(schema.name === 'Inventory');
      assert(schema.options.postgresql.schema === 'strongloop');
      assert(schema.options.postgresql.table === 'inventory');
      assert(schema.properties.productId);
      assert(schema.properties.productId.type === 'String');
      assert(schema.properties.productId.postgresql.columnName === 'product_id');
      assert(schema.properties.locationId);
      assert(schema.properties.locationId.type === 'String');
      assert(schema.properties.locationId.postgresql.columnName === 'location_id');
      assert(schema.properties.available);
      assert(schema.properties.available.type === 'Number');
      assert(schema.properties.total);
      assert(schema.properties.total.type === 'Number');
      done(null, schema);
    });
  });
});

describe('Discover and build models', function() {
  it('should build a model from discovery', function(done) {
    db.discoverAndBuildModels('GeoPoint', {schema: 'strongloop'}, function(err, schema) {
      schema.Geopoint.find(function(err, data) {
        console.log('This is our err: ', err);
        assert(!err);
        assert(Array.isArray(data));
        assert(data[0].location);
        done();
      });
    });
  });
});
