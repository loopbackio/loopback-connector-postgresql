// Copyright IBM Corp. 2013,2019. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';
const assert = require('assert');
const _ = require('lodash');
let ds, properties, SimpleEmployee, Emp1, Emp2;

before(function() {
  ds = global.getDataSource();
});

describe('autoupdate', function() {
  describe('should update properties', function() {
    before(function(done) {
      properties = {
        name: {
          type: String,
        },
        age: {
          type: Number,
        },
        dateJoined: {
          type: String,
        },
      };
      SimpleEmployee = ds.define('SimpleEmployee', properties);
      ds.automigrate(done);
    });

    after(function(done) {
      SimpleEmployee.destroyAll(done);
    });

    it('get old model properties', function(done) {
      ds.discoverModelProperties('simpleemployee', {schema: 'public'},
        function(err, props) {
          assert(!err);
          assert.equal(props[0].dataType, 'text');
          assert.equal(props[1].dataType, 'integer');
          assert.equal(props[2].dataType, 'text');
          done();
        });
    });

    it('perform autoupdate and get new model properties', function(done) {
      properties.age.type = String;
      properties.dateJoined.type = Date;
      SimpleEmployee = ds.define('SimpleEmployee', properties);
      ds.autoupdate(function(err) {
        assert(!err);
        ds.discoverModelProperties('simpleemployee', {schema: 'public'},
          function(err, props) {
            assert(!err);
            assert.equal(props[0].dataType, 'text');
            assert.equal(props[1].dataType, 'text');
            assert.equal(props[2].dataType, 'timestamp with time zone');
            done();
          });
      });
    });
  });

  describe('update model with same table name but different schema', function() {
    before(function(done) {
      properties = {
        name: {
          type: String,
        },
        age: {
          type: Number,
        },
      };
      Emp1 = ds.define('Employee', properties, {
        'postgresql': {
          'table': 'employee',
          'schema': 'schema1',
        }});
      Emp2 = ds.define('Employee1', properties, {
        'postgresql': {
          'table': 'employee',
          'schema': 'schema2',
        }});
      ds.automigrate(done);
    });

    after(function(done) {
      Emp1.destroyAll(function(err) {
        assert(!err);
        Emp2.destroyAll(done);
      });
    });

    it('should autoupdate successfully', function(done) {
      properties['code'] = {
        type: String,
      };
      Emp1 = ds.define('Employee', properties, {
        'postgresql': {
          'table': 'employee',
          'schema': 'schema1',
        }});
      ds.autoupdate('Employee', function(err) {
        assert(!err);
        ds.discoverModelProperties('employee', {schema: 'schema1'},
          function(err, props) {
            assert(!err);
            assert(props);
            props = _.filter(props, function(prop) {
              return prop.columnName === 'code';
            });
            assert(props);
            assert(props[0].columnName);
            assert.equal(props[0].columnName, 'code');
            assert.equal(props[0].dataType, 'text');
            ds.discoverModelProperties('employee', {schema: 'schema2'},
              function(err, props) {
                assert(!err);
                assert(props);
                props = _.filter(props, function(prop) {
                  return prop.columnName === 'code';
                });
                assert.equal(props.length, 0);
                done();
              });
          });
      });
    });
  });

  it('should auto migrate/update tables', function(done) {
    const schema_v1 =
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

    const schema_v2 =
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
        const names = props.map(function(p) {
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
              const names = props.map(function(p) {
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
    const schema_v1 =
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
    const schema_v2 = JSON.parse(JSON.stringify(schema_v1));
    schema_v2.properties.name.required = true;

    // Create initial schema
    ds.createModel(schema_v1.name, schema_v1.properties, schema_v1.options);
    ds.automigrate(function() {
      // Create updated schema
      ds.createModel(schema_v2.name, schema_v2.properties, schema_v2.options);
      ds.connector.getTableStatus(schema_v2.name, function(err, actualFields) {
        const sql = ds.connector.getPropertiesToModify(schema_v2.name, actualFields)[0];
        assert.equal(sql, 'ALTER COLUMN "name" SET NOT NULL', 'Check that the SQL is correctly spaced.');
        done();
      });
    });
  });

  describe('foreign key constraint', function() {
    it('should create, update, and delete foreign keys', function(done) {
      const product_schema = {
        'name': 'Product',
        'options': {
          'idInjection': false,
          'postgresql': {
            'schema': 'myapp_test',
            'table': 'product_test',
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

      const customer2_schema = {
        'name': 'CustomerTest2',
        'options': {
          'idInjection': false,
          'postgresql': {
            'schema': 'myapp_test',
            'table': 'customer_test2',
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
          },
          'age': {
            'type': 'Number',
            'required': false,
          },
        },
      };

      const customer3_schema = {
        'name': 'CustomerTest3',
        'options': {
          'idInjection': false,
          'postgresql': {
            'schema': 'myapp_test',
            'table': 'customer_test3',
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
          },
          'age': {
            'type': 'Number',
            'required': false,
          },
        },
      };

      const orderTest_schema_v1 = {
        'name': 'OrderTest',
        'options': {
          'idInjection': false,
          'postgresql': {
            'schema': 'myapp_test',
            'table': 'order_test',
          },
          'foreignKeys': {
            'fk_ordertest_customerId': {
              'name': 'fk_ordertest_customerId',
              'entity': 'CustomerTest3',
              'entityKey': 'id',
              'foreignKey': 'customerId',
            },
          },
        },
        'properties': {
          'id': {
            'type': 'String',
            'length': 20,
            'id': 1,
          },
          'customerId': {
            'type': 'String',
            'length': 20,
            'postgresql': {
              'columnName': 'customerId',
            },
          },
          'description': {
            'type': 'String',
            'required': false,
            'length': 40,
          },
        },
      };

      const orderTest_schema_v2 = {
        'name': 'OrderTest',
        'options': {
          'idInjection': false,
          'postgresql': {
            'schema': 'myapp_test',
            'table': 'order_test',
          },
          'foreignKeys': {
            'fk_ordertest_customerId': {
              'name': 'fk_ordertest_customerId',
              'entity': 'CustomerTest2',
              'entityKey': 'id',
              'foreignKey': 'customerId',
            },
          },
        },
        'properties': {
          'id': {
            'type': 'String',
            'length': 20,
            'id': 1,
          },
          'customerId': {
            'type': 'String',
            'length': 20,
            'postgresql': {
              'columnName': 'customerId',
            },
          },
          'description': {
            'type': 'String',
            'required': false,
            'length': 40,
          },
          'productId': {
            'type': 'String',
            'length': 20,
            'postgresql': {
              'columnName': 'productId',
            },
          },
        },
      };

      const orderTest_schema_v3 = {
        'name': 'OrderTest',
        'options': {
          'idInjection': false,
          'postgresql': {
            'schema': 'myapp_test',
            'table': 'order_test',
          },
          'foreignKeys': {
            'fk_ordertest_customerId': {
              'name': 'fk_ordertest_customerId',
              'entity': 'CustomerTest2',
              'entityKey': 'id',
              'foreignKey': 'customerId',
            },
            'fk_ordertest_productId': {
              'name': 'fk_ordertest_productId',
              'entity': 'Product',
              'entityKey': 'id',
              'foreignKey': 'productId',
            },
          },
        },
        'properties': {
          'id': {
            'type': 'String',
            'length': 20,
            'id': 1,
          },
          'customerId': {
            'type': 'String',
            'length': 20,
            'postgresql': {
              'columnName': 'customerId',
            },
          },
          'description': {
            'type': 'String',
            'required': false,
            'length': 40,
          },
          'productId': {
            'type': 'String',
            'length': 20,
            'postgresql': {
              'columnName': 'productId',
            },
          },
        },
      };

      const orderTest_schema_v4 = {
        'name': 'OrderTest',
        'options': {
          'idInjection': false,
          'postgresql': {
            'schema': 'myapp_test',
            'table': 'order_test',
          },
        },
        'properties': {
          'id': {
            'type': 'String',
            'length': 20,
            'id': 1,
          },
          'customerId': {
            'type': 'String',
            'length': 20,
            'postgresql': {
              'columnName': 'customerId',
            },
          },
          'productId': {
            'type': 'String',
            'length': 20,
            'postgresql': {
              'columnName': 'productId',
            },
          },
          'description': {
            'type': 'String',
            'required': false,
            'length': 40,
          },
        },
      };

      ds.createModel(product_schema.name, product_schema.properties, product_schema.options);
      ds.createModel(customer2_schema.name, customer2_schema.properties, customer2_schema.options);
      ds.createModel(customer3_schema.name, customer3_schema.properties, customer3_schema.options);

      // Table create order is important. Referenced tables must exist before creating a reference.
      // do initial update/creation of referenced tables
      ds.autoupdate(function(err) {
        if (err) {
          err.message += ' (while running initial autoupdate)';
          return done(err);
        }

        // do initial update/creation of table with fk
        ds.createModel(orderTest_schema_v1.name, orderTest_schema_v1.properties, orderTest_schema_v1.options);
        ds.autoupdate(function(err) {
          if (err) {
            err.message += ' (while updating OrderTest schema v1)';
            return done(err);
          }
          ds.discoverModelProperties('order_test', function(err, props) {
            if (err) return done(err);
            // validate that we have the correct number of properties
            assert.equal(props.length, 3);

            // get the foreign keys for order_test
            ds.connector.discoverForeignKeys('order_test', {}, function(err, foreignKeys) {
              if (err) return done(err);

              // validate that the foreign key exists and points to the right column
              assert(foreignKeys);
              assert.equal(foreignKeys.length, 1);
              assert.equal(foreignKeys[0].pkColumnName, 'id');
              assert.equal(foreignKeys[0].pkTableName, 'customer_test3');
              assert.equal(foreignKeys[0].fkColumnName, 'customerId');
              assert.equal(foreignKeys[0].fkName, 'fk_ordertest_customerId');

              // update and add another fk
              ds.createModel(orderTest_schema_v2.name, orderTest_schema_v2.properties, orderTest_schema_v2.options);
              ds.autoupdate(function(err) {
                if (err) {
                  err.message += ' (while updating OrderTest schema v2)';
                  return done(err);
                }
                ds.discoverModelProperties('order_test', function(err, props) {
                  if (err) return done(err);
                  // validate that we have the correct number of properties
                  assert.equal(props.length, 4);

                  // get the foreign keys for order_test
                  ds.connector.discoverForeignKeys('order_test', {}, function(err, foreignKeysUpdated) {
                    if (err) return done(err);
                    // validate that the foreign keys exist and point to the new column
                    assert(foreignKeysUpdated);
                    assert.equal(foreignKeysUpdated.length, 1);
                    assert.equal(foreignKeysUpdated[0].pkColumnName, 'id');
                    assert.equal(foreignKeysUpdated[0].pkTableName, 'customer_test2');
                    assert.equal(foreignKeysUpdated[0].fkColumnName, 'customerId');
                    assert.equal(foreignKeysUpdated[0].fkName, 'fk_ordertest_customerId');

                    // create multiple fks on object
                    ds.createModel(orderTest_schema_v3.name, orderTest_schema_v3.properties,
                      orderTest_schema_v3.options);
                    ds.autoupdate(function(err) {
                      if (err) {
                        err.message += ' (while updating OrderTest schema v3)';
                        return done(err);
                      }
                      // get the foreign keys for order_test
                      ds.connector.discoverForeignKeys('order_test', {}, function(err, foreignKeysMulti) {
                        if (err) return done(err);
                        assert(foreignKeysMulti);
                        assert.equal(foreignKeysMulti.length, 2);

                        // remove fk
                        ds.createModel(orderTest_schema_v4.name, orderTest_schema_v4.properties,
                          orderTest_schema_v4.options);
                        ds.autoupdate(function(err) {
                          if (err) {
                            err.message += ' (while updating OrderTest schema v4)';
                            return done(err);
                          }
                          ds.discoverModelProperties('order_test', function(err, props) {
                            if (err) return done(err);

                            // validate that we have the correct number of properties
                            assert.equal(props.length, 4);

                            // get the foreign keys for order_test
                            ds.connector.discoverForeignKeys('order_test', {}, function(err, foreignKeysEmpty) {
                              if (err) return done(err);
                              assert(foreignKeysEmpty);
                              assert.equal(foreignKeysEmpty.length, 0);
                              done();
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  describe('indexes on table in schema', function() {
    const schema = {
      options: {
        postgresql: {
          schema: 'aschema',
        },
      },
      properties: {
        something: {
          type: 'string',
          index: true,
        },
      },
    };

    const changedSchema = Object.assign({}, schema, {
      properties: {
        something: {
          type: 'string',
          index: false,
        },
      },
    });

    afterEach(function(done) {
      ds.adapter.dropTable('ATable', done);
    });

    it('should update without errors', function(done) {
      ds.define('ATable', schema.properties, schema.options);
      ds.autoupdate(['ATable'], function(err) {
        assert(!err, err);
        done();
      });
    });

    it('should be removed successfully', function(done) {
      ds.define('ATable', schema.properties, schema.options);
      ds.autoupdate(['ATable'], function(err) {
        assert(!err, err);
        ds.define('ATable', changedSchema.properties, changedSchema.options);
        ds.autoupdate(['ATable'], function(err) {
          assert(!err, err);
          done();
        });
      });
    });
  });
});
