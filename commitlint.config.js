// Copyright IBM Corp. 2021. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

module.exports = {
  extends: [
    '@commitlint/config-conventional',
  ],
  rules: {
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [0, 'always'],
    'signed-off-by': [2, 'always', 'Signed-off-by:'],
  },
};
