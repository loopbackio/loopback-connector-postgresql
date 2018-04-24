// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';
var debug = require('debug')('loopback:connector:postgresql:transaction');
var uuid = require('uuid');
var Transaction = require('loopback-connector').Transaction;

module.exports = mixinTransaction;

/*!
 * @param {PostgreSQL} PostgreSQL connector class
 */
function mixinTransaction(PostgreSQL) {
  /**
   * Begin a new transaction
   * @param isolationLevel
   * @param cb
   */
  PostgreSQL.prototype.beginTransaction = function(isolationLevel, cb) {
    var connector = this;
    debug('Begin a transaction with isolation level: %s', isolationLevel);
    this.pg.connect(function(err, connection, done) {
      if (err) return cb(err);
      connection.autorelease = done;
      connection.query('BEGIN TRANSACTION ISOLATION LEVEL ' + isolationLevel,
        function(err) {
          if (err) return cb(err);
          var tx = new Transaction(connector, connection);
          tx.txId = uuid.v1();
          connection.txId = tx.txId;
          cb(null, tx);
        });
    });
  };

  /**
   *
   * @param connection
   * @param cb
   */
  PostgreSQL.prototype.commit = function(connection, cb) {
    debug('Commit a transaction');
    var self = this;
    connection.query('COMMIT', function(err) {
      self.releaseConnection(connection, err);
      cb(err);
    });
  };

  /**
   *
   * @param connection
   * @param cb
   */
  PostgreSQL.prototype.rollback = function(connection, cb) {
    debug('Rollback a transaction');
    var self = this;
    connection.query('ROLLBACK', function(err) {
      //if there was a problem rolling back the query
      //something is seriously messed up.  Return the error
      //to the done function to close & remove this client from
      //the pool.  If you leave a client in the pool with an unaborted
      //transaction weird, hard to diagnose problems might happen.
      self.releaseConnection(connection, err);
      cb(err);
    });
    //If we don't set txId to null and wait for the callback
    //of ROLLBACK query to execute, another query can be executed in the
    //same transaction because the callback will be called asynchronously
    if (typeof connection.autorelease === 'function') {
      connection.txId = null;
    }
  };

  PostgreSQL.prototype.releaseConnection = function(connection, err) {
    if (typeof connection.autorelease === 'function') {
      connection.txId = null;
      connection.autorelease(err);
      connection.autorelease = null;
    } else {
      connection.release();
    }
  };
}
