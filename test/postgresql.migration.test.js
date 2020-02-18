// Copyright IBM Corp. 2015,2019. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';
const should = require('./init.js');
const assert = require('assert');
const Schema = require('loopback-datasource-juggler').Schema;

let db;

describe('migrations', function() {
  before(setup);

  it('should run migration', function(done) {
    db.automigrate(['UserDataWithIndexes', 'OrderData', 'DefaultUuid', 'DefaultValueAfterColumnAdd'], done);
  });

  it('UserDataWithIndexes should have correct indexes', function(done) {
    getIndexes('UserDataWithIndexes', function(err, indexes) {
      assert.deepEqual(indexes, {

        userdatawithindexes_pkey: {
          type: 'btree',
          primary: true,
          unique: true,
          keys: ['id'],
          order: ['ASC']},

        userdatawithindexes_email_idx: {
          type: 'btree',
          primary: false,
          unique: false,
          keys: ['email'],
          order: ['ASC']},

        udwi_index1: {
          type: 'btree',
          primary: false,
          unique: true,
          keys: ['email', 'createdbyadmin'],
          order: ['DESC', 'ASC']},

        udwi_index2: {
          type: 'hash',
          primary: false,
          unique: false,
          keys: ['email'],
          order: ['ASC']},

        udwi_index3: {
          type: 'btree',
          primary: false,
          unique: false,
          keys: ['bio', 'email', 'name'],
          order: ['ASC', 'ASC', 'DESC']},

        udwi_index4: {
          type: 'btree',
          primary: false,
          unique: false,
          keys: ['birthdate', 'bio'],
          order: ['DESC', 'ASC']},

        udwi_index5: {
          type: 'btree',
          primary: false,
          unique: true,
          keys: ['name', 'email'],
          order: ['DESC', 'ASC']},
      });
      done();
    });
  });

  it('OrderData should have correct prop type uuid with custom generation function', function(done) {
    checkColumns('OrderData', function(err, cols) {
      assert.deepEqual(cols, {
        ordercode:
        {column_name: 'ordercode',
          column_default: 'uuid_generate_v1()',
          data_type: 'uuid'},
        ordername:
        {column_name: 'ordername',
          column_default: null,
          data_type: 'text'},
        id:
        {column_name: 'id',
          column_default: 'nextval(\'orderdata_id_seq\'::regclass)',
          data_type: 'integer'},
      });
      done();
    });
  });

  it('DefaultUuid should have correct id type uuid and default function v4', function(done) {
    checkColumns('DefaultUuid', function(err, cols) {
      assert.deepEqual(cols, {
        defaultcode:
        {column_name: 'defaultcode',
          column_default: 'uuid_generate_v4()',
          data_type: 'uuid'},
        id:
        {column_name: 'id',
          column_default: 'nextval(\'defaultuuid_id_seq\'::regclass)',
          data_type: 'integer'},
      });
      done();
    });
  });

  it('should add default value for new required columns', async function() {
    const DefaultValueAfterColumnAdd = await db.getModel('DefaultValueAfterColumnAdd');
    await DefaultValueAfterColumnAdd.create({
      name: 'name1',
    });
    await db.defineProperty('DefaultValueAfterColumnAdd', 'createdByAdmin', {
      type: Boolean, required: true, default: true,
    });
    await db.defineProperty('DefaultValueAfterColumnAdd', 'birthDate', {
      type: Date, required: true, default: '2020-02-18T16:50:24.746Z',
    });
    await db.defineProperty('DefaultValueAfterColumnAdd', 'pendingPeriod', {
      type: Number, required: true, default: 10,
    });
    await db.autoupdate(['DefaultValueAfterColumnAdd']);
    const res = await DefaultValueAfterColumnAdd.findOne();

    assert.deepEqual(res.toJSON(), {
      id: 1,
      name: 'name1',
      createdByAdmin: true,
      birthDate: new Date('2020-02-18T16:50:24.746Z'),
      pendingPeriod: 10,
    });
  });
});

function setup(done) {
  require('./init.js');

  db = global.getSchema();

  const UserDataWithIndexes = db.define('UserDataWithIndexes', {
    email: {type: String, null: false, index: true},
    name: String,
    bio: Schema.Text,
    birthDate: Date,
    pendingPeriod: Number,
    createdByAdmin: Boolean,
    deleted: {type: Boolean, required: true, default: false},
  }, {
    indexes: {
      udwi_index1: {
        keys: ['email DESC', 'createdByAdmin'],
        options: {
          unique: true,
        },
      },
      udwi_index2: {
        keys: 'email',
        type: 'hash',
      },
      udwi_index3: 'bio, email, name DESC',
      udwi_index4: {
        keys: {
          'birthDate': -1,
          'bio': 1,
        },
      },
      udwi_index5: {
        keys: {
          'name': -1,
          'email': 0,
        },
        options: {
          unique: true,
        },
      },
    },
  });
  const OrderData = db.define('OrderData', {
    ordercode: {type: 'String', required: true, generated: true, useDefaultIdType: false,
      postgresql: {
        dataType: 'uuid',
        defaultFn: 'uuid_generate_v1()',
        extension: 'uuid-ossp',
      }},
    ordername: {type: 'String'},
  });

  const DefaultUuid = db.define('DefaultUuid', {
    defaultCode: {type: 'String', required: true, generated: true, useDefaultIdType: false,
      postgresql: {
        dataType: 'uuid',
        defaultFn: 'uuid_generate_v1()', // lack extension
      }},
  });

  const DefaultValueAfterColumnAdd = db.define('DefaultValueAfterColumnAdd', {
    name: String,
  });

  done();
}

function getIndexes(model, cb) {
  query(
    'SELECT i.relname AS "name", ' +
    'am.amname AS "type", ix.indisprimary AS "primary", ' +
    'ix.indisunique AS "unique", ' +
    'ARRAY(SELECT pg_get_indexdef(ix.indexrelid, k + 1, true) ' +
    '  FROM generate_subscripts(ix.indkey, 1) AS k ' +
    '  ORDER BY k ) AS "keys", ' +
    'ARRAY(SELECT ' +
    '  CASE ix.indoption[k] & 1 WHEN 1 THEN \'DESC\' ELSE \'ASC\' END ' +
    '  FROM generate_subscripts(ix.indoption, 1) AS k ' +
    '  ORDER BY k ' +
    ') AS "order" ' +
    'FROM pg_class t, pg_class i, pg_index ix, pg_am am ' +
    'WHERE t.oid = ix.indrelid AND i.oid = ix.indexrelid AND ' +
    'i.relam = am.oid AND ' +
    't.relkind=\'r\' AND t.relname=\'' +
    table(model) + '\'',
    function(err, data) {
      const indexes = {};
      if (!err) {
        // group data by index name
        data.forEach(function(index) {
          indexes[index.name] = index;
          delete index.name;
        });
      }
      cb(err, indexes);
    },
  );
}

function table(model) {
  return db.adapter.table(model);
}

function query(sql, cb) {
  db.adapter.query(sql, cb);
}

function checkColumns(table, cb) {
  const tableName = table.toLowerCase();
  query('SELECT column_name, column_default, data_type FROM information_schema.columns \
  WHERE(table_schema, table_name) = (\'public\', \'' + tableName + '\');',
  function(err, data) {
    const cols = {};
    if (!err) {
      data.forEach(function(index) {
        cols[index.column_name] = index;
        delete index.name;
      });
    }
    cb(err, cols);
  });
}

