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
