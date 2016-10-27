// Copyright IBM Corp. 2013,2016. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';
var assert = require('assert');
var ds;

before(function() {
  ds = getDataSource();
});

describe('PostgreSQL connector', function() {
  it('should auto migrate/update tables', function(done) {
    var schema_v1 =
      {
        'name': 'CustomerTest',
        'options': {
          'idInjection': false,
          'postgresql': {
            'schema': 'public',
            'table': 'customer_test',
          },
        },
        'properties': {
          'id': {
            'type': 'String',
            'length': 20,
            'id': 1,
          },
          'name': {
            'type': 'String',
            'required': false,
            'length': 40,
          },
          'email': {
            'type': 'String',
            'required': true,
            'length': 40,
            'index': {
              'unique': false,
              'type': 'hash',
            },
          },
          'age': {
            'type': 'Number',
            'required': false,
          },
        },
      };

    var schema_v2 =
      {
        'name': 'CustomerTest',
        'options': {
          'idInjection': false,
          'postgresql': {
            'schema': 'public',
            'table': 'customer_test',
          },
        },
        'properties': {
          'id': {
            'type': 'String',
            'length': 20,
            'id': 1,
            'index': {'unique': true},
          },
          'email': {
            'type': 'String',
            'required': false,
            'length': 60,
            'postgresql': {
              'columnName': 'email',
              'dataType': 'varchar',
              'dataLength': 60,
              'nullable': 'YES',
            },
            'index': true,
          },
          'firstName': {
            'type': 'String',
            'required': false,
            'length': 40,
            'index': true,
          },
          'lastName': {
            'type': 'String',
            'required': false,
            'length': 40,
          },
        },
      };

    ds.createModel(schema_v1.name, schema_v1.properties, schema_v1.options);

    ds.automigrate(function() {
      ds.discoverModelProperties('customer_test', function(err, props) {
        assert.equal(props.length, 4);
        var names = props.map(function(p) {
          return p.columnName;
        });
        assert.equal(props[0].nullable, 'NO');
        assert.equal(props[1].nullable, 'YES');
        assert.equal(props[2].nullable, 'NO');
        assert.equal(props[3].nullable, 'YES');
        assert.equal(names[0], 'id');
        assert.equal(names[1], 'name');
        assert.equal(names[2], 'email');
        assert.equal(names[3], 'age');

        // check indexes
        ds.connector.discoverModelIndexes('CustomerTest', function(err, indexes) {
          assert.deepEqual(indexes, {
            customer_test_email_idx: {
              table: 'customer_test',
              type: 'hash',
              primary: false,
              unique: false,
              keys: ['email'],
              order: ['ASC']},

            customer_test_pkey: {
              table: 'customer_test',
              type: 'btree',
              primary: true,
              unique: true,
              keys: ['id'],
              order: ['ASC']},
          });

          ds.createModel(schema_v2.name, schema_v2.properties, schema_v2.options);

          ds.autoupdate(function(err, result) {
            ds.discoverModelProperties('customer_test', function(err, props) {
              assert.equal(props.length, 4);
              var names = props.map(function(p) {
                return p.columnName;
              });
              assert.equal(names[0], 'id');
              assert.equal(names[1], 'email');
              assert.equal(names[2], 'firstname');
              assert.equal(names[3], 'lastname');

              // verify that indexes have been updated
              ds.connector.discoverModelIndexes('CustomerTest', function(err, indexes) {
                assert.deepEqual(indexes, {
                  customer_test_pkey: {
                    table: 'customer_test',
                    type: 'btree',
                    primary: true,
                    unique: true,
                    keys: ['id'],
                    order: ['ASC']},

                  customer_test_id_idx: {
                    table: 'customer_test',
                    type: 'btree',
                    primary: false,
                    unique: true,
                    keys: ['id'],
                    order: ['ASC']},

                  customer_test_email_idx: {
                    table: 'customer_test',
                    type: 'hash',
                    primary: false,
                    unique: false,
                    keys: ['email'],
                    order: ['ASC']},

                  customer_test_firstname_idx: {
                    table: 'customer_test',
                    type: 'btree',
                    primary: false,
                    unique: false,
                    keys: ['firstname'],
                    order: ['ASC']},
                });

                // console.log(err, result);
                done(err, result);
              });
            });
          });
        });
      });
    });
  });

  it('should report errors for automigrate', function() {
    ds.automigrate('XYZ', function(err) {
      assert(err);
    });
  });

  it('should report errors for autoupdate', function() {
    ds.autoupdate('XYZ', function(err) {
      assert(err);
    });
  });

  it('should produce valid sql for setting column nullability', function(done) {
    // Initial schema
    var schema_v1 =
      {
        'name': 'NamePersonTest',
        'options': {
          'idInjection': false,
          'postgresql': {
            'schema': 'public',
            'table': 'name_person_test',
          },
        },
        'properties': {
          'id': {
            'type': 'String',
            'length': 20,
            'id': 1,
          },
          'name': {
            'type': 'String',
            'required': false,
            'length': 40,
          },
        },
      };

    // Change nullability
    var schema_v2 = JSON.parse(JSON.stringify(schema_v1));
    schema_v2.properties.name.required = true;

    // Create initial schema
    ds.createModel(schema_v1.name, schema_v1.properties, schema_v1.options);
    ds.automigrate(function() {
      // Create updated schema
      ds.createModel(schema_v2.name, schema_v2.properties, schema_v2.options);
      ds.connector.getTableStatus(schema_v2.name, function(err, actualFields) {
        var sql = ds.connector.getPropertiesToModify(schema_v2.name, actualFields)[0];
        assert.equal(sql, 'ALTER COLUMN "name" SET NOT NULL', 'Check that the SQL is correctly spaced.');
        done();
      });
    });
  });
});
