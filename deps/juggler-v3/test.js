// Copyright IBM Corp. 2013,2016. All Rights Reserved.
// Node module: loopback-connector-mysql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var should = require('../../test/init');
var juggler = require('loopback-datasource-juggler');
var name = require('./package.json').name;

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
