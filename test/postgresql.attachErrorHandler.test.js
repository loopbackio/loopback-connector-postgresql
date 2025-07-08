// Copyright IBM Corp. 2013,2025. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';
const sinon = require('sinon');
const assert = require('assert');
const rewire = require('rewire');
const postgresqlModule = rewire('../lib/postgresql');
const attachErrorHandler = postgresqlModule.__get__('attachErrorHandler');

describe('attachErrorHandler', function() {
  let pg;
  beforeEach(function() {
    pg = {
      on: sinon.spy(),
      listenerCount: sinon.stub().returns(0),
    };
  });

  it('should attach custom handler if onError is a function', function() {
    const handler = sinon.spy();
    const settings = {onError: handler};
    attachErrorHandler(settings, pg);
    assert(pg.on.calledOnce, 'pg.on should be called once');
    assert(pg.on.firstCall.args[1] === handler, 'should attach the custom handler');
  });

  it('should not attach handler if already attached', function() {
    pg.listenerCount.returns(1);
    const settings = {onError: 'ignore'};
    attachErrorHandler(settings, pg);
    assert(pg.on.notCalled, 'pg.on should not be called if already attached');
  });

  it('should do nothing if onError is not set', function() {
    const settings = {};
    attachErrorHandler(settings, pg);
    assert(pg.on.notCalled, 'pg.on should not be called if onError is not set');
  });
});
