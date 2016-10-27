// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';
var should = require('should'),
  assert = require('assert');
var InvalidDefault, Post, db;

describe('database default field values', function() {
  before(function() {
    db = getDataSource();

    Post = db.define('PostWithDbDefaultValue', {
      created: {
        type: 'Date',
        postgresql: {
          dbDefault: 'now()',
        },
      },
      defaultInt: {
        type: 'Number',
        postgresql: {
          dbDefault: '5',
        },
      },
      oneMore: {
        type: 'Number',
      },
    });

    InvalidDefault = db.define('PostWithInvalidDbDefaultValue', {
      created: {
        type: 'Date',
        postgresql: {
          dbDefault: "'5'",
        },
      },
    });
  });

  it('should run migration', function(done) {
    db.automigrate('PostWithDbDefaultValue', function() {
      done();
    });
  });

  it('should report inconsistent default values used', function(done) {
    db.automigrate('PostWithInvalidDbDefaultValue', function(err) {
      should.exists(err);
      done();
    });
  });

  it('should have \'now()\' default value in SQL column definition',
    function(done) {
      var query = 'select column_name, data_type, character_maximum_length,' +
        ' column_default' +
        ' from information_schema.columns' +
        " where table_name = 'postwithdbdefaultvalue'" +
        " and column_name='created'";

      function verifyColumnDefault() {
        db.connector.execute(query, [], function(err, results) {
          assert.equal(results[0].column_default, 'now()');
          done(err);
        });
      }

      if (db.connected) {
        verifyColumnDefault();
      } else {
        db.once('connected', verifyColumnDefault);
      }
    });

  it('should create a record with default value', function(done) {
    Post.create({oneMore: 3}, function(err, p) {
      should.not.exists(err);
      Post.findOne({where: {defaultInt: 5}}, function(err, p) {
        should.not.exists(err);
        should.exists(p);
        p.should.have.property('defaultInt', 5);
        done();
      });
    });
  });

  it('should create a record with custom value', function(done) {
    Post.create({oneMore: 2, defaultInt: 6}, function(err, p) {
      should.not.exists(err);
      Post.findOne({where: {defaultInt: 6}}, function(err, p) {
        should.not.exists(err);
        should.exists(p);
        p.should.have.property('defaultInt', 6);
        done();
      });
    });
  });
});
