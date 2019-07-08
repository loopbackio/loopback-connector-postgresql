// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

const should = require('../../test/init');
const juggler = require('loopback-datasource-juggler');
const name = require('./package.json').name;

describe(name, function() {
  before(function() {
    return global.resetDataSourceClass(juggler.DataSource);
  });

  after(function() {
    return global.resetDataSourceClass();
  });

  require('loopback-datasource-juggler/test/common.batch.js');
  require('loopback-datasource-juggler/test/include.test.js');

  /* TODO: run persistence-hooks test suite too
  var testHooks = require('loopback-datasource-juggler/test/persistence-hooks.suite.js');
  testHooks(global.getDataSource(), should, {
    replaceOrCreateReportsNewInstance: false,
  });
  */
});
