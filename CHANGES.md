2023-04-13, Version 6.0.3
=========================

 * chore(deps): update dependency eslint to v8.37.0 (renovate[bot])

 * chore(deps): update dependency sinon to v15.0.3 (renovate[bot])

 * chore(deps): update dependency @commitlint/cli to v17.5.1 (renovate[bot])

 * fix(deps): update dependency pg to v8.10.0 (renovate[bot])

 * fix(deps): update dependency loopback-connector to v5.2.2 (renovate[bot])

 * chore(deps): update dependency eslint to v8.36.0 (renovate[bot])

 * chore(deps): update dependency @commitlint/cli to v17.5.0 (renovate[bot])

 * chore(deps): update dependency loopback-datasource-juggler to v4.28.3 (renovate[bot])

 * chore(deps): lock file maintenance (renovate[bot])


2023-02-02, Version 6.0.2
=========================

 * fix: remove deprecated juggler-v3 and juggler-v4 deps folder and test cases (Samarpan Bhattacharya)

 * chore(deps): lock file maintenance (renovate[bot])


2023-01-09, Version 6.0.1
=========================

 * chore(deps): lock file maintenance (renovate[bot])

 * chore(deps): update dependency sinon to v15 (renovate[bot])


2022-11-28, Version 6.0.0
=========================

 * feat(postgresql): add support for multiple insert in one query using createAll() of connector (Samarpan Bhattacharya)

 * chore(deps): lock file maintenance (renovate[bot])

 * chore: add lock-file maintenance (renovate) (Francisco Buceta)

 * fix(deps): update dependency uuid to v9 (renovate[bot])

 * chore(deps): update dependency eslint to v8 (renovate[bot])

 * chore(deps): update dependency mocha to v10 (renovate[bot])

 * chore: sign off renovatebot PR (Francisco Buceta)

 * ci: run commit-lint job only on PR (Francisco Buceta)

 * test: solution to alphabetical order in github actions (Francisco Buceta)

 * ci: disable fast-fail (Francisco Buceta)

 * chore: remove redundant code (Francisco Buceta)

 * chore: order keys and install @commitlint/cli locally (Francisco Buceta)

 * ci: remove test in NodeJS version 12 and add version 18 (Francisco Buceta)


2022-09-29, Version 5.5.2
=========================

 * chore(deps): update actions/setup-node action to v3 (renovate[bot])

 * chore(deps): update actions/checkout action to v3 (renovate[bot])

 * chore(deps): add renovate.json (renovate[bot])

 * fix: crash with blank `url` (Rifa Achrinza)


2022-08-06, Version 5.5.1
=========================

 * fix: improve filter sanitisation (Rifa Achrinza)

 * fix: debug prints the password in plain text (Francisco Buceta)

 * docs: add SECURITY.md (Diana Lau)

 * docs: update coc (Diana Lau)

 * docs: add code of conduct (Diana Lau)


2022-01-13, Version 5.5.0
=========================

 * chore: add Rifa and Mario as codeowners (Diana Lau)

 * fix: disregard empty and/or fields (Abhilash Murthy)

 * feat(operators): add fts match operator (Akshat  Dubey)

 * chore: move repo to loopbackio org (Diana Lau)

 * Defensively drop constraints during migrations (Chris Kobrzak)


2021-05-03, Version 5.4.0
=========================

 * Add on delete options on FK constraints (Quentin Le Bour)

 * ci: switch from Travis to Github Actions (Agnes Lin)

 * Revert "ci: switch travis to github actions" (Miroslav Bajtoš)

 * ci: switch travis to github actions (Francisco Buceta)


2020-12-07, Version 5.3.0
=========================

 * fix: enable pool error handling (Matthew Gabeler-Lee)


2020-11-10, Version 5.2.1
=========================

 * Ensure order of and/or clauses are preserved (Raymond Feng)


2020-10-06, Version 5.2.0
=========================

 * test: clean test for `contains` operator (Miroslav Bajtoš)

 * test: fix array tests to handle List values (Miroslav Bajtoš)

 * docs: improve README organization (Miroslav Bajtoš)

 * feat: adds 'contains' operator for querying arrays (shubhisood)


2020-09-01, Version 5.1.0
=========================

 * update dependencies to latest (Miroslav Bajtoš)

 * fix setup script to not exit calling shell (Miroslav Bajtoš)

 * chore: switch to DCO (Diana Lau)

 * docs: update loopback types link (Agnes Lin)

 * Update .travis.yml (karanssj4)


2020-07-10, Version 5.0.2
=========================

 * fix: fix uuid setup (Agnes Lin)

 * fix: fix example prop def (Agnes Lin)

 * fix: use tip.html (Diana Lau)

 * docs: update readme with more lb4 form (Agnes Lin)


2020-05-06, Version 5.0.1
=========================

 * Fix serialization of arrays of string in update (#428) (Selim Arsever)


2020-04-21, Version 5.0.0
=========================

 * README: add info about LTS policy (Miroslav Bajtoš)

 * Upgrade dev dependencies (Miroslav Bajtoš)

 * [SEMVER-MAJOR] Upgrade `pg` to `8.0` (Miroslav Bajtoš)

 * Update dependencies (Miroslav Bajtoš)

 * Add Node.js 13.x to Travis CI matrix (Miroslav Bajtoš)

 * Drop support for Node.js 8.x (Miroslav Bajtoš)

 * chore: update strong-globalize version (Diana Lau)


2020-03-19, Version 3.9.1
=========================

 * fix readme layout (Agnes Lin)

 * fix README display on the site (Agnes Lin)

 * Exclude 'deps' and '.github' from npm publish (Dominique Emond)

 * fix (Agnes Lin)

 * tests: column should be discovered and mapped (Agnes Lin)

 * fix: `DEFAULT` for null values in where clause (DEEPAK RAJAMOHAN)

 * fix postgres random ci failure (Agnes Lin)


2020-02-25, Version 3.9.0
=========================

 * doc: added readme info on defaultIdSort (Erik de Groot)

 * feat: Added defaultIdSort setting for find method (Erik de Groot)

 * chore: update copyright year (Diana Lau)


2020-01-31, Version 3.8.3
=========================

 * add missing package chalk (Agnes Lin)


2020-01-31, Version 3.8.2
=========================

 * fix schema name with pascal case (Agnes Lin)

 * chore: update CODEOWNERS file (Agnes Lin)

 * fix: allow string type id to be auto-generated (Agnes Lin)


2019-12-09, Version 3.8.1
=========================

 * fix(pool): synchronously release pool connection (Samuel Reed)

 * Handler for with(out) time zone time(stamp) types (Stefano Pirra)

 * chore: improve issue and PR templates (Nora)

 * chore: exclude "good first issues" from stalebot (Miroslav Bajtoš)

 * Fix eslint violations (Miroslav Bajtoš)


2019-09-19, Version 3.8.0
=========================

 * chore: set package-lock=false in .npmrc (Aidan Harbison)

 * Extends test structure to cover fix (Viktor Shanin)

 * Fix Index upgrade (Viktor Shanin)

 * fix: jsdoc (#385) (Janny)

 * Enable Travis CI integration (Miroslav Bajtoš)

 * Manually fix remaining linting violations (Miroslav Bajtoš)

 * Auto-fix linting violations (Miroslav Bajtoš)

 * Update eslint to ^6.0.1 (Miroslav Bajtoš)

 * Update dev-dependencies (Miroslav Bajtoš)


2019-06-26, Version 3.7.0
=========================

 * chore: update dependencies (Diana Lau)

 * Updated dependency module `debug` (noctifer)

 * Drop support for Node.js 6 (Miroslav Bajtoš)

 * chore: update copyrights years (Agnes Lin)

 * Run shared tests from both v3 and v4 of juggler (Miroslav Bajtoš)

 * Move mocha config to test/mocha.opts (Miroslav Bajtoš)

 * Improve error messages in autoupdate test (Miroslav Bajtoš)

 * chore: connector flag for no array type support (biniam)


2019-04-05, Version 3.6.1
=========================

 * Fix cannot create foreignkey (#371) (Hung)

 * Add regression test (jlawrencecfm)

 * Use canonical index name when dropping (jlawrencecfm)

 * add @elv1s as CODEOWNERS (Diana Lau)


2019-02-08, Version 3.6.0
=========================

 * add code comment (elv1s)

 * bug fix for multiple fk (elv1s)

 * Fix timestamp precision force isActual to false (Rafael D. Fito)


2019-01-25, Version 3.5.1
=========================

 * Update CODEOWNERS to reflect the current status (Diana Lau)

 * add support for create and delete foreign key (elv1s)


2018-11-09, Version 3.5.0
=========================

 * Fixed line length to pass lint (ataft)

 * Fix hard-coded "pkName" column in queries (ataft)

 * Modify type 'double precision' to map to float (ataft)


2018-07-16, Version 3.4.0
=========================

 * Drop Node 4 in CI (Diana Lau)

 * [WebFM] cs/pl/ru translation (candytangnb)


2018-05-25, Version 3.3.2
=========================

 * rebase the code to latest master (sahil)

 * typo (Lambdac0re)


2018-04-26, Version 3.3.1
=========================

 * update CODEOWNERS (Diana Lau)

 * linting updates (Tim Jones)

 * add support for UPDATE RETURNING (Tim Jones)


2018-01-12, Version 3.3.0
=========================

 * Revert "4.0.0" (Miroslav Bajtoš)


2018-01-12, Version 4.0.0
=========================

 * Include the SSL Property (ataft)


2017-11-13, Version 3.2.0
=========================

 * chore:update license (Diana Lau)

 * Add basic json query support (Zak Barbuto)

 * update dependencies (Diana Lau)

 * CODEOWNERS: add zbarbuto (Miroslav Bajtoš)


2017-09-26, Version 3.1.0
=========================

 * Upgrade to pg@7. (Samuel Reed)

 * Add test for transaction support in count() (Jürg Lehni)

 * Add stalebot configuration (Kevin Delisle)


2017-08-21, Version 3.0.3
=========================

 * Create Issue and PR Templates (#291) (Sakib Hasan)

 * Allow migration on schema (ssh24)

 * Update translated strings Q3 2017 (Allen Boone)

 * Fix integer data type (ssh24)

 * update translation file (Diana Lau)

 * Override discover model props (ssh24)

 * Add test cases (ssh24)

 * Add CODEOWNER file (Diana Lau)

 * Allow typecasting upon altering prop (ssh24)

 * Add missing require (Zak Barbuto)

 * Revert change to commit and rollback (Zak Barbuto)

 * Revert transaction tracking (Zak Barbuto)

 * Update transaction test (Zak Barbuto)

 * Remove require of Transaction (Zak Barbuto)

 * Avoid connector for transaction tracking (Zak Barbuto)

 * Fix operations directly on model #258 (Zak Barbuto)

 * Add missing return (Zak Barbuto)

 * Add test for #258 (Zak Barbuto)


2017-07-17, Version 3.0.2
=========================

 * Use loopback-connector@^4.2.2 (Kevin Delisle)

 * Allow to debug queries only (ssh24)

 * Fix geo operator (ssh24)

 * Add docs on numeric data type (ssh24)

 * Add execute permission to setup.sh (Raymond Feng)

 * Correct a <td> to </td> closing tag (Marco Galassi)

 * Add connection pool settings doc to README.md (Marco Galassi)

 * clean up postwithdate (ptrblgh)

 * add tests for future regression (ptrblgh)

 * add missing assertion (ptrblgh)

 * add explicit typecasts to pattern matching (ptrblgh)

 * Fix docker setup (#257) (Sakib Hasan)


2017-05-15, Version 3.0.1
=========================

 * Add docker setup (#256) (Sakib Hasan)

 * Allow explicit numeric datatype (#254) (Sakib Hasan)

 * Allow non-id serial properties (#198) (zbarbuto)

 * Revert PR #246 (#248) (Sakib Hasan)

 * Add loopback-connector as peer dependencies (#246) (Russ Tyndall)

 * Fix operations on ended transactions (zbarbuto)

 * dbdefaults: Cleanup InvalidDefault def after test (Kevin Delisle)

 * Reuse the data source to avoid too many clients (Raymond Feng)


2017-03-31, Version 3.0.0
=========================

 * Remove console.log (Raymond Feng)

 * Monkey patch generic-pool to work through errors (Russ Tyndall)

 * Fix the escape char (Raymond Feng)

 * Upgrade to loopback-connector@4.x (Loay)

 * Add checkFieldAndIndex for table status (#228) (Sakib Hasan)

 * Refactor migration methods (ssh24)

 * Fix code style inconsistencies in ilike tests (Alireza Ahmadi)

 * Improve tests for better code style consistency (Alireza Ahmadi)

 * Add tests for pattern matching operators (Alireza Ahmadi)

 * Add ILIKE functionality (Alireza Ahmadi)

 * Refactor discovery models (Loay Gewily)

 * merge in #216 (gregdingle)

 * Fix unit tests (ssh24)

 * Fix linting errors and unnesssary changes. (Diana Lau)

 * remove done() calls in test (gregdingle)

 * Added test. Ran run-tests. (gregdingle)

 * Fix bug where settings for pg-pool were dropped (Greg Dingle)

 * Update README with correct doc links, etc (Amir Jafarian)

 * Add test for bulk transactions (Zak Barbuto)

 * Use pg callback over connection.release (#109) (Zak Barbuto)

 * Use pool.pool.release over pool.release (#109) (Zak Barbuto)

 * Add test env information to README (Zak Barbuto)

 * update README for local postgres setup (Diana Lau)

 * Update postgresql.js (tmclouisluk)

 * Fix bug when using postgresql 8.x (tmclouisluk)

 * Replicate new issue_template from loopback (Siddhi Pai)

 * Replicate issue_template from loopback repo (Siddhi Pai)

 * Update LB connector version (Loay)

 * Use unique param for affectedRows (Loay)

 * Move info from docs into README (#199) (Rand McKinney)

 * Update paid support URL (Siddhi Pai)

 * Start 3.x + drop support for Node v0.10/v0.12 (siddhipai)

 * Drop support for Node v0.10 and v0.12 (Siddhi Pai)

 * Start the development of the next major version (Siddhi Pai)


2016-10-14, Version 2.7.0
=========================

 * Add connectorCapabilities global object (#179) (Nicholas Duffy)

 * Accept PGDATABASE env var in test/init.js (#178) (Simon Ho)

 * Remove unused prefix from test env vars (#176) (Simon Ho)

 * Fix #123: Set default value during autoupdate. (#167) (Samuel Reed)

 * Update translation files - round#2 (#170) (Candy)

 * Add translated files (gunjpan)

 * Update deps to loopback 3.0.0 RC (Miroslav Bajtoš)

 * Use juggler@3 for running tests (Candy)

 * Add eslint infrastructure (Loay)

 * Revert "Add eslint infrastructure" (Loay)

 * Fix CI Failure (Loay)

 * test: accept more env vars on CI (Ryan Graham)

 * test: use 'emptytest' database as default (Ryan Graham)

 * test: seed DB with test schema before running (Ryan Graham)

 * test: separate dbconfig from datasource (Ryan Graham)

 * test: replace tables.sql with full schema dump (Ryan Graham)

 * Refactor (jannyHou)

 * Upgrade version (jannyHou)

 * Globalize discover.js (jannyHou)

 * Update URLs in CONTRIBUTING.md (#150) (Ryan Graham)


2016-06-23, Version 2.6.3
=========================

 * Fix the datasource init (Raymond Feng)


2016-06-23, Version 2.6.2
=========================



2016-06-23, Version 2.6.1
=========================

 * Fix for https://github.com/strongloop/loopback-connector-postgresql/issues/145 (Raymond Feng)


2016-06-22, Version 2.6.0
=========================

 * Upgrade to pg 6.0.0 (Raymond Feng)


2016-06-21, Version 2.5.0
=========================

 * update/insert copyright notices (Ryan Graham)

 * relicense as Artistic-2.0 only (Ryan Graham)

 * Lazy connect when booting from swagger (juehou)

 * Fix typo in SET NOT NULL migration. (Jonas Peter Hyatt)

 * Reverts previous change (jimmylimm)

 * Revert "Moves the default back to VARCHAR(1024) from text" (James Limmer)

 * Moves the default back to VARCHAR(1024) from text (James Limmer)

 * - Adds support for long JSON strings when using `embedOne` from other models. - Converts JSON columns to TEXT for extra length allowance (James Limmer)


2016-02-19, Version 2.4.1
=========================

 * Remove sl-blip from dependencies (Miroslav Bajtoš)

 * Upgrade should to 8.0.2 (Simon Ho)

 * Seperate env variable for test db (cgole)

 * changed USERNAME to USER (cgole)

 * add CI DB server (cgole)


2015-11-07, Version 2.4.0
=========================

 * Refer to licenses with a link (Sam Roberts)

 * Use strongloop conventions for licensing (Sam Roberts)

 * Fix the error handling for createTable (Raymond Feng)

 * Add index implementation (Mark Riedesel)


2015-07-30, Version 2.3.0
=========================

 * Clean up regexp operator tests (Simon Ho)

 * Fix regexp operator test (Simon Ho)

 * Add regexp operator tests (Simon Ho)

 * Add support for RegExp operator (Simon Ho)

 * Clean up buildExpression function (Simon Ho)

 * Remove NOTICE that doesn't apply (Raymond Feng)


2015-07-14, Version 2.2.1
=========================

 * include the length of the column if its a char type. change character varying to varchar to match columnDataType method (Brandon Cooper)


2015-06-12, Version 2.2.0
=========================

 * Make sure UTC is used for date (Raymond Feng)

 * Add a test case for date type (Raymond Feng)


2015-05-18, Version 2.1.0
=========================

 * Update deps (Raymond Feng)

 * Add transaction support (Raymond Feng)


2015-05-13, Version 2.0.0
=========================

 * Update deps (Raymond Feng)

 * Refactor the connector impl to use base sql connector (Raymond Feng)


2015-05-11, Version 1.7.1
=========================

 * Make sure err is reported (Raymond Feng)


2015-04-02, Version 1.7.0
=========================

 * Update deps (Raymond Feng)

 * Return count when updating or deleting models (Simon Ho)

 * Add instructions to running tests section (Simon Ho)


2015-02-28, Version 1.6.1
=========================

 * Fix the conversion of point types due to driver changes (Raymond Feng)


2015-02-20, Version 1.6.0
=========================

 * Upgrade deps (Raymond Feng)


2015-01-28, Version 1.5.0
=========================

 * added more tests to cover changes introduced by "filter undefined fields" commit (Andrey Loukhnov)

 * code formatting settings for multiple IDEs (Andrey Loukhnov)

 * Fix merging issue (Raymond Feng)

 * Typecast lat/lng values to number. (Berkeley Martinez)

 * Add support for GeoPoint type (Raymond Feng)


2015-01-23, Version 1.4.0
=========================

 * Remove the usage of `CREATE SCHEMA IF NOT EXISTS' for compatibility (Raymond Feng)

 * one-line fix for #51 (Andrey Loukhnov)

 * basic tests for PR #53 (Andrey Loukhnov)

 * basic tests for PR #54 (Andrey Loukhnov)

 * provide database column default values via Loopback model description (Andrey Loukhnov)

 * autocreate schema if it does not exist during migration/update (Andrey Loukhnov)

 * Use connection pooling from the driver (Raymond Feng)


2015-01-09, Version 1.3.0
=========================

 * Escape number literals to avoid SQL injection (Raymond Feng)

 * Fix bad CLA URL in CONTRIBUTING.md (Ryan Graham)


2014-12-13, Version 1.2.2
=========================

 * allow false value for BOOLEAN NOT NULL column (slively)

 * use null if param is undefined (Adrian Debbeler)

 * added test for updating false values (Adrian Debbeler)

 * allow false values as params (Adrian Debbeler)


2014-12-05, Version 1.2.1
=========================

 * Update deps (Raymond Feng)

 * Better handle nullable/required (Raymond Feng)


2014-12-02, Version 1.2.0
=========================

 * Bump version (Raymond Feng)

 * Fall back to default upsert implementation (Raymond Feng)


2014-11-27, Version 1.1.5
=========================

 * Add contribution guidelines (Ryan Graham)


2014-09-11, Version 1.1.4
=========================

 * Bump version (Raymond Feng)

 * Make sure errors are reported during autoupdate/automigrate (Raymond Feng)


2014-08-21, Version 1.1.3
=========================

 * Pass connection errors to callback (Miroslav Bajtoš)


2014-08-20, Version 1.1.2
=========================

 * Bump version (Raymond Feng)

 * Add ping() (Raymond Feng)


2014-06-27, Version 1.1.1
=========================

 * Bump versions (Raymond Feng)

 * Tidy up filter.order parsing (Raymond Feng)

 * Update link to doc (Rand McKinney)

 * Fix primary key discovery (Raymond Feng)


2014-06-23, Version 1.1.0
=========================

 * Bump version (Raymond Feng)

 * Remove leading spaces (Raymond Feng)

 * Use base connector and add update support (Raymond Feng)

 * Fix comparison for null/boolean values (Raymond Feng)

 * Update postgresql.js (kesavkolla)


2014-05-29, Version 1.0.4
=========================

 * Bump version (Raymond Feng)

 * Update deps (Raymond Feng)

 * Use pg.js instead of pg to avoid dependency on native client bindings (Samuel Reed)

 * Extract property names in _categorizeProperties() (Raymond Feng)

 * Fix the return of id (Raymond Feng)

 * Modified all create/save/updateOrCreate to support parameterized queries.  This will eliminate the SQL Injection attack and also provide better handling of data types and nulls.  Moved string concatenations to array push to improve performance. (Kesav Kumar Kolla)


2014-05-16, Version 1.0.3
=========================

 * Bump versions (Raymond Feng)

 * Bump version (Raymond Feng)

 * Reconfigure npm test (Raymond Feng)

 * Fix the failing test (Raymond Feng)

 * Fix buildWhere (Raymond Feng)

 * Add support for logical operators (AND/OR) (Raymond Feng)


2014-05-02, Version 1.0.2
=========================

 * Bump version (Raymond Feng)

 * Fix boolean data mapping (Raymond Feng)


2014-04-30, Version 1.0.1
=========================

 * Bump version (Raymond Feng)

 * Support model level schema settings (Raymond Feng)

 * Add link to wiki docs. (Rand McKinney)

 * Clean up to publish API docs (crandmck)

 * Fix docs.json for API docs (crandmck)

 * Allows options to be passed to PG (Raymond Feng)


2014-04-08, Version 1.0.0
=========================

 * First release!
