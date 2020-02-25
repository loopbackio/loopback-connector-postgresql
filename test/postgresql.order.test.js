// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

require('./init');
const should = require('should');
const async = require('async');

let db,
  PostWithDefaultIdSort,
  PostWithDisabledDefaultIdSort,
  PostWithNumericDefaultIdSort,
  PostWithNumericStringDefaultIdSort;

describe('Order settings', function() {
  before(function() {
    db = global.getSchema();
  });

  before(function(done) {
    PostWithDefaultIdSort = db.define(
      'PostWithDefaultIdSort',
      {
        id: {type: Number, id: true},
        title: {type: String, length: 255, index: true},
        content: {type: String},
      },
      {
        defaultIdSort: true,
      },
    );

    PostWithDisabledDefaultIdSort = db.define(
      'PostWithDisabledDefaultIdSort',
      {
        id: {type: Number, id: true},
        title: {type: String, length: 255, index: true},
        content: {type: String},
      },
      {
        defaultIdSort: false,
      },
    );

    PostWithNumericDefaultIdSort = db.define(
      'PostWithNumericDefaultIdSort',
      {
        id: {type: Number, id: true},
        title: {type: String, length: 255, index: true},
        content: {type: String},
      },
      {
        defaultIdSort: 'numericIdOnly',
      },
    );

    PostWithNumericStringDefaultIdSort = db.define(
      'PostWithNumericStringDefaultIdSort',
      {
        id: {type: String, id: true},
        title: {type: String, length: 255, index: true},
        content: {type: String},
      },
      {
        defaultIdSort: 'numericIdOnly',
      },
    );

    done();
  });

  before(function(done) {
    db.automigrate([
      'PostWithDefaultIdSort',
      'PostWithDisabledDefaultIdSort',
      'PostWithNumericDefaultIdSort',
      'PostWithNumericStringDefaultIdSort'],
    done);
  });

  after(function(done) {
    async.parallel([
      cb => PostWithDefaultIdSort.destroyAll(cb),
      cb => PostWithDisabledDefaultIdSort.destroyAll(cb),
      cb => PostWithNumericDefaultIdSort.destroyAll(cb),
      cb => PostWithNumericStringDefaultIdSort.destroyAll(cb),
    ], done);
  });

  it('builds base query', function(done) {
    const res = db.connector.buildSelect('PostWithDefaultIdSort', {});
    const sql = res.sql;

    sql.should.be.equal('SELECT "id","title","content" FROM "public"."postwithdefaultidsort" ORDER BY "id"');
    done();
  });

  it('builds non-ordering base query', function(done) {
    const res = db.connector.buildSelect('PostWithDisabledDefaultIdSort', {});
    const sql = res.sql;

    sql.should.be.equal('SELECT "id","title","content" FROM "public"."postwithdisableddefaultidsort"');
    done();
  });

  it('builds ordering query based on numericIdOnly setting', function(done) {
    const res = db.connector.buildSelect('PostWithNumericDefaultIdSort', {});
    const sql = res.sql;

    sql.should.be.equal('SELECT "id","title","content" FROM "public"."postwithnumericdefaultidsort" ORDER BY "id"');
    done();
  });

  it('builds non-ordering query based on numericIdOnly setting', function(done) {
    const res = db.connector.buildSelect('PostWithNumericStringDefaultIdSort', {});
    const sql = res.sql;

    sql.should.be.equal('SELECT "id","title","content" FROM "public"."postwithnumericstringdefaultidsort"');
    done();
  });

  it('should return results ordered by id',
    function(done) {
      PostWithDefaultIdSort.create({id: 5, title: 'c', content: 'CCC'}, function(err, post) {
        PostWithDefaultIdSort.create({id: 4, title: 'd', content: 'DDD'}, function(err, post) {
          PostWithDefaultIdSort.find({}, function(err, posts) {
            should.not.exist(err);
            posts.length.should.be.equal(2);
            posts[0].id.should.be.equal(4);

            PostWithDefaultIdSort.find({limit: 1, offset: 0}, function(err, posts) {
              should.not.exist(err);
              posts.length.should.be.equal(1);
              posts[0].id.should.be.equal(4);

              PostWithDefaultIdSort.find({limit: 1, offset: 1}, function(err, posts) {
                should.not.exist(err);
                posts.length.should.be.equal(1);
                posts[0].id.should.be.equal(5);
                done();
              });
            });
          });
        });
      });
    });

  it('should return unordered results',
    function(done) {
      PostWithDisabledDefaultIdSort.create({id: 2, title: 'c', content: 'CCC'}, function(err, post) {
        PostWithDisabledDefaultIdSort.create({id: 1, title: 'd', content: 'DDD'}, function(err, post) {
          PostWithDisabledDefaultIdSort.find({}, function(err, posts) {
            should.not.exist(err);
            posts.length.should.be.equal(2);
            posts[0].id.should.be.equal(2);

            PostWithDisabledDefaultIdSort.find({limit: 1, offset: 0}, function(err, posts) {
              should.not.exist(err);
              posts.length.should.be.equal(1);
              posts[0].id.should.be.equal(2);

              PostWithDisabledDefaultIdSort.find({limit: 1, offset: 1}, function(err, posts) {
                should.not.exist(err);
                posts.length.should.be.equal(1);
                posts[0].id.should.be.equal(1);
                done();
              });
            });
          });
        });
      });
    });

  it('Should return ordered results by numeric id by default',
    function(done) {
      PostWithNumericDefaultIdSort.create({id: 12, title: 'c', content: 'CCC'}, function(err, post) {
        PostWithNumericDefaultIdSort.create({id: 11, title: 'd', content: 'DDD'}, function(err, post) {
          PostWithNumericDefaultIdSort.find({}, function(err, posts) {
            should.not.exist(err);
            posts.length.should.be.equal(2);
            posts[0].id.should.be.equal(11);

            PostWithNumericDefaultIdSort.find({limit: 1, offset: 0}, function(err, posts) {
              should.not.exist(err);
              posts.length.should.be.equal(1);
              posts[0].id.should.be.equal(11);

              PostWithNumericDefaultIdSort.find({limit: 1, offset: 1}, function(err, posts) {
                should.not.exist(err);
                posts.length.should.be.equal(1);
                posts[0].id.should.be.equal(12);
                done();
              });
            });
          });
        });
      });
    });

  it('should return unordered results because of string type id',
    function(done) {
      PostWithNumericStringDefaultIdSort.create({id: 'b', title: 'c', content: 'CCC'}, function(err, post) {
        PostWithNumericStringDefaultIdSort.create({id: 'a', title: 'd', content: 'DDD'}, function(err, post) {
          PostWithNumericStringDefaultIdSort.find({}, function(err, posts) {
            should.not.exist(err);
            posts.length.should.be.equal(2);
            posts[0].id.should.be.equal('b');

            PostWithNumericStringDefaultIdSort.find({limit: 1, offset: 0}, function(err, posts) {
              should.not.exist(err);
              posts.length.should.be.equal(1);
              posts[0].id.should.be.equal('b');

              PostWithNumericStringDefaultIdSort.find({limit: 1, offset: 1}, function(err, posts) {
                should.not.exist(err);
                posts.length.should.be.equal(1);
                posts[0].id.should.be.equal('a');
                done();
              });
            });
          });
        });
      });
    });
});
