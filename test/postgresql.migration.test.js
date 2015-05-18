var should = require('./init.js');
var assert = require('assert');
var Schema = require('loopback-datasource-juggler').Schema;

var db;

describe('migrations', function () {

  before(setup);

  it('should run migration', function (done) {
    db.automigrate('UserDataWithIndexes', function () {
      done();
    });
  });

  it('UserDataWithIndexes should have correct indexes', function (done) {
    getIndexes('UserDataWithIndexes', function (err, indexes) {
      assert.deepEqual(indexes, {

        userdatawithindexes_pkey: {
          type: 'btree',
          primary: true,
          unique: true,
          keys: ['id'],
          order: ['ASC'] },

        userdatawithindexes_email_idx: {
          type: 'btree',
          primary: false,
          unique: false,
          keys: ['email'],
          order: ['ASC'] },

        udwi_index1: {
          type: 'btree',
          primary: false,
          unique: true,
          keys: ['email', 'createdbyadmin'],
          order: ['DESC', 'ASC'] },

        udwi_index2: {
          type: 'hash',
          primary: false,
          unique: false,
          keys: ['email'],
          order: ['ASC'] },

        udwi_index3: {
          type: 'btree',
          primary: false,
          unique: false,
          keys: ['bio', 'email', 'name'],
          order: ['ASC', 'ASC', 'DESC'] },

        udwi_index4: {
          type: 'btree',
          primary: false,
          unique: false,
          keys: ['birthdate', 'bio'],
          order: ['DESC', 'ASC'] },

        udwi_index5: {
          type: 'btree',
          primary: false,
          unique: true,
          keys: ['name', 'email'],
          order: ['DESC', 'ASC'] }
      });
      done();
    });
  });
});

function setup(done) {
  require('./init.js');

  db = getSchema();

  UserDataWithIndexes = db.define('UserDataWithIndexes', {
    email: { type: String, null: false, index: true },
    name: String,
    bio: Schema.Text,
    birthDate: Date,
    pendingPeriod: Number,
    createdByAdmin: Boolean
  }, {
    indexes: {
      udwi_index1: {
        keys: ['email DESC', 'createdByAdmin'],
        options: {
          unique: true
        }
      },
      udwi_index2: {
        keys: 'email',
        type: 'hash'
      },
      udwi_index3: 'bio, email, name DESC',
      udwi_index4: {
        keys: {
          "birthDate": -1,
          "bio": 1
        }
      },
      udwi_index5: {
        keys: {
          "name": -1,
          "email": 0
        },
        options: {
          unique: true
        }
      }
    }
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
    function (err, data) {
      var indexes = {};
      if (!err) {
        // group data by index name
        data.forEach(function (index) {
          indexes[index.name] = index;
          delete index.name;
        });
      }
      cb(err, indexes);
    }
  );
}

function table(model) {
  return db.adapter.table(model);
}

function query(sql, cb) {
  db.adapter.query(sql, cb);
}
