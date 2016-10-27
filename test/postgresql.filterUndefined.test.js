// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';
var should = require('should'),
  assert = require('assert');
var Post, db;

describe('filter undefined fields', function() {
  before(function() {
    db = getDataSource();

    Post = db.define('FilterUndefined', {
      defaultInt: {
        type: 'Number',
        postgresql: {
          dbDefault: '5',
        },
      },
      first: {
        type: 'String',
      },
      second: {
        type: 'Number',
      },
      third: {
        type: 'Number',
      },
    });
  });

  it('should run migration', function(done) {
    db.automigrate('FilterUndefined', function() {
      done();
    });
  });

  it('should insert only default value', function(done) {
    var dflPost = new Post();
    dflPost.save(function(err, p) {
      should.not.exist(err);
      Post.findOne({where: {id: p.id}}, function(err, p) {
        should.not.exist(err);
        p.defaultInt.should.be.equal(5);
        should.not.exist(p.first);
        should.not.exist(p.second);
        should.not.exist(p.third);
      });
      done();
    });
  });

  it('should insert default value and \'third\' field', function(done) {
    var dflPost = new Post();
    dflPost.third = 3;
    dflPost.save(function(err, p) {
      should.not.exist(err);
      Post.findOne({where: {id: p.id}}, function(err, p) {
        should.not.exist(err);
        p.defaultInt.should.be.equal(5);
        should.not.exist(p.first);
        should.not.exist(p.second);
        should.exist(p.third);
        p.third.should.be.equal(3);
      });
      done();
    });
  });

  it('should update \'first\' and \'third\' fields of record with id==2 to predefined values', function(done) {
    Post.findOne({where: {id: 2}}, function(err, p) {
      should.not.exist(err);
      should.exist(p);
      p.id.should.be.equal(2);
      p.updateAttributes({first: 'one', third: 4}, function(err, p) {
        Post.findOne({where: {id: 2}}, function(err, p) {
          should.not.exist(err);
          p.defaultInt.should.be.equal(5);
          p.first.should.be.equal('one');
          should.not.exist(p.second);
          p.third.should.be.equal(4);
          done();
        });
      });
    });
  });

  it('should update \'third\' field of record with id==2 to null value', function(done) {
    Post.findOne({where: {id: 2}}, function(err, p) {
      should.not.exist(err);
      should.exist(p);
      p.id.should.be.equal(2);
      p.updateAttributes({first: 'null in third', third: null}, function(err, p) {
        Post.findOne({where: {id: 2}}, function(err, p) {
          should.not.exist(err);
          p.defaultInt.should.be.equal(5);
          p.first.should.be.equal('null in third');
          should.not.exist(p.second);
          should.not.exist(p.third);
          done();
        });
      });
    });
  });

  it('should insert a value into \'defaultInt\' and \'second\'', function(done) {
    var dflPost = new Post();
    dflPost.second = 2;
    dflPost.defaultInt = 11;
    dflPost.save(function(err, p) {
      should.not.exist(err);
      Post.findOne({where: {id: p.id}}, function(err, p) {
        should.not.exist(err);
        p.defaultInt.should.be.equal(11);
        should.not.exist(p.first);
        should.not.exist(p.third);
                //should.exist(p.third);
        p.second.should.be.equal(2);
        done();
      });
    });
  });

  it('should create an object with a null value in \'first\'', function(done) {
    Post.create({first: null}, function(err, p) {
      should.not.exist(err);
      Post.findOne({where: {id: p.id}}, function(err, p) {
        should.not.exist(err);
        p.defaultInt.should.equal(5);
        should.not.exist(p.first);
        should.not.exist(p.second);
        should.not.exist(p.third);
        done();
      });
    });
  });
});
