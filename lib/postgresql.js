/**
 * PostgreSQL connector for LoopBack
 */
var postgresql = require('pg');
var jdb = require('loopback-datasource-juggler');
var util = require('util');
var async = require('async');

/**
 * @module loopback-connector-postgresql
 *
 * Initialize the PostgreSQL connector against the given data source
 *
 * @param {DataSource} dataSource The loopback-datasource-juggler dataSource
 * @param {Function} [callback] The callback function
 */
exports.initialize = function initializeDataSource(dataSource, callback) {
    if (!postgresql) {
        return;
    }

    var s = dataSource.settings;
    var postgresql_settings = {
        hostname: s.host || s.hostname || 'localhost',
        port: s.port || 5432,
        user: s.username || s.user,
        password: s.password,
        database: s.database,
        debug: s.debug || false

    };

    dataSource.connector = new PostgreSQL(postgresql, postgresql_settings);
    dataSource.connector.dataSource = dataSource;

    if (callback) {
        dataSource.connector.connect(callback);
    }

};

/**
 * PostgreSQL connector constructor
 *
 * `settings` is an object with the following possible properties:
 *
 *  - {String} hostname - The host name or ip address of the PostgreSQL DB server
 *  - {Number} port - The port number of the PostgreSQL DB Server
 *  - {String} user - The user name
 *  - {String} password - The password
 *  - {String} database - The database name (TNS listener name)
 *  - {Boolean|Number} debug - The flag to control if debug messages will be printed out
 *
 * @param {PostgreSQL} postgresql PostgreSQL node.js binding
 * @param {Object} settings An object for the data source settings
 *
 * @constructor
 */
function PostgreSQL(postgresql, settings) {
    // this.name = 'postgresql';
    // this._models = {};
    // this.settings = settings;
    this.constructor.super_.call(this, 'postgresql', settings);
    this.postgresql = new postgresql.Client(settings);
    this.connection = null;
    if (settings.debug) {
        console.dir(settings);
    }
}

// Inherit from loopback-datasource-juggler BaseSQL
require('util').inherits(PostgreSQL, jdb.BaseSQL);


PostgreSQL.prototype.debug = function () {
    if (this.settings.debug) {
        console.log.apply(null, arguments);
    }
};

/**
 * Connect to PostgreSQL
 * @param {Function} [callback] The callback after the connection is established
 */
PostgreSQL.prototype.connect = function (callback) {
    var self = this;
    if (this.connection) {
        if (callback) {
            process.nextTick(function () {
                callback && callback(null, self.connection);
            });
        }
        return;
    }
    if (this.settings.debug) {
        this.debug('Connecting to ' + this.settings.hostname);
    }
    this.postgresql.connect(function (err) {
        if (!err) {
            self.connection = self.postgresql;
            if (self.settings.debug) {
                self.debug('Connected to ' + self.settings.hostname);
            }
            callback && callback(err, self.connection);
        } else {
            console.error(err);
            throw err;
        }
    });
};

/**
 * Execute the sql statement
 *
 * @param {String} sql The SQL statement
 * @param {String[]} params The parameter values for the SQL statement
 * @param {Function} [callback] The callback after the SQL statement is executed
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
    self.connection.query(sql, params, function (err, data) {
        if (err && err.toString().indexOf('ORA-03114') >= 0) {
            self.connection = null; // Remove the connection so that it will be reconnected
            self.dataSource.connected = self.dataSource.connecting = false;
        }
        // if(err) console.error(err);
        if (err && self.settings.debug) {
            self.debug(err);
        }
        if (self.settings.debug && data) self.debug("%j", data);
        // console.log(err);
        if (log) log(sql, time);
        callback(err ? err : null, data ? data.rows : null);
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
 * @param {String[]} params An array of parameter values
 * @param {Function} [callback] The callback function
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
        callback(err, data && data[0] && data[0].cnt);
    }.bind(this));
};

/**
 * Delete instances for the given model
 *
 * @param {String} model The model name
 * @param {Object} [where] The filter for where
 * @param {Function} [callback] The callback function
 *
 */
PostgreSQL.prototype.destroyAll = function destroyAll(model, where, callback) {
    if (!callback && 'function' === typeof where) {
        callback = where;
        where = undefined;
    }
    this.query('DELETE  FROM '
        + ' ' + this.toFilter(model, where && {where: where}), function (err, data) {
        callback && callback(err, data);
    }.bind(this));
};


/**
 * Create the data model in PostgreSQL
 *
 * @param {String} model The model name
 * @param {Object} data The model instance data
 * @param {Function} [callback] The callback function
 */
PostgreSQL.prototype.create = function (model, data, callback) {
    var fields = this.toFields(model, data, true);
    var sql = 'INSERT INTO ' + this.tableEscaped(model) + '';
    if (fields) {
        sql += ' ' + fields;
    } else {
        sql += ' VALUES ()';
    }
    sql += ' RETURNING ' + this.idColumnEscaped(model) + ' into :1';
    this.query(sql, [new postgresql.OutParam()], function (err, info) {
        if (err) return callback(err);
        callback(err, info && info.returnParam);
    });
};

/**
 * Update if the model instance exists with the same id or create a new instance
 *
 * @param {String} model The model name
 * @param {Object} data The model instance data
 * @param {Function} [callback] The callback function
 */
PostgreSQL.prototype.updateOrCreate = function (model, data, callback) {
    var postgresql = this;
    var fieldsNames = [];
    var fieldValues = [];
    var combined = [];
    var props = this._models[model].properties;
    var self = this;
    Object.keys(data).forEach(function (key) {
        if (props[key] || self.id(model, key)) {
            var k = self.idColumnEscaped(model);
            var v;
            if (!self.id(model, key)) {
                v = postgresql.toDatabase(props[key], data[key]);
            } else {
                v = data[key];
            }
            fieldsNames.push(k);
            fieldValues.push(v);
            if (!self.id(model, key)) {
                if (v) {
                    combined.push(k + ' = ' + v);
                } else {
                    combined.push(k + ' IS NULL');
                }
            }
        }
    });

    var sql = 'UPDATE ' + this.tableEscaped(model);
    sql += ' SET ' + combined;
    sql += ' WHERE ';
    var idNames = this.idNames(model);
    idNames.forEach(function (id, i) {
        if (data[id] !== null && data[id] !== undefined) {
            sql += ((i > 0) ? ' AND ' : '') + self.idColumnEscaped(model) + ' = ' + data[id];
        } else {
            sql += ((i > 0) ? ' AND ' : '') + self.idColumnEscaped(model) + ' IS NULL';
        }
    });
    sql += ' INSERT INTO ' + this.tableEscaped(model);
    sql += ' (' + fieldsNames.join(', ') + ')';
    sql += ' SELECT ' + fieldValues.join(', ')
    sql += ' WHERE NOT EXISTS (SELECT 1 FROM ' + this.tableEscaped(model);
    sql += ' WHERE ';
    idNames.forEach(function (id, i) {
        if (data[id] !== null && data[id] !== undefined) {
            sql += ((i > 0) ? ' AND ' : '') + self.idColumnEscaped(model) + ' = ' + data[id];
        } else {
            sql += ((i > 0) ? ' AND ' : '') + self.idColumnEscaped(model) + ' IS NULL';
        }
    });
    sql += ') RETURNING ' + self.idColumnEscaped(model) + ' into :1';

    this.query(sql, [new postgresql.OutParam()], function (err, info) {
        if (!err && info && info.returnParam) {
            var idName = self.idName(model) || 'id';
            data[idName] = info.returnParam;
        }
        callback(err, data);
    });
};

/**
 * Save the model instance to PostgreSQL DB
 * @param {String} model The model name
 * @param {Object} data The model instance data
 * @param {Function} [callback] The callback function
 */
PostgreSQL.prototype.save = function (model, data, callback) {
    var self = this;
    var sql = 'UPDATE ' + this.tableEscaped(model) + ' SET ' + this.toFields(model, data);

    sql += ' WHERE ';
    var idNames = this.idNames(model);
    idNames.forEach(function (id, i) {
        if (data[id] !== null && data[id] !== undefined) {
            sql += ((i > 0) ? ' AND ' : '') + self.idColumnEscaped(model) + ' = ' + data[id];
        } else {
            sql += ((i > 0) ? ' AND ' : '') + self.idColumnEscaped(model) + ' IS NULL';
        }
    });

    this.query(sql, function (err) {
        callback(err);
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
    var fields = [];
    var props = this._models[model].properties;
    var self = this;

    if (forCreate) {
        var columns = [];
        Object.keys(data).forEach(function (key) {
            if (props[key]) {
                if (!self.id(model, key)) {
                    columns.push(self.columnEscaped(model, key));
                    fields.push(this.toDatabase(props[key], data[key]));
                } else {
                    if (data[key]) {
                        columns.push(self.columnEscaped(model, key));
                        fields.push(this.toDatabase(props[key], data[key]));
                    }
                }
            }
        }.bind(this));
        return '(' + columns.join(',') + ') VALUES (' + fields.join(',') + ')';
    } else {
        Object.keys(data).forEach(function (key) {
            if (props[key]) {
                fields.push(self.columnEscaped(model, key) + '= ' + this.toDatabase(props[key], data[key]));
            }
        }.bind(this));
        return fields.join(',');
    }
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
        return val;
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
        if (!val.toUTCString) {
            val = new Date(val);
        }
        return dateToPostgreSQL(val, prop.type.name === 'Date');
    }

    // PostgreSQL support char(1) Y/N
    if (prop.type.name === 'Boolean') {
        if (!val) {
            return "'Y'";
        } else {
            return "'N'";
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
    if (!data) return null;
    var props = this._models[model].properties;
    var json = {};
    for (var p in props) {
        var key = this.column(model, p);
        // console.log(data);
        var val = data[key];
        // console.log(key, val);
        var prop = props[p];
        if (prop && prop.type && prop.type.name === 'Boolean') {
            json[p] = (val === 'Y' || val === 'y' || val === 'T' || val === 't' || val === '1');
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
    return name.toUpperCase();
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
    return '"' + name.replace(/\./g, '"."').toUpperCase() + '"';
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
 * @param {Function} [callback] The callback function
 */
PostgreSQL.prototype.all = function all(model, filter, callback) {
    // Order by id if no order is specified
    filter = filter || {};
    if (!filter.order) {
        var idNames = this.idNames(model);
        if (idNames && idNames.length) {
            filter.order = idNames.join(' ');
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
            pagination.push('OFFSET ' + (offset + 1));
        } else {
            offset = 0;
        }
        var limit = Number(filter.limit);
        if (limit) {
            pagination.push('LIMIT ' + (offset + limit));
        }
    }
    return pagination;
}

/*!
 * Build the SQL clause
 * @param {String} model The model name
 * @param {Object} filter The filter
 * @returns {*}
 */
PostgreSQL.prototype.toFilter = function (model, filter) {
    if (filter && typeof filter.where === 'function') {
        return this.tableEscaped(model) + ' ' + filter.where();
    }
    if (!filter) return this.tableEscaped(model);
    var props = this._models[model].properties;
    var out = '';

    // First check the pagination requirements
    // http://docs.postgresql.com/cd/B19306_01/server.102/b14200/functions137.htm#i86310
    var pagination = getPagination(filter);

    var self = this;
    var fields = [];
    if (filter.where) {
        var conds = filter.where;
        if (typeof conds === 'string') {
            fields.push(conds);
        } else if (util.isArray(conds)) {
            var query = conds.shift().replace(/\?/g, function (s) {
                return escape(conds.shift());
            });
            fields.push(query);
        } else {
            Object.keys(conds).forEach(function (key) {
                if (filter.where[key] && filter.where[key].constructor.name === 'RegExp') {
                    var regex = filter.where[key];
                    var sqlCond = self.columnEscaped(model, key);

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
                    var filterValue = this.toDatabase(props[key], filter.where[key]);
                    if (filterValue === 'NULL') {
                        fields.push(self.columnEscaped(model, key) + ' IS ' + filterValue);
                    } else if (conds[key].constructor.name === 'Object') {
                        var condType = Object.keys(conds[key])[0];
                        var sqlCond = self.columnEscaped(model, key);
                        if ((condType == 'inq' || condType == 'nin') && filterValue.length == 0) {
                            fields.push(condType == 'inq' ? '1 = 2' : '1 = 1');
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
                                break;
                            case 'nlike':
                                sqlCond += ' NOT LIKE ';
                                break;
                            default:
                                sqlCond += ' ' + condType + ' ';
                                break;
                        }
                        sqlCond += (condType == 'inq' || condType == 'nin') ? '(' + filterValue + ')' : filterValue;
                        fields.push(sqlCond);
                    } else {
                        fields.push(self.columnEscaped(model, key) + ' = ' + filterValue);
                    }
                }
            }.bind(this));
        }

        if (fields.length) {
            out += ' WHERE ' + fields.join(' AND ');
        }
    }

    if (filter.order) {
        var orderBy = '';
        var t = filter.order.split(/[\s,]+/);
        filter.order = [];
        t.forEach(function (token) {
            if (token.match(/ASC|DESC/i)) {
                filter.order[filter.order.length - 1] += ' ' + token;
            } else {
                filter.order.push(self.columnEscaped(model, token));
            }
        });
        orderBy = ' ORDER BY ' + filter.order.join(',');
        if (pagination.length) {
            out = 'SELECT '
                + this.getColumns(model) + ' FROM ' + this.tableEscaped(model) + out + ' '
                + orderBy + ' ' + pagination.join(' ');
        } else {
            out = this.tableEscaped(model) + ' ' + out + ' ' + orderBy;
        }
    } else {
        if (pagination.length) {
            out = 'SELECT '
                + this.getColumns(model) + ' FROM ' + this.tableEscaped(model) + out + ' '
                + pagination.join(' ');
        } else {
            out = this.tableEscaped(model) + ' ' + out;
        }
    }

    return out;
};

/**
 * Check if a model instance exists by id
 * @param {String} model The model name
 * @param {*} id The id value
 * @param {Function} [callback] The callback function
 *
 */
PostgreSQL.prototype.exists = function (model, id, callback) {
    var sql = 'SELECT 1 FROM ' +
        this.tableEscaped(model);

    if (id) {
        sql += ' WHERE ' + this.idColumnEscaped(model) + ' = ' + id + ' AND ROWNUM <= 1';
    } else {
        sql += ' WHERE ' + this.idColumnEscaped(model) + ' IS NULL AND ROWNUM <= 1';
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
 * @param {Function} [callback] The callback function
 */
PostgreSQL.prototype.find = function find(model, id, callback) {
    var sql = 'SELECT * FROM ' +
        this.tableEscaped(model);

    if (id) {
        var idVal = this.toDatabase(this._models[model].properties[this.idName(model)], id);
        sql += ' WHERE ' + this.idColumnEscaped(model) + ' = ' + idVal + ' AND ROWNUM <= 1';
    }
    else {
        sql += ' WHERE ' + this.idColumnEscaped(model) + ' IS NULL AND ROWNUM <= 1';
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

    this.query('SELECT column_name AS "column", data_type AS "type", nullable AS "nullable"' // , data_default AS "Default"'
        + ' FROM "SYS"."USER_TAB_COLUMNS" WHERE table_name=\'' + this.table(model) + '\'', decoratedCallback);

}

/*!
 * Create a SQL statement that supports pagination
 * @param {String} sql The SELECT statement that supports pagination
 * @param {String} orderBy The 'order by' columns
 * @param {Object} options options
 * @returns {String} The SQL statement
 */
function paginateSQL(sql, orderBy, options) {
    var pagination = getPagination(options);
    orderBy = orderBy || '1';
    if (pagination.length) {
        return 'SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY ' + orderBy + ') R, ' + sql.substring(7) + ') WHERE ' + pagination.join(' AND ');
    } else {
        return sql;
    }
}

/*!
 * Build sql for listing tables
 * @param {Object} options {all: for all owners, owner: for a given owner}
 * @returns {String} The sql statement
 */
function queryTables(options) {
    var sqlTables = null;
    var owner = options.owner || options.schema;

    if (options.all && !owner) {
        sqlTables = paginateSQL('SELECT \'table\' AS "type", table_name AS "name", owner AS "owner"'
            + ' FROM all_tables', 'owner, table_name', options);
    } else if (owner) {
        sqlTables = paginateSQL('SELECT \'table\' AS "type", table_name AS "name", owner AS "owner"'
            + ' FROM all_tables WHERE owner=\'' + owner + '\'', 'owner, table_name', options);
    } else {
        sqlTables = paginateSQL('SELECT \'table\' AS "type", table_name AS "name",'
            + ' SYS_CONTEXT(\'USERENV\', \'SESSION_USER\') AS "owner" FROM user_tables',
            'table_name', options);
    }
    return sqlTables;
}

/*!
 * Build sql for listing views
 * @param {Object} options {all: for all owners, owner: for a given owner}
 * @returns {String} The sql statement
 */
function queryViews(options) {
    var sqlViews = null;
    if (options.views) {

        var owner = options.owner || options.schema;

        if (options.all && !owner) {
            sqlViews = paginateSQL('SELECT \'view\' AS "type", view_name AS "name",'
                + ' owner AS "owner" FROM all_views',
                'owner, view_name', options);
        } else if (owner) {
            sqlViews = paginateSQL('SELECT \'view\' AS "type", view_name AS "name",'
                + ' owner AS "owner" FROM all_views WHERE owner=\'' + owner + '\'',
                'owner, view_name', options);
        } else {
            sqlViews = paginateSQL('SELECT \'view\' AS "type", view_name AS "name",'
                + ' SYS_CONTEXT(\'USERENV\', \'SESSION_USER\') AS "owner" FROM user_views',
                'view_name', options);
        }
    }
    return sqlViews;
}

/**
 * Discover model definitions
 *
 * @param {Object} options Options for discovery
 * @param {Function} [cb] The callback function
 */
PostgreSQL.prototype.discoverModelDefinitions = function (options, cb) {
    if (!cb && typeof options === 'function') {
        cb = options;
        options = {};
    }
    options = options || {};

    var self = this;
    var calls = [function (callback) {
        self.query(queryTables(options), callback);
    }];

    if (options.views) {
        calls.push(function (callback) {
            self.query(queryViews(options), callback);
        });
    }
    async.parallel(calls, function (err, data) {
        if (err) {
            cb(err, data);
        } else {
            var merged = [];
            merged = merged.concat(data.shift());
            if (data.length) {
                merged = merged.concat(data.shift());
            }
            cb(err, merged);
        }
    });
};


/*!
 * Normalize the arguments
 * @param {String} table The table name
 * @param {Object} [options] The options object
 * @param {Function} [cb] The callback function
 */
function getArgs(table, options, cb) {
    if ('string' !== typeof table || !table) {
        throw new Error('table is a required string argument: ' + table);
    }
    options = options || {};
    if (!cb && 'function' === typeof options) {
        cb = options;
        options = {};
    }
    if (typeof options !== 'object') {
        throw new Error('options must be an object: ' + options);
    }
    return {
        owner: options.owner || options.schema,
        table: table,
        options: options,
        cb: cb
    };
}

/*!
 * Build the sql statement to query columns for a given table
 * @param {String} owner The DB owner/schema name
 * @param {String} table The table name
 * @returns {String} The sql statement
 */
function queryColumns(owner, table) {
    var sql = null;
    if (owner) {
        sql = paginateSQL('SELECT owner AS "owner", table_name AS "tableName", column_name AS "columnName", data_type AS "dataType",'
            + ' data_length AS "dataLength", data_precision AS "dataPrecision", data_scale AS "dataScale", nullable AS "nullable"'
            + ' FROM all_tab_columns'
            + ' WHERE owner=\'' + owner + '\''
            + (table ? ' AND table_name=\'' + table + '\'' : ''),
            'table_name, column_id', {});
    } else {
        sql = paginateSQL('SELECT SYS_CONTEXT(\'USERENV\', \'SESSION_USER\') AS "owner", table_name AS "tableName", column_name AS "columnName", data_type AS "dataType",'
            + ' data_length AS "dataLength", data_precision AS "dataPrecision", data_scale AS "dataScale", nullable AS "nullable"'
            + ' FROM user_tab_columns'
            + (table ? ' WHERE table_name=\'' + table + '\'' : ''),
            'table_name, column_id', {});
    }
    return sql;
}

/**
 * Discover model properties from a table
 * @param {String} table The table name
 * @param {Object} options The options for discovery
 * @param {Function} [cb] The callback function
 *
 */
PostgreSQL.prototype.discoverModelProperties = function (table, options, cb) {
    var args = getArgs(table, options, cb);
    var owner = args.owner;
    table = args.table;
    options = args.options;
    cb = args.cb;

    var sql = queryColumns(owner, table);
    var callback = function (err, results) {
        if (err) {
            cb(err, results);
        } else {
            results.map(function (r) {
                r.type = postgresqlDataTypeToJSONType(r.dataType, r.dataLength);
            });
            cb(err, results);
        }
    };
    this.query(sql, callback);
}


/*!
 * Build the sql statement for querying primary keys of a given table
 * @param owner
 * @param table
 * @returns {String}
 */
// http://docs.postgresql.com/javase/6/docs/api/java/sql/DatabaseMetaData.html#getPrimaryKeys(java.lang.String, java.lang.String, java.lang.String)
function queryForPrimaryKeys(owner, table) {
    var sql = 'SELECT uc.owner AS "owner", '
        + 'uc.table_name AS "tableName", col.column_name AS "columnName", col.position AS "keySeq", uc.constraint_name AS "pkName" FROM'
        + (owner ? ' ALL_CONSTRAINTS uc, ALL_CONS_COLUMNS col' : ' USER_CONSTRAINTS uc, USER_CONS_COLUMNS col')
        + ' WHERE uc.constraint_type=\'P\' AND uc.constraint_name=col.constraint_name';

    if (owner) {
        sql += ' AND uc.owner=\'' + owner + '\'';
    }
    if (table) {
        sql += ' AND uc.table_name=\'' + table + '\'';
    }
    sql += ' ORDER BY uc.owner, col.constraint_name, uc.table_name, col.position';
    return sql;
}

/**
 * Discover primary keys for a given table
 * @param {String} table The table name
 * @param {Object} options The options for discovery
 * @param {Function} [cb] The callback function
 */
PostgreSQL.prototype.discoverPrimaryKeys = function (table, options, cb) {
    var args = getArgs(table, options, cb);
    var owner = args.owner;
    table = args.table;
    options = args.options;
    cb = args.cb;

    var sql = queryForPrimaryKeys(owner, table);
    this.query(sql, cb);
}


/*!
 * Build the sql statement for querying foreign keys of a given table
 * @param {String} owner The DB owner/schema name
 * @param {String} table The table name
 * @returns {String} The SQL statement to find foreign keys
 */
function queryForeignKeys(owner, table) {
    var sql =
        'SELECT a.owner AS "fkOwner", a.constraint_name AS "fkName", a.table_name AS "fkTableName",'
            + ' a.column_name AS "fkColumnName", a.position AS "keySeq",'
            + ' jcol.owner AS "pkOwner", jcol.constraint_name AS "pkName",'
            + ' jcol.table_name AS "pkTableName", jcol.column_name AS "pkColumnName"'
            + ' FROM'
            + ' (SELECT'
            + ' uc.owner, uc.table_name, uc.constraint_name, uc.r_constraint_name, col.column_name, col.position'
            + ' FROM'
            + (owner ? ' ALL_CONSTRAINTS uc, ALL_CONS_COLUMNS col' : ' USER_CONSTRAINTS uc, USER_CONS_COLUMNS col')
            + ' WHERE'
            + ' uc.constraint_type=\'R\' and uc.constraint_name=col.constraint_name';
    if (owner) {
        sql += ' AND uc.owner=\'' + owner + '\'';
    }
    if (table) {
        sql += ' AND uc.table_name=\'' + table + '\'';
    }
    sql += ' ) a'
        + ' INNER JOIN'
        + ' USER_CONS_COLUMNS jcol'
        + ' ON'
        + ' a.r_constraint_name=jcol.constraint_name';
    return sql;
}

/**
 * Discover foreign keys for a given table
 * @param {String} table The table name
 * @param {Object} options The options for discovery
 * @param {Function} [cb] The callback function
 */
PostgreSQL.prototype.discoverForeignKeys = function (table, options, cb) {
    var args = getArgs(table, options, cb);
    var owner = args.owner;
    table = args.table;
    options = args.options;
    cb = args.cb;

    var sql = queryForeignKeys(owner, table);
    this.query(sql, cb);
};

/*!
 * Retrieves a description of the foreign key columns that reference the given table's primary key columns (the foreign keys exported by a table).
 * They are ordered by fkTableOwner, fkTableName, and keySeq.
 * @param {String} owner The DB owner/schema name
 * @param {String} table The table name
 * @returns {String} The SQL statement
 */
function queryExportedForeignKeys(owner, table) {
    var sql = 'SELECT a.constraint_name AS "fkName", a.owner AS "fkOwner", a.table_name AS "fkTableName",'
        + ' a.column_name AS "fkColumnName", a.position AS "keySeq",'
        + ' jcol.constraint_name AS "pkName", jcol.owner AS "pkOwner",'
        + ' jcol.table_name AS "pkTableName", jcol.column_name AS "pkColumnName"'
        + ' FROM'
        + ' (SELECT'
        + ' uc1.table_name, uc1.constraint_name, uc1.r_constraint_name, col.column_name, col.position, col.owner'
        + ' FROM'
        + (owner ? ' ALL_CONSTRAINTS uc, ALL_CONSTRAINTS uc1, ALL_CONS_COLUMNS col' : ' USER_CONSTRAINTS uc, USER_CONSTRAINTS uc1, USER_CONS_COLUMNS col')
        + ' WHERE'
        + ' uc.constraint_type=\'P\' and uc1.r_constraint_name = uc.constraint_name and uc1.constraint_type = \'R\''
        + ' and uc1.constraint_name=col.constraint_name';
    if (owner) {
        sql += ' and col.owner=\'' + owner + '\'';
    }
    if (table) {
        sql += ' and uc.table_Name=\'' + table + '\'';
    }
    sql += ' ) a'
        + ' INNER JOIN'
        + ' USER_CONS_COLUMNS jcol'
        + ' ON'
        + ' a.r_constraint_name=jcol.constraint_name'
        + ' order by a.owner, a.table_name, a.position';

    return sql;
}

/**
 * Discover foreign keys that reference to the primary key of this table
 * @param {String} table The table name
 * @param {Object} options The options for discovery
 * @param {Function} [cb] The callback function
 */
PostgreSQL.prototype.discoverExportedForeignKeys = function (table, options, cb) {
    var args = getArgs(table, options, cb);
    var owner = args.owner;
    table = args.table;
    options = args.options;
    cb = args.cb;

    var sql = queryExportedForeignKeys(owner, table);
    this.query(sql, cb);
};

/**
 * Perform autoupdate for the given models
 * @param {String[]} [models] A model name or an array of model names. If not present, apply to all models
 * @param {Function} [cb] The callback function
 */
PostgreSQL.prototype.autoupdate = function (models, cb) {
    var self = this;
    var wait = 0;
    if ((!cb) && ('function' === typeof models)) {
        cb = models;
        models = undefined;
    }
    // First argument is a model name
    if ('string' === typeof models) {
        models = [models];
    }

    models = models || Object.keys(this._models);

    models.forEach(function (model) {
        if (model in self._models) {
            wait++;
            getTableStatus.call(self, model, function (err, fields) {
                if (!err && fields.length) {
                    self.alterTable(model, fields, done);
                } else {
                    self.createTable(model, done);
                }
            });
        }
    });

    function done(err) {
        if (err) {
            console.error(err);
        }
        if (--wait === 0 && cb) {
            cb();
        }
    }
};

/**
 * Check if the models exist
 * @param {String[]} [models] A model name or an array of model names. If not present, apply to all models
 * @param {Function} [cb] The callback function
 */
PostgreSQL.prototype.isActual = function (models, cb) {
    var self = this;
    var wait = 0;

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
    models.forEach(function (model) {
        wait += 1;
        getTableStatus.call(self, model, function (err, fields) {
            changes = changes.concat(getAddModifyColumns.call(self, model, fields));
            changes = changes.concat(getDropColumns.call(self, model, fields));
            done(err, changes);
        });
    });

    function done(err, fields) {
        if (err) {
            console.log(err);
        }
        if (--wait === 0 && cb) {
            var actual = (changes.length === 0);
            cb(null, actual);
        }
    }
};

/**
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
    sql = sql.concat(getPropertiesToModify.call(self, model, actualFields));
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
            sql.push(addPropertyToActual.call(self, model, propName));
        }
    });
    if (sql.length > 0) {
        sql = ['ADD', '(' + sql.join(',') + ')'];
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
                sql.push(modifyDatatypeInActual.call(self, model, propName));
            }
            if (nullabilityChanged(propName, found)) {
                sql.push(modifyNullabilityInActual.call(self, model, propName));
            }
        }
    });

    if (sql.length > 0) {
        sql = ['MODIFY', '(' + sql.join(',') + ')'];
    }
    return sql;

    function datatypeChanged(propName, oldSettings) {
        var newSettings = m.properties[propName];
        if (!newSettings) {
            return false;
        }
        return oldSettings.type.toUpperCase() !== self.columnDataType(model, propName);
    }

    function nullabilityChanged(propName, oldSettings) {
        var newSettings = m.properties[propName];
        if (!newSettings) {
            return false;
        }
        var changed = false;
        if (oldSettings.nullable === 'Y' && (newSettings.allowNull === false || newSettings.null === false)) changed = true;
        if (oldSettings.nullable === 'N' && !(newSettings.allowNull === false || newSettings.null === false)) changed = true;
        return changed;
    }
}

function modifyDatatypeInActual(model, propName) {
    var self = this;
    var sqlCommand = self.columnEscaped(model, propName) + ' ' + self.columnDataType(model, propName);
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
            sql.push(self.escapeName(actualField.column));
        }
    });
    if (sql.length > 0) {
        sql = ['DROP', '(' + sql.join(',') + ')'];
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
    var result = self.columnDataType(model, propName);
    if (!propertyCanBeNull.call(self, model, propName)) result = result + ' NOT NULL';
    return result;
};

/**
 * Drop a table for the given model
 * @param {String} model The model name
 * @param {Function} [cb] The callback function
 */
PostgreSQL.prototype.dropTable = function (model, cb) {
    var self = this;
    var name = self.tableEscaped(model);
    var seqName = self.escapeName(model + '_ID_SEQUENCE');
    var triggerName = self.escapeName(model + '_ID_TRIGGER');

    var count = 0;
    var dropTableFun = function (callback) {
        self.query('DROP TABLE ' + name, function (err, data) {
            if (err && err.toString().indexOf('ORA-00054') >= 0) {
                count++;
                if (count <= 5) {
                    self.debug('Retrying ' + count + ': ' + err);
                    // Resource busy, try again
                    setTimeout(dropTableFun, 200 * Math.pow(count, 2));
                    return;
                }
            }
            if (err && err.toString().indexOf('ORA-00942') >= 0) {
                err = null; // Ignore it
            }
            callback(err, data);
        });
    };

    async.series([dropTableFun,

        function (callback) {
            self.query('DROP SEQUENCE ' + seqName, callback);
        },

        function (callback) {
            self.query('DROP TRIGGER ' + triggerName, callback);
        }], cb);
};

/**
 * Create a table for the given model
 * @param {String} model The model name
 * @param {Function} [cb] The callback function
 */
PostgreSQL.prototype.createTable = function (model, cb) {
    var self = this;
    var name = self.tableEscaped(model);
    var seqName = self.escapeName(model + '_ID_SEQUENCE');
    var triggerName = self.escapeName(model + '_ID_TRIGGER');

    async.series([
        function (callback) {
            self.query('CREATE TABLE ' + name + ' (\n  ' + self.propertiesSQL(model) + '\n)', callback);
        },

        function (callback) {
            self.query('CREATE SEQUENCE ' + seqName +
                ' START WITH 1 INCREMENT BY 1 CACHE 100', callback);
        },

        function (callback) {
            self.query('CREATE OR REPLACE TRIGGER ' + triggerName +
                ' BEFORE INSERT ON ' + name + ' FOR EACH ROW \n' +
                'BEGIN\n' +
                '  SELECT ' + seqName + '.NEXTVAL INTO :new.' + self.idColumnEscaped(model) + ' FROM dual;\n' +
                'END;', callback);
        }],
        cb);
};

/**
 * Disconnect from PostgreSQL
 * @param {Function} [cb] The callback function
 */
PostgreSQL.prototype.disconnect = function disconnect(cb) {
    if (this.connection) {
        if (this.settings.debug) {
            this.debug('Disconnecting from ' + this.settings.hostname);
        }
        var conn = this.connection;
        this.connection = null;
        conn.close();  // This is sync
    }

    if (cb) {
        process.nextTick(function () {
            cb && cb();
        });
    }
};

function propertyCanBeNull(model, propName) {
    var p = this._models[model].properties[propName];
    return !(p.allowNull === false || p['null'] === false);
}

function escape(val) {
    if (val === undefined || val === null) {
        return 'NULL';
    }

    switch (typeof val) {
        case 'boolean':
            return (val) ? "'Y'" : "'N'";
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
        case 'String':
        case 'JSON':
            return 'VARCHAR2' + (colLength ? '(' + colLength + ')' : '(1024)');
        case 'Text':
            return 'VARCHAR2' + (colLength ? '(' + colLength + ')' : '(1024)');
        case 'Number':
            return 'NUMBER';
        case 'Date':
            return 'DATE';
        case 'Timestamp':
            return 'TIMESTAMP(3)';
        case 'Boolean':
            return 'CHAR(1)'; // PostgreSQL doesn't have built-in boolean
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
        case 'CHAR':
            if (dataLength === 1) {
                // Treat char(1) as boolean
                return 'Boolean';
            } else {
                return 'String';
            }
        case 'VARCHAR':
        case 'VARCHAR2':
        case 'LONG VARCHAR':
        case 'NCHAR':
        case 'NVARCHAR2':
            return 'String';
        case 'LONG':
        case 'BLOB':
        case 'CLOB':
        case 'NCLOB':
            return 'Binary';
        case 'NUMBER':
        case 'INTEGER':
        case 'DECIMAL':
        case 'DOUBLE':
        case 'FLOAT':
        case 'BIGINT':
        case 'SMALLINT':
        case 'REAL':
        case 'NUMERIC':
        case 'BINARY_FLOAT':
        case 'BINARY_DOUBLE':
        case 'UROWID':
        case 'ROWID':
            return 'Number';
        case 'DATE':
        case 'TIMESTAMP':
            return 'Date';
        default:
            return 'String';
    }
}

function mapPostgreSQLDatatypes(typeName) {
    //TODO there are a lot of synonymous type names that should go here-- this is just what i've run into so far
    switch (typeName) {
        case 'int4':
            return 'NUMBER';
        case 'bool':
            return 'CHAR(1)';
        default:
            return typeName;
    }
}

function propertyHasNotBeenDeleted(model, propName) {
    return !!this._models[model].properties[propName];
}
