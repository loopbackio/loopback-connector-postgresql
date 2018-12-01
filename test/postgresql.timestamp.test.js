// Copyright IBM Corp. 2013,2016. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';
var should = require('should');
var db, PostWithTimestamps;

describe('Timestamps', function() {
  describe('type and precision', function() {
    before(function() {
      db = getDataSource();

      PostWithTimestamps = db.define('PostWithTimestamps', {
        timestampDefault: {
          type: 'Date',
          postgresql: {
            dbDefault: 'now()',
          },
        },
        timestampWithType: {
          type: 'Date',
          postgresql: {
            dataType: 'TIMESTAMP WITH TIME ZONE',
            dbDefault: 'now()',
          },
        },
        timestampWithPrecision: {
          type: 'Date',
          postgresql: {
            dataType: 'TIMESTAMP WITH TIME ZONE',
            dataPrecision: 3,
            dbDefault: 'now()',
          },
        },
        timestampFromJs: {
          type: 'Date',
          postgresql: {
            dataType: 'TIMESTAMP WITH TIME ZONE',
            dataPrecision: 3,
          },
        },
      });
    });

    it('should run migration', function(done) {
      db.automigrate('PostWithTimestamps', function() {
        done();
      });
    });

    it('create instance', function(done) {
      PostWithTimestamps.create(
        {timestampFromJs: new Date()}, function(err, p) {
          should.not.exist(err);
          should.exist(p);
          done();
        });
    });

    it('isActual() should return true', function(done) {
      db.isActual(['PostWithTimestamps'], function(err, ok) {
        if (err) return done(err);
        ok.should.equal(true);
        done();
      });
    });
  });
});
