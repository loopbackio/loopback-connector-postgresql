// Copyright IBM Corp. 2014,2019. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';
process.env.NODE_ENV = 'test';
require('should');
const expect = require('chai').expect;
const async = require('async');
const chai = require('chai');
const chaiSubset = require('chai-subset');
chai.use(chaiSubset);

let db;

before(function() {
  db = global.getSchema();
});

describe('Mapping models', function() {
  it('should return encrypted data by filter', function(done) {
    const schema =
      {
        'name': 'EncryptedData',
        'options': {
          'idInjection': false,
          'postgresql': {
            'schema': 'public', 'table': 'encrypted_data',
          },
        },
        'properties': {
          'id': {
            'type': 'String',
            'id': true,
          },
          'data': {
            'type': 'String',
          },
        },
        'mixins': {
          'Encryption': {
            'fields': [
              'data',
            ],
          },
        },
      };

    const EncryptedData = db.createModel(schema.name, schema.properties, schema.options);
    EncryptedData.settings.mixins = schema.mixins;

    db.automigrate('EncryptedData', function(err) {
      if (err) console.error({err});
      EncryptedData.create({
        id: '2',
        data: '1c93722e6cf53f93dd4eb15a18444dc3e910fded18239db612794059af1fa5e8',
      }, function(err, encryptedData) {
        if (err) console.log({err2: err});
        async.series([
          function(callback) {
            EncryptedData.findOne({where: {data: {ilike: '%test%'}}}, function(err, retreivedData) {
              if (err) console.error({err111: err});
              expect(retreivedData).to.containSubset(encryptedData);
              callback(null, retreivedData);
            });
          },
          function(callback) {
            EncryptedData.find({where: {data: {ilike: '%not found%'}}}, function(err, retreivedData) {
              if (err) console.error({err111: err});
              expect(retreivedData.length).to.equal(0);
              callback(null, retreivedData);
            });
          },
        ], done);
      });
    });
  });
});
