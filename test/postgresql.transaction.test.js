// Copyright IBM Corp. 2015,2019. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';
require('./init.js');
require('should');

const Transaction = require('loopback-connector').Transaction;

let db, Post;

describe('transactions', function() {
  before(function(done) {
    db = global.getDataSource(true);
    Post = db.define('PostTX', {
      title: {type: String, length: 255, index: true},
      content: {type: String},
    });
    db.automigrate('PostTX', done);
  });

  let currentTx;
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
      const options = {};
      if (inTx) {
        options.transaction = currentTx;
      }
      Post.find({where: where}, options,
        function(err, posts) {
          if (err) return done(err);
          posts.length.should.be.eql(count);
          // Make sure both find() and count() behave the same way
          Post.count(where, options,
            function(err, result) {
              if (err) return done(err);
              result.should.be.eql(count);
              done();
            });
        });
    };
  }

  describe('bulk', function() {
    it('should work with bulk transactions', function(done) {
      let completed = 0;
      const concurrent = 20;
      for (let i = 0; i <= concurrent; i++) {
        const post = {title: 'tb' + i, content: 'cb' + i};
        const create = createPostInTx(post);
        Transaction.begin(db.connector, Transaction.SERIALIZABLE,
          function(err, tx) {
            if (err) return done(err);
            Post.create(post, {transaction: tx},
              function(err, p) {
                if (err) {
                  return done(err);
                } else {
                  tx.commit(function(err) {
                    if (err) {
                      return done(err);
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
    const post = {title: 't1', content: 'c1'};
    before(createPostInTx(post));

    it('should not see the uncommitted insert', expectToFindPosts(post, 0));

    it('should see the uncommitted insert from the same transaction',
      expectToFindPosts(post, 1, true));

    it('should commit a transaction', function(done) {
      currentTx.commit(done);
    });

    it('should see the committed insert', expectToFindPosts(post, 1));
  });

  describe('on the model', function() {
    const p1Content = {title: 'p1', content: 'post-a'};
    const p2Content = {title: 'p2', content: 'post-a'};

    before(function(done) {
      Post.create(p1Content, function(err, p1) {
        Post.create(p2Content, function(err, p2) {
          done();
        });
      });
    });

    it('should work when operating directly on the model', function(done) {
      Post.beginTransaction(Transaction.READ_COMMITTED, function(err, tx) {
        Post.updateAll({content: 'post-a'}, {content: 'post-b'}, {transaction: tx},
          function(err, changes) {
            tx.commit(function(err) {
              if (err) {
                return done(err);
              }
              done();
            });
          });
      });
    });
  });

  describe('rollback', function() {
    const post = {title: 't2', content: 'c2'};
    before(createPostInTx(post));

    it('should not see the uncommitted insert', expectToFindPosts(post, 0));

    it('should see the uncommitted insert from the same transaction',
      expectToFindPosts(post, 1, true));

    it('should rollback a transaction', function(done) {
      currentTx.rollback(done);
    });

    it('should not see the rolledback insert', expectToFindPosts(post, 0));
  });

  describe('finished', function() {
    const post = {title: 't2', content: 'c2'};
    beforeEach(createPostInTx(post));

    it('should throw an error when creating in a committed transaction', function(done) {
      currentTx.commit(function(err) {
        if (err) return done(err);
        Post.create({title: 't4', content: 'c4'}, {transaction: currentTx}, function(err, post) {
          if (!err) return done(new Error('should throw error'));
          done();
        });
      });
    });

    it('should throw an error when creating in a rolled back transaction', function(done) {
      currentTx.rollback(function(err) {
        if (err) return done(err);
        Post.create({title: 't4', content: 'c4'}, {transaction: currentTx}, function(err, post) {
          if (!err) return done(new Error('should throw error'));
          done();
        });
      });
    });
  });
});
