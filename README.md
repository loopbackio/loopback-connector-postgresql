## loopback-connector-postgresql

The PostgreSQL Connector module for for [loopback-datasource-juggler](http://docs.strongloop.com/loopback-datasource-juggler/).

## Installation

To simplify the installation of [node-postgresql](https://github.com/strongloop/node-postgresql) module and PostgreSQL instant clients,
we introduce [loopback-postgresql-installer](https://github.com/strongloop/loopback-postgresql-installer) as a dependency which installs
and configures node-postgresql upon `npm install`.

Please note `config.oracleUrl` is the property to define the base URL to download the corresponding node-postgresql bundle for the local
environment.

The bundle file name is `loopback-postgresql-<platform>-<arch>-<version>.tar.gz`. The `version` is the same as the `version` in package.json.

    "dependencies": {
        "loopback-postgresql-installer": "git+ssh://git@github.com:strongloop/loopback-postgresql-installer.git",
             ...
    },
    "config": {
        "oracleUrl": "http://7e9918db41dd01dbf98e-ec15952f71452bc0809d79c86f5751b6.r22.cf1.rackcdn.com"
    },

**The `oracleUrl` can be overridden via LOOPBACK_ORACLE_URL environment variable.**

For MacOSX, the full URL is:

http://7e9918db41dd01dbf98e-ec15952f71452bc0809d79c86f5751b6.r22.cf1.rackcdn.com/loopback-postgresql-MacOSX-x64-0.0.1.tar.gz

`libaio` library is required on Linux systems:

* On Unbuntu/Debian

        ﻿sudo apt-get install libaio1

* On Fedora/CentOS/RHEL

        ﻿sudo yum install libaio


**Please make sure c:\instantclient_12_1\vc10 comes before c:\instantclient_12_1**

## Connector settings

The connector can be configured using the following settings from the data source.

* host or hostname (default to 'localhost'): The host name or ip address of the PostgreSQL DB server
* port (default to 1521): The port number of the PostgreSQL DB server
* username or user: The user name to connect to the PostgreSQL DB
* password: The password
* database (default to 'XE'): The PostgreSQL DB listener name
* debug (default to false)

## Discovering Models

PostgreSQL data sources allow you to discover model definition information from existing postgresql databases. See the following APIs:

 - [dataSource.discoverModelDefinitions([username], fn)](https://github.com/strongloop/loopback#datasourcediscovermodeldefinitionsusername-fn)
 - [dataSource.discoverSchema([owner], name, fn)](https://github.com/strongloop/loopback#datasourcediscoverschemaowner-name-fn)

### Asynchronous APIs for discovery

* PostgreSQL.prototype.discoverModelDefinitions = function (options, cb)
  - options:
    - all: {Boolean} To include tables/views from all schemas/owners
    - owner/schema: {String} The schema/owner name
    - views: {Boolean} To include views
  - cb:
    - Get a list of table/view names, for example:

        {type: 'table', name: 'INVENTORY', owner: 'STRONGLOOP' }
        {type: 'table', name: 'LOCATION', owner: 'STRONGLOOP' }
        {type: 'view', name: 'INVENTORY_VIEW', owner: 'STRONGLOOP' }


* PostgreSQL.prototype.discoverModelProperties = function (table, options, cb)
  - table: {String} The name of a table or view
  - options:
    - owner/schema: {String} The schema/owner name
  - cb:
    - Get a list of model property definitions, for example:

          { owner: 'STRONGLOOP',
            tableName: 'PRODUCT',
            columnName: 'ID',
            dataType: 'VARCHAR2',
            dataLength: 20,
            nullable: 'N',
            type: 'String' }
          { owner: 'STRONGLOOP',
            tableName: 'PRODUCT',
            columnName: 'NAME',
            dataType: 'VARCHAR2',
            dataLength: 64,
            nullable: 'Y',
            type: 'String' }


* PostgreSQL.prototype.discoverPrimaryKeys= function(table, options, cb)
  - table: {String} The name of a table or view
  - options:
    - owner/schema: {String} The schema/owner name
  - cb:
    - Get a list of primary key definitions, for example:

        { owner: 'STRONGLOOP',
          tableName: 'INVENTORY',
          columnName: 'PRODUCT_ID',
          keySeq: 1,
          pkName: 'ID_PK' }
        { owner: 'STRONGLOOP',
          tableName: 'INVENTORY',
          columnName: 'LOCATION_ID',
          keySeq: 2,
          pkName: 'ID_PK' }

* PostgreSQL.prototype.discoverForeignKeys= function(table, options, cb)
  - table: {String} The name of a table or view
  - options:
    - owner/schema: {String} The schema/owner name
  - cb:
    - Get a list of foreign key definitions, for example:

        { fkOwner: 'STRONGLOOP',
          fkName: 'PRODUCT_FK',
          fkTableName: 'INVENTORY',
          fkColumnName: 'PRODUCT_ID',
          keySeq: 1,
          pkOwner: 'STRONGLOOP',
          pkName: 'PRODUCT_PK',
          pkTableName: 'PRODUCT',
          pkColumnName: 'ID' }


* PostgreSQL.prototype.discoverExportedForeignKeys= function(table, options, cb)

  - table: {String} The name of a table or view
  - options:
    - owner/schema: {String} The schema/owner name
  - cb:
    - Get a list of foreign key definitions that reference the primary key of the given table, for example:

        { fkName: 'PRODUCT_FK',
          fkOwner: 'STRONGLOOP',
          fkTableName: 'INVENTORY',
          fkColumnName: 'PRODUCT_ID',
          keySeq: 1,
          pkName: 'PRODUCT_PK',
          pkOwner: 'STRONGLOOP',
          pkTableName: 'PRODUCT',
          pkColumnName: 'ID' }


### Synchronous APIs for discovery

* PostgreSQL.prototype.discoverModelDefinitionsSync = function (options)
* PostgreSQL.prototype.discoverModelPropertiesSync = function (table, options)
* PostgreSQL.prototype.discoverPrimaryKeysSync= function(table, options)
* PostgreSQL.prototype.discoverForeignKeysSync= function(table, options)
* PostgreSQL.prototype.discoverExportedForeignKeysSync= function(table, options)

### Discover/build/try the models

The following example uses `discoverAndBuildModels` to discover, build and try the models:

    dataSource.discoverAndBuildModels('INVENTORY', { owner: 'STRONGLOOP', visited: {}, associations: true},
         function (err, models) {
            // Show records from the models
            for(var m in models) {
                models[m].all(show);
            };

            // Find one record for inventory
            models.Inventory.findOne({}, function(err, inv) {
                console.log("\nInventory: ", inv);
                // Follow the foreign key to navigate to the product
                inv.product(function(err, prod) {
                    console.log("\nProduct: ", prod);
                    console.log("\n ------------- ");
                });
        });
    }

## Model definition for PostgreSQL

The model definition consists of the following properties:

* name: Name of the model, by default, it's the camel case of the table
* options: Model level operations and mapping to PostgreSQL schema/table
* properties: Property definitions, including mapping to PostgreSQL column

        {
          "name":"Inventory",
          "options":{
            "idInjection":false,
            "postgresql":{
              "schema":"STRONGLOOP",
              "table":"INVENTORY"
            }
          },
          "properties":{
            "productId":{
              "type":"String",
              "required":true,
              "length":20,
              "id":1,
              "postgresql":{
                "columnName":"PRODUCT_ID",
                "dataType":"VARCHAR2",
                "dataLength":20,
                "nullable":"N"
              }
            },
            "locationId":{
              "type":"String",
              "required":true,
              "length":20,
              "id":2,
              "postgresql":{
                "columnName":"LOCATION_ID",
                "dataType":"VARCHAR2",
                "dataLength":20,
                "nullable":"N"
              }
            },
            "available":{
              "type":"Number",
              "required":false,
              "length":22,
              "postgresql":{
                "columnName":"AVAILABLE",
                "dataType":"NUMBER",
                "dataLength":22,
                "nullable":"Y"
              }
            },
            "total":{
              "type":"Number",
              "required":false,
              "length":22,
              "postgresql":{
                "columnName":"TOTAL",
                "dataType":"NUMBER",
                "dataLength":22,
                "nullable":"Y"
              }
            }
          }
        }


## Type Mapping

 - Number
 - Boolean
 - String
 - null
 - Object
 - undefined
 - Date
 - Array
 - Buffer

### JSON to PostgreSQL Types

* String|JSON|Text|default: VARCHAR2, default length is 1024
* Number: NUMBER
* Date: DATE
* Timestamp: TIMESTAMP(3)
* Boolean: CHAR(1)

### PostgreSQL Types to JSON

* CHAR(1): Boolean
* CHAR(n), VARCHAR, VARCHAR2, LONG VARCHAR, NCHAR, NVARCHAR2: String
* LONG, BLOB, CLOB, NCLOB: Buffer
* NUMBER, INTEGER, DECIMAL, DOUBLE, FLOAT, BIGINT, SMALLINT, REAL, NUMERIC, BINARY_FLOAT, BINARY_DOUBLE, UROWID, ROWID: Number
* DATE, TIMESTAMP: Date
* default: String

## Destroying Models

Destroying models may result in errors due to foreign key integrity. Make sure to delete any related models first before calling delete on model's with relationships.

## Auto Migrate / Auto Update

After making changes to your model properties you must call `Model.automigrate()` or `Model.autoupdate()`. Only call `Model.automigrate()` on new models
as it will drop existing tables.

LoopBack PostgreSQL connector creates the following schema objects for a given model:

* A table, for example, PRODUCT
* A sequence for the primary key, for example, PRODUCT_ID_SEQUENCE
* A trigger to generate the primary key from the sequnce, for example, PRODUCT_ID_TRIGGER


## Running examples

* example/app.js: Demonstrate the asynchronous discovery
* example/app-sync.js: Demonstrate the synchronous discovery

## Running tests

    npm test
