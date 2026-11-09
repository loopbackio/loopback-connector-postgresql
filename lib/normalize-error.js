'use strict';

/**
 * Normalizes PostgreSQL-specific error codes (SQLSTATE) to standard, protocol-neutral domain codes.
 */
module.exports = function(err) {
  if (!err || !err.code) return err;

  // PostgreSQL uses 5-character SQLSTATE error codes
  switch (err.code) {
    // 1. Data Integrity & Constraints
    case '23505': // unique_violation
      err.code = 'UNIQUE_CONSTRAINT_VIOLATION';
      break;
    case '23503': // foreign_key_violation
    case '23P01': // exclusion_violation
      err.code = 'FOREIGN_KEY_VIOLATION';
      break;
    case '23502': // not_null_violation
      err.code = 'NOT_NULL_VIOLATION';
      break;
    case '23514': // check_violation
      err.code = 'CHECK_CONSTRAINT_VIOLATION';
      break;

    // 2. Schema & Object Definitions
    case '42P01': // undefined_table
      err.code = 'TABLE_NOT_FOUND';
      break;
    case '42703': // undefined_column
      err.code = 'COLUMN_NOT_FOUND';
      break;

    // 3. Data Formatting & Types
    case '22001': // string_data_right_truncation
    case '22003': // numeric_value_out_of_range
    case '22P02': // invalid_text_representation
      err.code = 'DATA_TYPE_MISMATCH';
      break;

    // 4. Concurrency & Execution
    case '40001': // serialization_failure
    case '40P01': // deadlock_detected
    case '55P03': // lock_not_available
      err.code = 'LOCK_CONFLICT';
      break;
    case '57014': // query_canceled
      err.code = 'QUERY_TIMEOUT';
      break;
    case '42601': // syntax_error
      err.code = 'SYNTAX_ERROR';
      break;

    // 5. Infrastructure & Connection
    case '08000': // connection_exception
    case '08003': // connection_does_not_exist
    case '08006': // connection_failure
    case '57P01': // admin_shutdown
    case '57P02': // crash_shutdown
    case '57P03': // cannot_connect_now
      err.code = 'CONNECTION_FAILURE';
      break;
  }
  return err;
};
