// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';
require('./init.js');
require('should');

var Transaction = require('loopback-connector').Transaction;

var db, Post;

describe('transactions', function() {
  before(function(done) {
    db = getDataSource(true);
    Post = db.define('PostTX', {
      title: {type: String, length: 255, index: true},
      content: {type: String},
    });
    db.automigrate('PostTX', done);
  });

  var currentTx;
  // Return an async function to start a transaction and create a post
  function createPostInTx(post) {
    return function(done) {
      Transaction.begin(db.connector, Transaction.SERIALIZABLE,
        function(err, tx) {
          if (err) return done(err);
          currentTx = tx;
          Post.create(post, {transaction: tx},
            function(err, p) {
              if (err) {
                done(err);
              } else {
                done();
              }
            });
        });
    };
  }

  // Return an async function to find matching posts and assert number of
  // records to equal to the count
  function expectToFindPosts(where, count, inTx) {
    return function(done) {
      var options = {};
      if (inTx) {
        options.transaction = currentTx;
      }
      Post.find({where: where}, options,
        function(err, posts) {
          if (err) return done(err);
          posts.length.should.be.eql(count);
          done();
        });
    };
  }

  describe('bulk', function() {
    it('should work with bulk transactions', function(done) {
      var completed = 0;
      var concurrent = 20;
      for (var i = 0; i <= concurrent; i++) {
        var post = {title: 'tb' + i, content: 'cb' + i};
        var create = createPostInTx(post);
        Transaction.begin(db.connector, Transaction.SERIALIZABLE,
          function(err, tx) {
            if (err) return done(err);
            Post.create(post, {transaction: tx},
              function(err, p) {
                if (err) {
                  done(err);
                } else {
                  tx.commit(function(err) {
                    if (err) {
                      done(err);
                    }
                    completed++;
                    checkResults();
                  });
                }
              });
          });
      }

      function checkResults() {
        if (completed === concurrent) {
          done();
        }
      }
    });
  });

  describe('commit', function() {
    var post = {title: 't1', content: 'c1'};
    before(createPostInTx(post));

    it('should not see the uncommitted insert', expectToFindPosts(post, 0));

    it('should see the uncommitted insert from the same transaction',
      expectToFindPosts(post, 1, true));

    it('should commit a transaction', function(done) {
      currentTx.commit(done);
    });

    it('should see the committed insert', expectToFindPosts(post, 1));
  });

  describe('rollback', function() {
    var post = {title: 't2', content: 'c2'};
    before(createPostInTx(post));

    it('should not see the uncommitted insert', expectToFindPosts(post, 0));

    it('should see the uncommitted insert from the same transaction',
      expectToFindPosts(post, 1, true));

    it('should rollback a transaction', function(done) {
      currentTx.rollback(done);
    });

    it('should not see the rolledback insert', expectToFindPosts(post, 0));
  });
});
