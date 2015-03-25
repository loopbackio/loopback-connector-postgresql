/*!
 * PostgreSQL connector for LoopBack
 */
var postgresql = require('pg');
var SqlConnector = require('loopback-connector').SqlConnector;
var util = require('util');
var async = require('async');
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
require('util').inherits(PostgreSQL, SqlConnector);

PostgreSQL.prototype.debug = function () {
  if (this.settings.debug) {
    debug.apply(debug, arguments);
  }
};

/**
 * Connect to PostgreSQL
 * @callback {Function} [callback] The callback after the connection is established
 */
PostgreSQL.prototype.connect = function (callback) {
  var self = this;
  self.pg.connect(self.clientConfig, function(err, client, done) {
    process.nextTick(done);
    callback && callback(err, client);
  });
};

/**
 * Execute the sql statement
 *
 * @param {String} sql The SQL statement
 * @param {String[]} params The parameter values for the SQL statement
 * @callback {Function} [callback] The callback after the SQL statement is executed
 * @param {String|Error} err The error string or object
 * @param {Object[]) data The result from the SQL
 */
PostgreSQL.prototype.executeSQL = function (sql, params, callback) {
  var self = this;
  var time = Date.now();
  var log = self.log;

  if (self.settings.debug) {
    if (params && params.length > 0) {
      self.debug('SQL: ' + sql + '\nParameters: ' + params);
    } else {
      self.debug('SQL: ' + sql);
    }
  }

  self.pg.connect(self.clientConfig, function(err, client, done) {
    client.query(sql, params, function(err, data) {
      // if(err) console.error(err);
      if (err && self.settings.debug) {
        self.debug(err);
      }
      if (self.settings.debug && data) self.debug("%j", data);
      // console.log(err);
      if (log) log(sql, time);
      process.nextTick(done); // Release the pooled client
      var result = null;
      if (data) {
        switch(data.command) {
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
  });
};

/*
 * Check if the connection is in progress
 * @private
 */
function stillConnecting(dataSource, obj, args) {
  if (dataSource.connected) return false; // Connected

  var method = args.callee;
  // Set up a callback after the connection is established to continue the method call
  dataSource.once('connected', function () {
    method.apply(obj, [].slice.call(args));
  });
  if (!dataSource.connecting) {
    dataSource.connect();
  }
  return true;
}

/**
 * Execute a sql statement with the given parameters
 *
 * @param {String} sql The SQL statement
 * @param {[]} params An array of parameter values
 * @callback {Function} [callback] The callback function
 * @param {String|Error} err The error string or object
 * @param {Object[]} data The result from the SQL
 */
PostgreSQL.prototype.query = function (sql, params, callback) {
  if (stillConnecting(this.dataSource, this, arguments)) return;

  if (!callback && typeof params === 'function') {
    callback = params;
    params = [];
  }

  params = params || [];

  var cb = callback || function (err, result) {
  };
  this.executeSQL(sql, params, cb);
};

/**
 * Count the number of instances for the given model
 *
 * @param {String} model The model name
 * @param {Function} [callback] The callback function
 * @param {Object} filter The filter for where
 *
 */
PostgreSQL.prototype.count = function count(model, callback, filter) {
  this.query('SELECT count(*) as "cnt"  FROM '
    + ' ' + this.toFilter(model, filter && {where: filter}), function (err, data) {
    if (err) return callback(err);
    var c = data && data[0] && data[0].cnt;
    callback(err, Number(c));
  }.bind(this));
};

/**
 * Delete instances for the given model
 *
 * @param {String} model The model name
 * @param {Object} [where] The filter for where
 * @callback {Function} [callback] The callback function
 * @param {String|Error} err The error string or object
 */
PostgreSQL.prototype.destroyAll = function destroyAll(model, where, callback) {
  if (!callback && 'function' === typeof where) {
    callback = where;
    where = undefined;
  }
  this.query('DELETE FROM '
    + ' ' + this.toFilter(model, where && {where: where}), function (err, data) {
    callback && callback(err, data);
  }.bind(this));
};

/*!
 * Categorize the properties for the given model and data
 * @param {String} model The model name
 * @param {Object} data The data object
 * @returns {{ids: String[], idsInData: String[], nonIdsInData: String[]}}
 * @private
 */
PostgreSQL.prototype._categorizeProperties = function(model, data) {
  var ids = this.idNames(model);
  var idsInData = ids.filter(function(key) {
    return data[key] !== null && data[key] !== undefined;
  });
  var props = Object.keys(this._models[model].properties);
  var nonIdsInData = Object.keys(data).filter(function(key) {
    return props.indexOf(key) !== -1 && ids.indexOf(key) === -1 && data[key] !== undefined;
  });
  return {
    ids: ids,
    idsInData: idsInData,
    nonIdsInData: nonIdsInData
  };
};

PostgreSQL.prototype.mapToDB = function (model, data) {
  var dbData = {};
  if (!data) {
    return dbData;
  }
  var props = this._models[model].properties;
  for (var p in data) {
    if(props[p]) {
      var pType = props[p].type && props[p].type.name;
      if (pType === 'GeoPoint' && data[p]) {
        dbData[p] = '(' + data[p].lat + ',' + data[p].lng + ')';
      } else {
        dbData[p] = data[p];
      }
    }
  }
  return dbData;
}

/**
 * Create the data model in PostgreSQL
 *
 * @param {String} model The model name
 * @param {Object} data The model instance data
 * @callback {Function} [callback] The callback function
 * @param {String|Error} err The error string or object
 * @param {Object} The newly created model instance
 */
PostgreSQL.prototype.create = function (model, data, callback) {
  var self = this;
  data = self.mapToDB(model, data);
  var props = self._categorizeProperties(model, data);

  var sql = [];
  sql.push('INSERT INTO ', self.tableEscaped(model), ' ',
    self.toFields(model, data, true));
  sql.push(' RETURNING ');
  sql.push(props.ids.map(function(key) {
    return self.columnEscaped(model, key)}).join(',')
  );

  var idColName = self.idColumn(model);
  this.query(sql.join(''), generateQueryParams(data, props), function (err, info) {
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


/**
 * Save the model instance to PostgreSQL DB
 * @param {String} model The model name
 * @param {Object} data The model instance data
 * @callback {Function} [callback] The callback function
 * @param {String|Error} err The error string or object
 */
PostgreSQL.prototype.save = function (model, data, callback) {
  var self = this;
  data = self.mapToDB(model, data);
  var props = self._categorizeProperties(model, data);

  var sql = [];
  sql.push('UPDATE ', self.tableEscaped(model), ' SET ', self.toFields(model, data));
  sql.push(' WHERE ');
  props.ids.forEach(function (id, i) {
    sql.push((i > 0) ? ' AND ' : ' ', self.idColumnEscaped(model), ' = $',
      (props.nonIdsInData.length + i + 1));
  });

  self.query(sql.join(''), generateQueryParams(data, props), function (err) {
    callback(err);
  });
};

PostgreSQL.prototype.update =
  PostgreSQL.prototype.updateAll = function (model, where, data, callback) {
    var whereClause = this.buildWhere(model, where);

    var sql = ['UPDATE ', this.tableEscaped(model), ' SET ',
      this.toFields(model, data), ' ', whereClause].join('');

    data = this.mapToDB(model, data);
    var props = this._categorizeProperties(model, data);

    this.query(sql, generateQueryParams(data, props), function (err, result) {
      if (callback) {
        callback(err, result);
      }
    });
  };

/*!
 * Build a list of column name/value pairs
 *
 * @param {String} The model name
 * @param {Object} The model instance data
 * @param {Boolean} forCreate Indicate if it's for creation
 */
PostgreSQL.prototype.toFields = function (model, data, forCreate) {
  var self = this;
  var props = self._categorizeProperties(model, data);
  var dataIdNames = props.idsInData;
  var nonIdsInData = props.nonIdsInData;
  var query = [];
  if (forCreate) {
      if(nonIdsInData.length == 0 && dataIdNames.length == 0) {
          return 'default values';
      }
    query.push('(');
    query.push(nonIdsInData.map(function (key) {
      return self.columnEscaped(model, key);
    }).join(','));
    if (dataIdNames.length > 0) {
      if (nonIdsInData.length > 0) {
        query.push(',');
      }
      query.push(dataIdNames.map(function (key) {
        return self.columnEscaped(model, key);
      }).join(','));
    }
    query.push(') SELECT ');
    for (var i = 1, len = nonIdsInData.length + dataIdNames.length; i <= len; i++) {
      query.push('$', i);
      if (i !== len) {
        query.push(',');
      }
    }
    query.push(' ');
  } else {
    query.push(nonIdsInData.map(function (key, i) {
      return self.columnEscaped(model, key) + "=$" + (i + 1)
    }).join(','));
  }
  return query.join('');
};


function dateToPostgreSQL(val, dateOnly) {
  function fz(v) {
    return v < 10 ? '0' + v : v;
  }

  function ms(v) {
    if (v < 10) {
      return '00' + v;
    } else if (v < 100) {
      return '0' + v;
    } else {
      return '' + v;
    }
  }

  var dateStr = [
    val.getUTCFullYear(),
    fz(val.getUTCMonth() + 1),
    fz(val.getUTCDate())
  ].join('-') + ' ' + [
    fz(val.getUTCHours()),
    fz(val.getUTCMinutes()),
    fz(val.getUTCSeconds())
  ].join(':');

  if (!dateOnly) {
    dateStr += '.' + ms(val.getMilliseconds());
  }

  if (dateOnly) {
    return "to_date('" + dateStr + "', 'yyyy-mm-dd hh24:mi:ss')";
  } else {
    return "to_timestamp('" + dateStr + "', 'yyyy-mm-dd hh24:mi:ss.ff3')";
  }

}

/*!
 * Convert name/value to database value
 *
 * @param {String} prop The property name
 * @param {*} val The property value
 */
PostgreSQL.prototype.toDatabase = function (prop, val) {
  if (val === null || val === undefined) {
    // PostgreSQL complains with NULLs in not null columns
    // If we have an autoincrement value, return DEFAULT instead
    if (prop.autoIncrement) {
      return 'DEFAULT';
    }
    else {
      return 'NULL';
    }
  }
  if (val.constructor.name === 'Object') {
    if (prop.postgresql && prop.postgresql.dataType === 'json') {
       return JSON.stringify(val);
    }
    var operator = Object.keys(val)[0]
    val = val[operator];
    if (operator === 'between') {
      return this.toDatabase(prop, val[0]) + ' AND ' + this.toDatabase(prop, val[1]);
    }
    if (operator === 'inq' || operator === 'nin') {
      for (var i = 0; i < val.length; i++) {
        val[i] = escape(val[i]);
      }
      return val.join(',');
    }
    return this.toDatabase(prop, val);
  }
  if (prop.type.name === 'Number') {
    if (!val && val !== 0) {
      if (prop.autoIncrement) {
        return 'DEFAULT';
      }
      else {
        return 'NULL';
      }
    }
    return escape(val);
  }

  if (prop.type.name === 'Date' || prop.type.name === 'Timestamp') {
    if (!val) {
      if (prop.autoIncrement) {
        return 'DEFAULT';
      }
      else {
        return 'NULL';
      }
    }
    if (!val) {
      if (prop.autoIncrement) {
        return 'DEFAULT';
      }
      else {
        return 'NULL';
      }
    }
    if (!val.toISOString) {
      val = new Date(val);
    }
    var iso = escape(val.toISOString());
    return 'TIMESTAMP WITH TIME ZONE ' + iso;
    /*
     if (!val.toUTCString) {
     val = new Date(val);
     }
     return dateToPostgreSQL(val, prop.type.name === 'Date');
     */
  }

  // PostgreSQL support char(1) Y/N
  if (prop.type.name === 'Boolean') {
    if (val) {
      return "TRUE";
    } else {
      return "FALSE";
    }
  }

  if (prop.type.name === 'GeoPoint') {
    if (val) {
      return '(' + escape(val.lat) + ',' + escape(val.lng) + ')';
    } else {
      return 'NULL';
    }
  }

  return escape(val.toString());

};

/*!
 * Convert the data from database to JSON
 *
 * @param {String} model The model name
 * @param {Object} data The data from DB
 */
PostgreSQL.prototype.fromDatabase = function (model, data) {
  if (!data) {
    return null;
  }
  var props = this._models[model].properties;
  var json = {};
  for (var p in props) {
    var key = this.column(model, p);
    // console.log(data);
    var val = data[key];
    if (val === undefined) {
      continue;
    }
    // console.log(key, val);
    var prop = props[p];
    var type = prop.type && prop.type.name;
    if (prop && type === 'Boolean') {
      if(typeof val === 'boolean') {
        json[p] = val;
      } else {
        json[p] = (val === 'Y' || val === 'y' || val === 'T' || val === 't' || val === '1');
      }
    } else if (prop && type === 'GeoPoint' || type === 'Point') {
      if (typeof val === 'string') {
        // The point format is (x,y)
        var point = val.split(/[\(\)\s,]+/).filter(Boolean);
        json[p] = {
          lat: +point[0],
          lng: +point[1]
        };
      } else if (typeof val === 'object' && val !== null) {
        // Now pg driver converts point to {x: lat, y: lng}
        json[p] = {
          lat: val.x,
          lng: val.y
        };
      } else {
        json[p] = val;
      }
    } else {
      json[p] = val;
    }
  }
  if (this.settings.debug) {
    this.debug('JSON data: %j', json);
  }
  return json;
};

/*!
 * Convert to the Database name
 * @param {String} name The name
 * @returns {String} The converted name
 */
PostgreSQL.prototype.dbName = function (name) {
  if (!name) {
    return name;
  }
  // PostgreSQL default to lowercase names
  return name.toLowerCase();
};

/*!
 * Escape the name for PostgreSQL DB
 * @param {String} name The name
 * @returns {String} The escaped name
 */
PostgreSQL.prototype.escapeName = function (name) {
  if (!name) {
    return name;
  }
  return '"' + name.replace(/\./g, '"."') + '"';
};

PostgreSQL.prototype.schemaName = function (model) {
  // Check if there is a 'schema' property for postgresql
  var dbMeta = this._models[model].settings && this._models[model].settings.postgresql;
  var schemaName = (dbMeta && (dbMeta.schema || dbMeta.schemaName))
    || this.settings.schema || 'public';
  return schemaName;
};

PostgreSQL.prototype.table = function (model) {
  // Check if there is a 'table' property for postgresql
  var dbMeta = this._models[model].settings && this._models[model].settings.postgresql;
  var tableName = (dbMeta && (dbMeta.table || dbMeta.tableName)) || model.toLowerCase();
  return tableName;
};

PostgreSQL.prototype.tableEscaped = function (model) {
  return this.escapeName(this.schemaName(model)) + '.' + this.escapeName(this.table(model));
};

/*!
 * Get a list of columns based on the fields pattern
 *
 * @param {String} model The model name
 * @param {Object|String[]} props Fields pattern
 * @returns {String}
 */
PostgreSQL.prototype.getColumns = function (model, props) {
  var cols = this._models[model].properties;
  var self = this;
  var keys = Object.keys(cols);
  if (Array.isArray(props) && props.length > 0) {
    // No empty array, including all the fields
    keys = props;
  } else if ('object' === typeof props && Object.keys(props).length > 0) {
    // { field1: boolean, field2: boolean ... }
    var included = [];
    var excluded = [];
    keys.forEach(function (k) {
      if (props[k]) {
        included.push(k);
      } else if ((k in props) && !props[k]) {
        excluded.push(k);
      }
    });
    if (included.length > 0) {
      keys = included;
    } else if (excluded.length > 0) {
      excluded.forEach(function (e) {
        var index = keys.indexOf(e);
        keys.splice(index, 1);
      });
    }
  }
  var names = keys.map(function (c) {
    return self.columnEscaped(model, c);
  });
  return names.join(', ');
};

/**
 * Find matching model instances by the filter
 *
 * @param {String} model The model name
 * @param {Object} filter The filter
 * @callback {Function} [callback] The callback function
 * @param {String|Error} err The error string or object
 * @param {Object[]} The matched model instances
 */
PostgreSQL.prototype.all = function all(model, filter, callback) {
  // Order by id if no order is specified
  filter = filter || {};
  if (!filter.order) {
    var idNames = this.idNames(model);
    if (idNames && idNames.length) {
      filter.order = idNames;
    }
  }

  this.query('SELECT ' + this.getColumns(model, filter.fields) + '  FROM '
    + this.toFilter(model, filter), function (err, data) {
    if (err) {
      return callback(err, []);
    }
    if (data) {
      for (var i = 0; i < data.length; i++) {
        data[i] = this.fromDatabase(model, data[i]);
      }
    }
    if (filter && filter.include) {
      this._models[model].model.include(data, filter.include, callback);
    } else {
      callback(null, data);
    }
  }.bind(this));
};

function getPagination(filter) {
  var pagination = [];
  if (filter && (filter.limit || filter.offset || filter.skip)) {
    var offset = Number(filter.offset);
    if (!offset) {
      offset = Number(filter.skip);
    }
    if (offset) {
      pagination.push('OFFSET ' + offset);
    } else {
      offset = 0;
    }
    var limit = Number(filter.limit);
    if (limit) {
      pagination.push('LIMIT ' + limit);
    }
  }
  return pagination;
}

PostgreSQL.prototype.buildWhere = function (model, conds) {
  var where = this._buildWhere(model, conds);
  if (where) {
    return ' WHERE ' + where;
  } else {
    return '';
  }
};

PostgreSQL.prototype._buildWhere = function (model, conds) {
  if (!conds) {
    return '';
  }
  var self = this;
  var props = self._models[model].properties;
  var fields = [];
  if (typeof conds === 'string') {
    fields.push(conds);
  } else if (util.isArray(conds)) {
    var query = conds.shift().replace(/\?/g, function (s) {
      return escape(conds.shift());
    });
    fields.push(query);
  } else {
    var sqlCond = null;
    Object.keys(conds).forEach(function (key) {
      if (key === 'and' || key === 'or') {
        var clauses = conds[key];
        if (Array.isArray(clauses)) {
          clauses = clauses.map(function (c) {
            return '(' + self._buildWhere(model, c) + ')';
          });
          return fields.push(clauses.join(' ' + key.toUpperCase() + ' '));
        }
        // The value is not an array, fall back to regular fields
      }
      if (conds[key] && conds[key].constructor.name === 'RegExp') {
        var regex = conds[key];
        sqlCond = self.columnEscaped(model, key);

        if (regex.ignoreCase) {
          sqlCond += ' ~* ';
        } else {
          sqlCond += ' ~ ';
        }

        sqlCond += "'" + regex.source + "'";

        fields.push(sqlCond);

        return;
      }
      if (props[key]) {
        var filterValue = self.toDatabase(props[key], conds[key]);
        if (filterValue === 'NULL') {
          fields.push(self.columnEscaped(model, key) + ' IS ' + filterValue);
        } else if (conds[key].constructor.name === 'Object') {
          var condType = Object.keys(conds[key])[0];
          sqlCond = self.columnEscaped(model, key);
          if ((condType === 'inq' || condType === 'nin') && filterValue.length === 0) {
            fields.push(condType === 'inq' ? '1 = 2' : '1 = 1');
            return true;
          }
          switch (condType) {
            case 'gt':
              sqlCond += ' > ';
              break;
            case 'gte':
              sqlCond += ' >= ';
              break;
            case 'lt':
              sqlCond += ' < ';
              break;
            case 'lte':
              sqlCond += ' <= ';
              break;
            case 'between':
              sqlCond += ' BETWEEN ';
              break;
            case 'inq':
              sqlCond += ' IN ';
              break;
            case 'nin':
              sqlCond += ' NOT IN ';
              break;
            case 'neq':
              sqlCond += ' != ';
              break;
            case 'like':
              sqlCond += ' LIKE ';
              filterValue += "ESCAPE '\\'";
              break;
            case 'nlike':
              sqlCond += ' NOT LIKE ';
              filterValue += "ESCAPE '\\'";
              break;
            default:
              sqlCond += ' ' + condType + ' ';
              break;
          }
          sqlCond += (condType === 'inq' || condType === 'nin')
            ? '(' + filterValue + ')' : filterValue;
          fields.push(sqlCond);
        } else {
          fields.push(self.columnEscaped(model, key) + ' = ' + filterValue);
        }
      }
    });
  }
  return fields.join(' AND ');
};

/*!
 * Build the SQL clause
 * @param {String} model The model name
 * @param {Object} filter The filter
 * @returns {*}
 */
PostgreSQL.prototype.toFilter = function (model, filter) {
  var self = this;
  if (filter && typeof filter.where === 'function') {
    return self.tableEscaped(model) + ' ' + filter.where();
  }
  if (!filter) {
    return self.tableEscaped(model);
  }
  var out = self.tableEscaped(model) + ' ';

  var where = self.buildWhere(model, filter.where);
  if (where) {
    out += where;
  }

  // First check the pagination requirements
  // http://docs.postgresql.com/cd/B19306_01/server.102/b14200/functions137.htm#i86310
  var pagination = getPagination(filter);

  if (filter.order) {
    var order = filter.order;
    if (typeof order === 'string') {
      order = [order];
    }
    var orderBy = '';
    filter.order = [];
    for (var i = 0, n = order.length; i < n; i++) {
      var t = order[i].split(/[\s]+/);
      var field = t[0], dir = t[1];
      filter.order.push(self.columnEscaped(model, field) + (dir ? ' ' + dir : ''));
    }
    orderBy = ' ORDER BY ' + filter.order.join(',');
    if (pagination.length) {
      out = out + ' ' + orderBy + ' ' + pagination.join(' ');
    } else {
      out = out + ' ' + orderBy;
    }
  } else {
    if (pagination.length) {
      out = out + ' '
        + pagination.join(' ');
    }
  }
  return out;
};

/**
 * Check if a model instance exists by id
 * @param {String} model The model name
 * @param {*} id The id value
 * @callback {Function} [callback] The callback function
 * @param {String|Error} err The error string or object
 * @param {Boolean} true if the id exists
 *
 */
PostgreSQL.prototype.exists = function (model, id, callback) {
  var sql = 'SELECT 1 FROM ' +
    this.tableEscaped(model);

  if (id) {
    sql += ' WHERE ' + this.idColumnEscaped(model) + ' = ' + id + ' LIMIT 1';
  } else {
    sql += ' WHERE ' + this.idColumnEscaped(model) + ' IS NULL LIMIT 1';
  }

  this.query(sql, function (err, data) {
    if (err) return callback(err);
    callback(null, data.length === 1);
  });
};

/**
 * Find a model instance by id
 * @param {String} model The model name
 * @param {*} id The id value
 * @callback {Function} [callback] The callback function
 * @param {String|Error} err The error string or object
 * @param {Object} The model instance
 */
PostgreSQL.prototype.find = function find(model, id, callback) {
  var sql = 'SELECT * FROM ' +
    this.tableEscaped(model);

  if (id) {
    var idVal = this.toDatabase(this._models[model].properties[this.idName(model)], id);
    sql += ' WHERE ' + this.idColumnEscaped(model) + ' = ' + idVal + ' LIMIT 1';
  }
  else {
    sql += ' WHERE ' + this.idColumnEscaped(model) + ' IS NULL LIMIT 1';
  }

  this.query(sql, function (err, data) {
    if (data && data.length === 1) {
      // data[0][this.idColumn(model)] = id;
    } else {
      data = [null];
    }
    callback(err, this.fromDatabase(model, data[0]));
  }.bind(this));
};

/*!
 * Discover the properties from a table
 * @param {String} model The model name
 * @param {Function} cb The callback function
 */
function getTableStatus(model, cb) {
  function decoratedCallback(err, data) {
    if (err) {
      console.error(err);
    }
    if (!err) {
      data.forEach(function (field) {
        field.type = mapPostgreSQLDatatypes(field.type);
      });
    }
    cb(err, data);
  }

  this.query('SELECT column_name AS "column", data_type AS "type", ' +
    'is_nullable AS "nullable"' // , data_default AS "Default"'
    + ' FROM "information_schema"."columns" WHERE table_name=\'' +
    this.table(model) + '\'', decoratedCallback);

}

/**
 * Perform autoupdate for the given models
 * @param {String[]} [models] A model name or an array of model names. If not present, apply to all models
 * @callback {Function} [callback] The callback function
 * @param {String|Error} err The error string or object
 */
PostgreSQL.prototype.autoupdate = function(models, cb) {
  var self = this;
  if ((!cb) && ('function' === typeof models)) {
    cb = models;
    models = undefined;
  }
  // First argument is a model name
  if ('string' === typeof models) {
    models = [models];
  }

  models = models || Object.keys(this._models);

  async.each(models, function(model, done) {
    if (!(model in self._models)) {
      return process.nextTick(function() {
        done(new Error('Model not found: ' + model));
      });
    }
    getTableStatus.call(self, model, function(err, fields) {
      if (!err && fields.length) {
        self.alterTable(model, fields, done);
      } else {
        self.createTable(model, done);
      }
    });
  }, cb);
};

/*!
 * Check if the models exist
 * @param {String[]} [models] A model name or an array of model names. If not present, apply to all models
 * @param {Function} [cb] The callback function
 */
PostgreSQL.prototype.isActual = function(models, cb) {
  var self = this;

  if ((!cb) && ('function' === typeof models)) {
    cb = models;
    models = undefined;
  }
  // First argument is a model name
  if ('string' === typeof models) {
    models = [models];
  }

  models = models || Object.keys(this._models);

  var changes = [];
  async.each(models, function(model, done) {
    getTableStatus.call(self, model, function(err, fields) {
      changes = changes.concat(getAddModifyColumns.call(self, model, fields));
      changes = changes.concat(getDropColumns.call(self, model, fields));
      done(err);
    });
  }, function done(err) {
    if (err) {
      return cb && cb(err);
    }
    var actual = (changes.length === 0);
    cb && cb(null, actual);
  });
};

/*!
 * Alter the table for the given model
 * @param {String} model The model name
 * @param {Object[]} actualFields Actual columns in the table
 * @param {Function} [cb] The callback function
 */
PostgreSQL.prototype.alterTable = function (model, actualFields, cb) {
  var self = this;
  var pendingChanges = getAddModifyColumns.call(self, model, actualFields);
  if (pendingChanges.length > 0) {
    applySqlChanges.call(self, model, pendingChanges, function (err, results) {
      var dropColumns = getDropColumns.call(self, model, actualFields);
      if (dropColumns.length > 0) {
        applySqlChanges.call(self, model, dropColumns, cb);
      } else {
        cb && cb(err, results);
      }
    });
  } else {
    var dropColumns = getDropColumns.call(self, model, actualFields);
    if (dropColumns.length > 0) {
      applySqlChanges.call(self, model, dropColumns, cb);
    } else {
      cb && process.nextTick(cb.bind(null, null, []));
    }
  }
};

function getAddModifyColumns(model, actualFields) {
  var sql = [];
  var self = this;
  sql = sql.concat(getColumnsToAdd.call(self, model, actualFields));
  var drops = getPropertiesToModify.call(self, model, actualFields);
  if (drops.length > 0) {
    if (sql.length > 0) {
      sql = sql.concat(', ');
    }
    sql = sql.concat(drops);
  }
  // sql = sql.concat(getColumnsToDrop.call(self, model, actualFields));
  return sql;
}

function getDropColumns(model, actualFields) {
  var sql = [];
  var self = this;
  sql = sql.concat(getColumnsToDrop.call(self, model, actualFields));
  return sql;
}

function getColumnsToAdd(model, actualFields) {
  var self = this;
  var m = self._models[model];
  var propNames = Object.keys(m.properties);
  var sql = [];
  propNames.forEach(function (propName) {
    if (self.id(model, propName)) return;
    var found = searchForPropertyInActual.call(self, model, self.column(model, propName), actualFields);
    if (!found && propertyHasNotBeenDeleted.call(self, model, propName)) {
      sql.push('ADD COLUMN ' + addPropertyToActual.call(self, model, propName));
    }
  });
  if (sql.length > 0) {
    sql = [sql.join(', ')];
  }
  return sql;
}

function addPropertyToActual(model, propName) {
  var self = this;
  var sqlCommand = self.columnEscaped(model, propName)
    + ' ' + self.columnDataType(model, propName) + (propertyCanBeNull.call(self, model, propName) ? "" : " NOT NULL");
  return sqlCommand;
}

function searchForPropertyInActual(model, propName, actualFields) {
  var self = this;
  var found = false;
  actualFields.forEach(function (f) {
    if (f.column === self.column(model, propName)) {
      found = f;
      return;
    }
  });
  return found;
}

function getPropertiesToModify(model, actualFields) {
  var self = this;
  var sql = [];
  var m = self._models[model];
  var propNames = Object.keys(m.properties);
  var found;
  propNames.forEach(function (propName) {
    if (self.id(model, propName)) {
      return;
    }
    found = searchForPropertyInActual.call(self, model, propName, actualFields);
    if (found && propertyHasNotBeenDeleted.call(self, model, propName)) {
      if (datatypeChanged(propName, found)) {
        sql.push('ALTER COLUMN ' + modifyDatatypeInActual.call(self, model, propName));
      }
      if (nullabilityChanged(propName, found)) {
        sql.push('ALTER COLUMN' + modifyNullabilityInActual.call(self, model, propName));
      }
    }
  });

  if (sql.length > 0) {
    sql = [sql.join(', ')];
  }

  return sql;

  function datatypeChanged(propName, oldSettings) {
    var newSettings = m.properties[propName];
    if (!newSettings) {
      return false;
    }
    return oldSettings.type.toUpperCase() !== self.columnDataType(model, propName);
  }

  function isNullable(p) {
    return !(p.required ||
      p.id ||
      p.allowNull === false ||
      p.null === false ||
      p.nullable === false);
  }

  function nullabilityChanged(propName, oldSettings) {
    var newSettings = m.properties[propName];
    if (!newSettings) {
      return false;
    }
    var changed = false;
    if (oldSettings.nullable === 'YES' && !isNullable(newSettings)) {
      changed = true;
    }
    if (oldSettings.nullable === 'NO' && isNullable(newSettings)) {
      changed = true;
    }
    return changed;
  }
}

function modifyDatatypeInActual(model, propName) {
  var self = this;
  var sqlCommand = self.columnEscaped(model, propName) + ' TYPE ' +
    self.columnDataType(model, propName);
  return sqlCommand;
}

function modifyNullabilityInActual(model, propName) {
  var self = this;
  var sqlCommand = self.columnEscaped(model, propName) + ' ';
  if (propertyCanBeNull.call(self, model, propName)) {
    sqlCommand = sqlCommand + "DROP ";
  } else {
    sqlCommand = sqlCommand + "SET ";
  }
  sqlCommand = sqlCommand + "NOT NULL";
  return sqlCommand;
}

function getColumnsToDrop(model, actualFields) {
  var self = this;
  var sql = [];
  actualFields.forEach(function (actualField) {
    if (self.idColumn(model) === actualField.column) {
      return;
    }
    if (actualFieldNotPresentInModel(actualField, model)) {
      sql.push('DROP COLUMN ' + self.escapeName(actualField.column));
    }
  });
  if (sql.length > 0) {
    sql = [sql.join(', ')];
  }
  return sql;

  function actualFieldNotPresentInModel(actualField, model) {
    return !(self.propertyName(model, actualField.column));
  }
}

function applySqlChanges(model, pendingChanges, cb) {
  var self = this;
  if (pendingChanges.length) {
    var thisQuery = 'ALTER TABLE ' + self.tableEscaped(model);
    var ranOnce = false;
    pendingChanges.forEach(function (change) {
      if (ranOnce) {
        thisQuery = thisQuery + ' ';
      }
      thisQuery = thisQuery + ' ' + change;
      ranOnce = true;
    });
    // thisQuery = thisQuery + ';';
    self.query(thisQuery, cb);
  }
}

/*!
 * Build a list of columns for the given model
 * @param {String} model The model name
 * @returns {String}
 */
PostgreSQL.prototype.propertiesSQL = function (model) {
  var self = this;
  var sql = [];
  var pks = this.idNames(model).map(function (i) {
    return self.columnEscaped(model, i);
  });
  Object.keys(this._models[model].properties).forEach(function (prop) {
    var colName = self.columnEscaped(model, prop);
    sql.push(colName + ' ' + self.propertySettingsSQL(model, prop));
  });
  if (pks.length > 0) {
    sql.push('PRIMARY KEY(' + pks.join(',') + ')');
  }
  return sql.join(',\n  ');

};

/*!
 * Build settings for the model property
 * @param {String} model The model name
 * @param {String} propName The property name
 * @returns {*|string}
 */
PostgreSQL.prototype.propertySettingsSQL = function (model, propName) {
  var self = this;
  if (this.id(model, propName) && this._models[model].properties[propName].generated) {
    return 'SERIAL';
  }
  var result = self.columnDataType(model, propName);
  if (!propertyCanBeNull.call(self, model, propName)) result = result + ' NOT NULL';

  result += self.columnDbDefault(model, propName);
  return result;
};

/*!
 * Drop a table for the given model
 * @param {String} model The model name
 * @param {Function} [cb] The callback function
 */
PostgreSQL.prototype.dropTable = function (model, cb) {
  var self = this;
  var name = self.tableEscaped(model);

  var dropTableFun = function (callback) {
    self.query('DROP TABLE IF EXISTS ' + name, function (err, data) {
      callback(err, data);
    });
  };

  dropTableFun(cb);
};

/*!
 * Create a table for the given model
 * @param {String} model The model name
 * @param {Function} [cb] The callback function
 */
PostgreSQL.prototype.createTable = function (model, cb) {
  var self = this;
  var name = self.tableEscaped(model);

  // Please note IF NOT EXISTS is introduced in postgresql v9.3
  self.query('CREATE SCHEMA ' +
    self.escapeName(self.schemaName(model)),
    function(err) {
      if (err && err.code !== '42P06') {
        return cb && cb(err);
      }
      self.query('CREATE TABLE ' + name + ' (\n  ' +
        self.propertiesSQL(model) + '\n)', cb);
    });
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
    process.nextTick(function () {
      cb && cb();
    });
  }
};

PostgreSQL.prototype.ping = function(cb) {
  this.query('SELECT 1 AS result', [], cb);
}

function propertyCanBeNull(model, propName) {
  var p = this._models[model].properties[propName];
  if (p.required || p.id) {
    return false;
  }
  return !(p.allowNull === false ||
    p['null'] === false || p.nullable === false);
}

function escape(val) {
  if (val === undefined || val === null) {
    return 'NULL';
  }

  switch (typeof val) {
    case 'boolean':
      return (val) ? "true" : "false";
    case 'number':
      return val + '';
  }

  if (typeof val === 'object') {
    val = (typeof val.toISOString === 'function')
      ? val.toISOString()
      : val.toString();
  }

  val = val.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function (s) {
    switch (s) {
      case "\0":
        return "\\0";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case "\b":
        return "\\b";
      case "\t":
        return "\\t";
      case "\x1a":
        return "\\Z";
      case "\'":
        return "''"; // For postgresql
      case "\"":
        return s; // For postgresql
      default:
        return "\\" + s;
    }
  });
  // return "q'#"+val+"#'";
  return "'" + val + "'";
}

/*!
 * Get the database-default value for column from given model property
 *
 * @param {String} model The model name
 * @param {String} property The property name
 * @returns {String} The column default value
 */
PostgreSQL.prototype.columnDbDefault = function(model, property) {
  var columnMetadata = this.columnMetadata(model, property);
  var colDefault = columnMetadata && columnMetadata.dbDefault;

  return colDefault ? (' DEFAULT ' + columnMetadata.dbDefault): '';
}

/*!
 * Find the column type for a given model property
 *
 * @param {String} model The model name
 * @param {String} property The property name
 * @returns {String} The column type
 */
PostgreSQL.prototype.columnDataType = function (model, property) {
  var columnMetadata = this.columnMetadata(model, property);
  var colType = columnMetadata && columnMetadata.dataType;
  if (colType) {
    colType = colType.toUpperCase();
  }
  var prop = this._models[model].properties[property];
  if (!prop) {
    return null;
  }
  var colLength = columnMetadata && columnMetadata.dataLength || prop.length;
  if (colType) {
    return colType + (colLength ? '(' + colLength + ')' : '');
  }

  switch (prop.type.name) {
    default:
    case 'JSON':
      return 'JSON';
    case 'String':
    case 'Text':
      return (colLength ? 'VARCHAR(' + colLength + ')' : 'TEXT');
    case 'Number':
      return 'NUMERIC';
    case 'Date':
      return 'TIMESTAMP WITH TIME ZONE';
    case 'Timestamp':
      return 'TIMESTAMP WITH TIME ZONE';
    case 'GeoPoint':
    case 'Point':
      return 'POINT';
    case 'Boolean':
      return 'BOOLEAN'; // PostgreSQL doesn't have built-in boolean
  }
};

/*!
 * Map postgresql data types to json types
 * @param {String} postgresqlType
 * @param {Number} dataLength
 * @returns {String}
 */
function postgresqlDataTypeToJSONType(postgresqlType, dataLength) {
  var type = postgresqlType.toUpperCase();
  switch (type) {
    case 'BOOLEAN':
      return 'Boolean';

    /*
     - character varying(n), varchar(n)	variable-length with limit
     - character(n), char(n)	fixed-length, blank padded
     - text	variable unlimited length
     */
    case 'VARCHAR':
    case 'CHARACTER VARYING':
    case 'CHARACTER':
    case 'CHAR':
    case 'TEXT':
      return 'String';

    case 'BYTEA':
      return 'Binary';
    /*
     - smallint	2 bytes	small-range integer	-32768 to +32767
     - integer	4 bytes	typical choice for integer	-2147483648 to +2147483647
     - bigint	8 bytes	large-range integer	-9223372036854775808 to 9223372036854775807
     - decimal	variable	user-specified precision, exact	no limit
     - numeric	variable	user-specified precision, exact	no limit
     - real	4 bytes	variable-precision, inexact	6 decimal digits precision
     - double precision	8 bytes	variable-precision, inexact	15 decimal digits precision
     - serial	4 bytes	autoincrementing integer	1 to 2147483647
     - bigserial	8 bytes	large autoincrementing integer	1 to 9223372036854775807
     */
    case 'SMALLINT':
    case 'INTEGER':
    case 'BIGINT':
    case 'DECIMAL':
    case 'NUMERIC':
    case 'REAL':
    case 'DOUBLE':
    case 'SERIAL':
    case 'BIGSERIAL':
      return 'Number';

    /*
     - timestamp [ (p) ] [ without time zone ]	8 bytes	both date and time (no time zone)	4713 BC	294276 AD	1 microsecond / 14 digits
     - timestamp [ (p) ] with time zone	8 bytes	both date and time, with time zone	4713 BC	294276 AD	1 microsecond / 14 digits
     - date	4 bytes	date (no time of day)	4713 BC	5874897 AD	1 day
     - time [ (p) ] [ without time zone ]	8 bytes	time of day (no date)	00:00:00	24:00:00	1 microsecond / 14 digits
     - time [ (p) ] with time zone	12 bytes	times of day only, with time zone	00:00:00+1459	24:00:00-1459	1 microsecond / 14 digits
     - interval [ fields ] [ (p) ]	12 bytes	time interval	-178000000 years	178000000 years	1 microsecond / 14 digits
     */
    case 'DATE':
    case 'TIMESTAMP':
    case 'TIME':
    case 'TIME WITH TIME ZONE':
    case 'TIME WITHOUT TIME ZONE':
    case 'TIMESTAMP WITH TIME ZONE':
    case 'TIMESTAMP WITHOUT TIME ZONE':
      return 'Date';

    case 'POINT':
      return 'GeoPoint';

    default:
      return 'String';
  }
}

function mapPostgreSQLDatatypes(typeName) {
  return typeName;
}

function propertyHasNotBeenDeleted(model, propName) {
  return !!this._models[model].properties[propName];
}

function generateQueryParams(data, props) {
    var queryParams = [];

    function pushToQueryParams(key) {
        queryParams.push(data[key] !== undefined ? data[key] : null);
    }

    props.nonIdsInData.forEach(pushToQueryParams);
    props.idsInData.forEach(pushToQueryParams);

    return queryParams;
}

require('./discovery')(PostgreSQL);
