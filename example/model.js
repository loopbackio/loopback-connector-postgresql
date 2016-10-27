// Copyright IBM Corp. 2013,2014. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0
'use strict';
var SG = require('strong-globalize');
var g = SG();

var DataSource = require('loopback-datasource-juggler').DataSource;

var config = require('rc')('loopback', {dev: {postgresql: {}}}).dev.postgresql;

var ds = new DataSource(require('../'), config);

// Define a account model
var Account = ds.createModel('account', {
  name: String,
  emails: [String],
  age: Number},
    {strict: true});

ds.automigrate('account', function(err) {
// Create two instances
  Account.create({
    name: 'John1',
    emails: ['john@x.com', 'jhon@y.com'],
    age: 30,
  }, function(err, account1) {
    console.log('Account 1: ', account1.toObject());
    Account.create({
      name: 'John2',
      emails: ['john@x.com', 'jhon@y.com'],
      age: 30,
    }, function(err, account2) {
      console.log('Account 2: ', account2.toObject());
      Account.findById(account2.id, function(err, account3) {
        console.log(account3.toObject());
      });
      Account.find({where: {name: 'John1'}, limit: 3}, function(err, accounts) {
        accounts.forEach(function(c) {
          console.log(c.toObject());
        });
      });
    });
  });
});
