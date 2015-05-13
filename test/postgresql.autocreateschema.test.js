var should = require('should'),
  assert = require('assert');
var Another, Post, db;

describe('Autocreate schema if not exists', function() {
  before(function() {
    db = getDataSource();

    Post = db.define('PostInCustomSchema', {
      created: {
        type: 'Date'
      }
    }, {
      postgresql: {
        schema: 'myschema'
      }
    });

    Another = db.define('PostInDefaultSchema', {
      created: {
        type: 'Date'
      }
    });
  });

  it('should run migration for custom schema objects', function(done) {
    db.automigrate('PostInCustomSchema', function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should run migration for default schema objects', function(done) {
    db.automigrate('PostInDefaultSchema', function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should have new schema in place', function(done) {
    var query = "select table_schema, column_name, data_type," +
      " character_maximum_length, column_default " +
      "from information_schema.columns where table_name = 'postincustomschema'" +
      " and column_name='created'";

    db.connector.execute(query, function(err, results) {
      assert.equal(results[0].table_schema, "myschema");
      done(err);
    });
  });
})
