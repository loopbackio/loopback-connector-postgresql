/*!
 * PostgreSQL connector for LoopBack
 */
var postgresql = require('pg');
var SqlConnector = require('loopback-connector').SqlConnector;
var ParameterizedSQL = SqlConnector.ParameterizedSQL;
var util = require('util');
var debug = require('debug')('loopback:connector:postgresql');

/**
 *
 * Initialize the PostgreSQL connector against the given data source
 *
 * @param {DataSource} dataSource The loopback-datasource-juggler dataSource
 * @callback {Function} [callback] The callback function
 * @param {String|Error} err The error string or object
 * @header PostgreSQL.initialize(dataSource, [callback])
 */
exports.initialize = function initializeDataSource(dataSource, callback) {
  if (!postgresql) {
    return;
  }

  var dbSettings = dataSource.settings || {};
  dbSettings.host = dbSettings.host || dbSettings.hostname || 'localhost';
  dbSettings.user = dbSettings.user || dbSettings.username;
  dbSettings.debug = dbSettings.debug || debug.enabled;

  dataSource.connector = new PostgreSQL(postgresql, dbSettings);
  dataSource.connector.dataSource = dataSource;

  if (callback) {
    dataSource.connecting = true;
    dataSource.connector.connect(callback);
  }

};

/**
 * PostgreSQL connector constructor
 *
 * @param {PostgreSQL} postgresql PostgreSQL node.js binding
 * @options {Object} settings An object for the data source settings.
 * See [node-postgres documentation](https://github.com/brianc/node-postgres/wiki/Client#parameters).
 * @property {String} url URL to the database, such as 'postgres://test:mypassword@localhost:5432/devdb'.
 * Other parameters can be defined as query string of the url
 * @property {String} hostname The host name or ip address of the PostgreSQL DB server
 * @property {Number} port The port number of the PostgreSQL DB Server
 * @property {String} user The user name
 * @property {String} password The password
 * @property {String} database The database name
 * @property {Boolean} ssl Whether to try SSL/TLS to connect to server
 *
 * @constructor
 */
function PostgreSQL(postgresql, settings) {
  // this.name = 'postgresql';
  // this._models = {};
  // this.settings = settings;
  this.constructor.super_.call(this, 'postgresql', settings);
  this.clientConfig = settings.url || settings;
  this.pg = postgresql;
  this.settings = settings;
  if (settings.debug) {
    debug('Settings %j', settings);
  }
}

// Inherit from loopback-datasource-juggler BaseSQL
util.inherits(PostgreSQL, SqlConnector);

PostgreSQL.prototype.debug = function() {
  if (this.settings.debug) {
    debug.apply(debug, arguments);
  }
};

PostgreSQL.prototype.getDefaultSchemaName = function() {
  return 'public';
};

/**
 * Connect to PostgreSQL
 * @callback {Function} [callback] The callback after the connection is established
 */
PostgreSQL.prototype.connect = function(callback) {
  var self = this;
  self.pg.connect(self.clientConfig, function(err, client, done) {
    self.client = client;
    process.nextTick(done);
    callback && callback(err, client);
  });
};

/**
 * Execute the sql statement
 *
 * @param {String} sql The SQL statement
 * @param {String[]} params The parameter values for the SQL statement
 * @param {Object} [options] Options object
 * @callback {Function} [callback] The callback after the SQL statement is executed
 * @param {String|Error} err The error string or object
 * @param {Object[]) data The result from the SQL
 */
PostgreSQL.prototype.executeSQL = function(sql, params, options, callback) {
  var self = this;

  if (self.settings.debug) {
    if (params && params.length > 0) {
      self.debug('SQL: %s\nParameters: %j', sql, params);
    } else {
      self.debug('SQL: %s', sql);
    }
  }

  function executeWithConnection(connection, done) {
    connection.query(sql, params, function(err, data) {
      // if(err) console.error(err);
      if (err && self.settings.debug) {
        self.debug(err);
      }
      if (self.settings.debug && data) self.debug("%j", data);
      process.nextTick(function() {
        done(err);
      });
      var result = null;
      if (data) {
        switch (data.command) {
          case 'DELETE':
          case 'UPDATE':
            result = {count: data.rowCount};
            break;
          default:
            result = data.rows;
        }
      }
      callback(err ? err : null, result);
    });
  }

  var transaction = options.transaction;
  if (transaction && transaction.connection &&
    transaction.connector === this) {
    debug('Execute SQL within a transaction');
    executeWithConnection(transaction.connection,
      transaction.connection.release);
  } else {
    self.pg.connect(self.clientConfig, function(err, connection, done) {
      if (err) return callback(err);
      executeWithConnection(connection, done);
    });
  }
};

PostgreSQL.prototype.buildInsertReturning = function(model, data, options) {
  var idColumnNames = [];
  var idNames = this.idNames(model);
  for (var i = 0, n = idNames.length; i < n; i++) {
    idColumnNames.push(this.columnEscaped(model, idNames[i]));
  }
  return 'RETURNING ' + idColumnNames.join(',');
};

PostgreSQL.prototype.buildInsertDefaultValues = function(model, data, options) {
  return 'DEFAULT VALUES';
};

// FIXME: [rfeng] The native implementation of upsert only works with
// postgresql 9.1 or later as it requres writable CTE
// See https://github.com/strongloop/loopback-connector-postgresql/issues/27
/**
 * Update if the model instance exists with the same id or create a new instance
 *
 * @param {String} model The model name
 * @param {Object} data The model instance data
 * @callback {Function} [callback] The callback function
 * @param {String|Error} err The error string or object
 * @param {Object} The updated model instance
 */
/*
 PostgreSQL.prototype.updateOrCreate = function (model, data, callback) {
 var self = this;
 data = self.mapToDB(model, data);
 var props = self._categorizeProperties(model, data);
 var idColumns = props.ids.map(function(key) {
 return self.columnEscaped(model, key); }
 );
 var nonIdsInData = props.nonIdsInData;
 var query = [];
 query.push('WITH update_outcome AS (UPDATE ', self.tableEscaped(model), ' SET ');
 query.push(self.toFields(model, data, false));
 query.push(' WHERE ');
 query.push(idColumns.map(function (key, i) {
 return ((i > 0) ? ' AND ' : ' ') + key + '=$' + (nonIdsInData.length + i + 1);
 }).join(','));
 query.push(' RETURNING ', idColumns.join(','), ')');
 query.push(', insert_outcome AS (INSERT INTO ', self.tableEscaped(model), ' ');
 query.push(self.toFields(model, data, true));
 query.push(' WHERE NOT EXISTS (SELECT * FROM update_outcome) RETURNING ', idColumns.join(','), ')');
 query.push(' SELECT * FROM update_outcome UNION ALL SELECT * FROM insert_outcome');
 var queryParams = [];
 nonIdsInData.forEach(function(key) {
 queryParams.push(data[key]);
 });
 props.ids.forEach(function(key) {
 queryParams.push(data[key] || null);
 });
 var idColName = self.idColumn(model);
 self.query(query.join(''), queryParams, function(err, info) {
 if (err) {
 return callback(err);
 }
 var idValue = null;
 if (info && info[0]) {
 idValue = info[0][idColName];
 }
 callback(err, idValue);
 });
 };
 */

PostgreSQL.prototype.fromColumnValue = function(prop, val) {
  if (val == null) {
    return val;
  }
  var type = prop.type && prop.type.name;
  if (prop && type === 'Boolean') {
    if (typeof val === 'boolean') {
      return val;
    } else {
      return (val === 'Y' || val === 'y' || val === 'T' ||
      val === 't' || val === '1');
    }
  } else if (prop && type === 'GeoPoint' || type === 'Point') {
    if (typeof val === 'string') {
      // The point format is (x,y)
      var point = val.split(/[\(\)\s,]+/).filter(Boolean);
      return {
        lat: +point[0],
        lng: +point[1]
      };
    } else if (typeof val === 'object' && val !== null) {
      // Now pg driver converts point to {x: lng, y: lat}
      return {
        lng: val.x,
        lat: val.y
      };
    } else {
      return val;
    }
  } else {
    return val;
  }
};

/*!
 * Convert to the Database name
 * @param {String} name The name
 * @returns {String} The converted name
 */
PostgreSQL.prototype.dbName = function(name) {
  if (!name) {
    return name;
  }
  // PostgreSQL default to lowercase names
  return name.toLowerCase();
};

function escapeIdentifier(str) {
  var escaped = '"';
  for(var i = 0; i < str.length; i++) {
    var c = str[i];
    if(c === '"') {
      escaped += c + c;
    } else {
      escaped += c;
    }
  }
  escaped += '"';
  return escaped;
}

function escapeLiteral(str) {
  var hasBackslash = false;
  var escaped = '\'';
  for(var i = 0; i < str.length; i++) {
    var c = str[i];
    if(c === '\'') {
      escaped += c + c;
    } else if (c === '\\') {
      escaped += c + c;
      hasBackslash = true;
    } else {
      escaped += c;
    }
  }
  escaped += '\'';
  if(hasBackslash === true) {
    escaped = ' E' + escaped;
  }
  return escaped;
}

/*!
 * Escape the name for PostgreSQL DB
 * @param {String} name The name
 * @returns {String} The escaped name
 */
PostgreSQL.prototype.escapeName = function(name) {
  if (!name) {
    return name;
  }
  return escapeIdentifier(name);
};

PostgreSQL.prototype.escapeValue = function(value) {
  if (typeof value === 'string') {
    return escapeLiteral(value);
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  return value;
};

PostgreSQL.prototype.tableEscaped = function(model) {
  var schema = this.schema(model) || 'public';
  return this.escapeName(schema) + '.' +
    this.escapeName(this.table(model));
};

function buildLimit(limit, offset) {
  var clause = [];
  if (isNaN(limit)) {
    limit = 0;
  }
  if (isNaN(offset)) {
    offset = 0;
  }
  if (!limit && !offset) {
    return '';
  }
  if (limit) {
    clause.push('LIMIT ' + limit);
  }
  if (offset) {
    clause.push('OFFSET ' + offset);
  }
  return clause.join(' ');
}

PostgreSQL.prototype.applyPagination = function(model, stmt, filter) {
  var limitClause = buildLimit(filter.limit, filter.offset || filter.skip);
  return stmt.merge(limitClause);
};

PostgreSQL.prototype.buildExpression =
  function(columnName, operator, columnValue, propertyValue) {
    if (propertyValue instanceof RegExp) {
      columnValue = "'" + propertyValue.source + "'";
      if (propertyValue.ignoreCase) {
        return new ParameterizedSQL(columnName + ' ~* ?', [columnValue]);
      } else {
        return new ParameterizedSQL(columnName + ' ~ ?', [columnValue]);
      }
    }
    switch(operator) {
      case 'like':
        return new ParameterizedSQL({
          sql: columnName + " LIKE ? ESCAPE '\\'",
          params: [columnValue]
        });
      case 'nlike':
        return new ParameterizedSQL({
          sql: columnName + " NOT LIKE ? ESCAPE '\\'",
          params: [columnValue]
        });
      default:
        // Invoke the base implementation of `buildExpression`
        var exp = this.invokeSuper('buildExpression',
          columnName, operator, columnValue, propertyValue);
        return exp;
    }
  };

/**
 * Disconnect from PostgreSQL
 * @param {Function} [cb] The callback function
 */
PostgreSQL.prototype.disconnect = function disconnect(cb) {
  if (this.pg) {
    if (this.settings.debug) {
      this.debug('Disconnecting from ' + this.settings.hostname);
    }
    var pg = this.pg;
    this.pg = null;
    pg.end();  // This is sync
  }

  if (cb) {
    process.nextTick(cb);
  }
};

PostgreSQL.prototype.ping = function(cb) {
  this.execute('SELECT 1 AS result', [], cb);
};

PostgreSQL.prototype.getInsertedId = function(model, info) {
  var idColName = this.idColumn(model);
  var idValue;
  if (info && info[0]) {
    idValue = info[0][idColName];
  }
  return idValue;
};

/*!
 * Convert property name/value to an escaped DB column value
 * @param {Object} prop Property descriptor
 * @param {*} val Property value
 * @returns {*} The escaped value of DB column
 */
PostgreSQL.prototype.toColumnValue = function(prop, val) {
  if (val == null) {
    // PostgreSQL complains with NULLs in not null columns
    // If we have an autoincrement value, return DEFAULT instead
    if (prop.autoIncrement || prop.id) {
      return new ParameterizedSQL('DEFAULT');
    }
    else {
      return null;
    }
  }
  if (prop.type === String) {
    return String(val);
  }
  if (prop.type === Number) {
    if (isNaN(val)) {
      // Map NaN to NULL
      return val;
    }
    return val;
  }

  if (prop.type === Date || prop.type.name === 'Timestamp') {
    if (!val.toISOString) {
      val = new Date(val);
    }
    var iso = val.toISOString();

    return new ParameterizedSQL({
      // 'to_date(?,\'yyyy-mm-dd hh24:mi:ss\')',
      sql: 'to_timestamp(?,\'yyyy-mm-dd hh24:mi:ss.ms\')',
      params: [iso]
    });
  }

  // PostgreSQL support char(1) Y/N
  if (prop.type === Boolean) {
    if (val) {
      return true;
    } else {
      return false;
    }
  }

  if (prop.type.name === 'GeoPoint' || prop.type.name === 'Point') {
    return new ParameterizedSQL({
      sql: 'point(?,?)',
      // Postgres point is point(lng, lat)
      params: [val.lng, val.lat]
    });
  }

  return val;
}

/**
 * Get the place holder in SQL for identifiers, such as ??
 * @param {String} key Optional key, such as 1 or id
 * @returns {String} The place holder
 */
PostgreSQL.prototype.getPlaceholderForIdentifier = function(key) {
  throw new Error('Placeholder for identifiers is not supported');
};

/**
 * Get the place holder in SQL for values, such as :1 or ?
 * @param {String} key Optional key, such as 1 or id
 * @returns {String} The place holder
 */
PostgreSQL.prototype.getPlaceholderForValue = function(key) {
  return '$' + key;
};

PostgreSQL.prototype.getCountForAffectedRows = function(model, info) {
  return info && info.count;
};

require('./discovery')(PostgreSQL);
require('./migration')(PostgreSQL);
require('./transaction')(PostgreSQL);
