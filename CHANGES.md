2015-03-01, Version 1.6.1
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
