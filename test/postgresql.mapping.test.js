// Copyright IBM Corp. 2014,2015. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';
process.env.NODE_ENV = 'test';
require('should');

var async = require('async');

var db;

before(function() {
  db = getSchema();
});

describe('Mapping models', function() {
  it('should honor the postgresql settings for table/column', function(done) {
    var schema =
      {
        'name': 'TestInventory',
        'options': {
          'idInjection': false,
          'postgresql': {
            'schema': 'public', 'table': 'inventorytest',
          },
        },
        'properties': {
        /*
         "id": {
         "type": "String", "required": true, "length": 20, "id": 1, "postgresql": {
         "columnName": "INVENTORY_ID", "dataType": "VARCHAR", "nullable": "N"
         }
         },
         */
          'productId': {
            'type': 'String', 'required': true, 'length': 20, 'id': 1, 'postgresql': {
              'columnName': 'product_id', 'dataType': 'VARCHAR', 'nullable': 'NO',
            },
          },
          'locationId': {
            'type': 'String', 'required': true, 'length': 20, 'id': 2, 'postgresql': {
              'columnName': 'location_id', 'dataType': 'VARCHAR', 'nullable': 'NO',
            },
          },
          'available': {
            'type': 'Number', 'required': false, 'postgresql': {
              'columnName': 'available', 'dataType': 'INTEGER', 'nullable': 'YES',
            },
          },
          'total': {
            'type': 'Number', 'required': false, 'postgresql': {
              'columnName': 'total', 'dataType': 'INTEGER', 'nullable': 'YES',
            },
          },
        },
      };
    var models = db.modelBuilder.buildModels(schema);
    // console.log(models);
    var Model = models['TestInventory'];
    Model.attachTo(db);

    db.automigrate(function(err, data) {
      async.series([
        function(callback) {
          Model.destroyAll(callback);
        },
        function(callback) {
          Model.create({productId: 'p001', locationId: 'l001', available: 10, total: 50}, callback);
        },
        function(callback) {
          Model.create({productId: 'p001', locationId: 'l002', available: 30, total: 40}, callback);
        },
        function(callback) {
          Model.create({productId: 'p002', locationId: 'l001', available: 15, total: 30}, callback);
        },
        function(callback) {
          Model.find({fields: ['productId', 'locationId', 'available']}, function(err, results) {
            // console.log(results);
            results.should.have.lengthOf(3);
            results.forEach(function(r) {
              r.should.have.property('productId');
              r.should.have.property('locationId');
              r.should.have.property('available');
              r.should.have.property('total', undefined);
            });
            callback(null, results);
          });
        },
        function(callback) {
          Model.find({fields: {'total': false}}, function(err, results) {
            // console.log(results);
            results.should.have.lengthOf(3);
            results.forEach(function(r) {
              r.should.have.property('productId');
              r.should.have.property('locationId');
              r.should.have.property('available');
              r.should.have.property('total', undefined);
            });
            callback(null, results);
          });
        },
      ], done);
    });
  });
});
