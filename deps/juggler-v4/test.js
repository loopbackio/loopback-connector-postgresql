// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

// Skip the tests on Node.js versions not supported by juggler v4
// TODO(bajtos): remove this check when we drop Node.js 6 from our CI matrix
var nodeMajor = +process.versions.node.split('.')[0];
if (nodeMajor < 8) {
  return;
}

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
