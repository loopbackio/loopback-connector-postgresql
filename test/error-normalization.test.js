'use strict';
require('./init.js');
const should = require('should');

let db, ErrorModel;
const normalizePostgreSQLError = require('../lib/normalize-error.js');

describe('postgresql error normalization unit tests', function() {
  it('normalizes unique constraint violations (23505)', function() {
    const rawErr = new Error('duplicate key value violates unique constraint');
    rawErr.code = '23505';

    const normalized = normalizePostgreSQLError(rawErr);
    normalized.should.have.property('code', 'UNIQUE_CONSTRAINT_VIOLATION');
  });

  it('normalizes undefined table errors (42P01)', function() {
    const rawErr = new Error('relation "foo" does not exist');
    rawErr.code = '42P01';

    const normalized = normalizePostgreSQLError(rawErr);
    normalized.should.have.property('code', 'TABLE_NOT_FOUND');
  });

  it('normalizes undefined column errors (42703)', function() {
    const rawErr = new Error('column "non_existent" does not exist');
    rawErr.code = '42703';

    const normalized = normalizePostgreSQLError(rawErr);
    normalized.should.have.property('code', 'COLUMN_NOT_FOUND');
  });

  it('normalizes syntax errors (42601)', function() {
    const rawErr = new Error('syntax error at or near "SELCT"');
    rawErr.code = '42601';

    const normalized = normalizePostgreSQLError(rawErr);
    normalized.should.have.property('code', 'SYNTAX_ERROR');
  });

  it('normalizes query timeout errors (57014)', function() {
    const rawErr = new Error('canceling statement due to statement timeout');
    rawErr.code = '57014';

    const normalized = normalizePostgreSQLError(rawErr);
    normalized.should.have.property('code', 'QUERY_TIMEOUT');
  });

  it('normalizes lock conflict and deadlock errors (40P01, 40001, 55P03)', function() {
    ['40P01', '40001', '55P03'].forEach(code => {
      const rawErr = new Error('lock conflict / deadlock');
      rawErr.code = code;
      const normalized = normalizePostgreSQLError(rawErr);
      normalized.should.have.property('code', 'LOCK_CONFLICT');
    });
  });

  it('normalizes not-null violations (23502)', function() {
    const rawErr = new Error('null value in column violates not-null constraint');
    rawErr.code = '23502';

    const normalized = normalizePostgreSQLError(rawErr);
    normalized.should.have.property('code', 'NOT_NULL_VIOLATION');
  });
});

describe('postgresql error normalization', function() {
  before(function(done) {
    db = global.getDataSource(true);
    // Explicitly configure unique index so automigrate creates the constraint in Postgres
    ErrorModel = db.define('ErrorModel', {
      name: {type: String, index: {unique: true}, required: true},
    });
    db.automigrate('ErrorModel', done);
  });

  beforeEach(function(done) {
    ErrorModel.destroyAll(done);
  });

  it('normalizes unique constraint violations (23505 -> UNIQUE_CONSTRAINT_VIOLATION)', function(done) {
    ErrorModel.create({name: 'test-unique'}, function(err) {
      if (err) return done(err);
      // Attempt to insert duplicate record
      ErrorModel.create({name: 'test-unique'}, function(err) {
        should.exist(err);
        err.should.have.property('code', 'UNIQUE_CONSTRAINT_VIOLATION');
        done();
      });
    });
  });

  it('normalizes table not found errors (42P01 -> TABLE_NOT_FOUND)', function(done) {
    db.connector.executeSQL(
      'SELECT * FROM "non_existent_table_xyz"',
      [],
      {},
      function(err, results) {
        should.exist(err);
        err.should.have.property('code', 'TABLE_NOT_FOUND');
        done();
      },
    );
  });

  it('normalizes column not found errors (42703 -> COLUMN_NOT_FOUND)', function(done) {
    db.connector.executeSQL(
      'SELECT "non_existent_column" FROM "errormodel"',
      [],
      {},
      function(err) {
        should.exist(err);
        err.should.have.property('code', 'COLUMN_NOT_FOUND');
        done();
      },
    );
  });

  it('normalizes syntax errors (42601 -> SYNTAX_ERROR)', function(done) {
    db.connector.executeSQL(
      'SELCT * FROM "errormodel"',
      [],
      {},
      function(err) {
        should.exist(err);
        err.should.have.property('code', 'SYNTAX_ERROR');
        done();
      },
    );
  });

  it('normalizes not-null constraint violations (23502 -> NOT_NULL_VIOLATION)', function(done) {
    // Bypass model validation by executing raw SQL or using connector directly
    db.connector.executeSQL(
      'INSERT INTO "errormodel" ("name") VALUES ($1)',
      [null],
      {},
      function(err) {
        should.exist(err);
        err.should.have.property('code', 'NOT_NULL_VIOLATION');
        done();
      },
    );
  });

  it('normalizes inactive transaction or connection errors at the connector level', function(done) {
    const Transaction = require('loopback-connector').Transaction;
    Transaction.begin(db.connector, function(err, tx) {
      if (err) return done(err);

      // Force commit the transaction so its connection is cleared
      tx.commit(function(err) {
        if (err) return done(err);

        // Call executeSQL directly to exercise the connector's internal check
        db.connector.executeSQL('SELECT 1', [], {transaction: tx}, function(err) {
          should.exist(err);
          err.should.have.property('code', 'TRANSACTION_NOT_ACTIVE');
          done();
        });
      });
    });
  });
});
