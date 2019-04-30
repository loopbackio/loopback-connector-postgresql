// Copyright IBM Corp. 2013,2016. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';
var juggler = require('loopback-datasource-juggler');
var CreateDS = juggler.DataSource;

require('./init');
var async = require('async');
var should = require('should');

var Post, Expense, db, created, PostWithDate;

describe('lazyConnect', function() {
  it('should skip connect phase (lazyConnect = true)', function(done) {
    var dsConfig = {
      host: '127.0.0.1',
      port: 4,
      lazyConnect: true,
      debug: false,
    };
    var ds = getDS(dsConfig);

    var errTimeout = setTimeout(function() {
      done();
    }, 2000);
    ds.on('error', function(err) {
      clearTimeout(errTimeout);
      done(err);
    });
  });

  it('should report connection error (lazyConnect = false)', function(done) {
    var dsConfig = {
      host: '127.0.0.1',
      port: 4,
      lazyConnect: false,
      debug: false,
    };
    var ds = getDS(dsConfig);

    ds.on('error', function(err) {
      err.message.should.containEql('ECONNREFUSED');
      done();
    });
  });
});

var getDS = function(config) {
  var db = new CreateDS(require('../'), config);
  return db;
};

describe('postgresql connector', function() {
  before(function() {
    db = getDataSource();

    Post = db.define('PostWithBoolean', {
      title: {type: String, length: 255, index: true},
      content: {type: String},
      loc: 'GeoPoint',
      created: Date,
      approved: Boolean,
    });
    created = new Date();
  });

  after(function(done) {
    Post.destroyAll(done);
  });

  describe('Explicit datatype', function() {
    before(function(done) {
      db = getDataSource();

      Expense = db.define('Expense', {
        id: {
          type: Number,
          id: true,
          required: true,
          postgresql: {
            dataType: 'NUMERIC',
            dataPrecision: 3,
          },
        },
        description: {
          type: String,
        },
        amount: {
          type: Number,
          required: true,
          postgresql: {
            dataType: 'DECIMAL',
            dataPrecision: 10,
            dataScale: 2,
          },
        },
      });
      db.automigrate(done);
    });

    it('create instance with explicit datatype', function(done) {
      Expense.create(data, function(err, result) {
        should.not.exist(err);
        should.exist(result);
        should.equal(result.length, data.length);
        done();
      });
    });

    it('find instance with a decimal datatype', function(done) {
      Expense.find({where: {amount: 159.99}}, function(err, result) {
        should.not.exist(err);
        should.exist(result);
        should.equal(result.length, 1);
        // need to parseFloat the amount value since it is returned as a string
        // because loopback does not have a known "decimal" datatype
        should.deepEqual(parseFloat(result[0].__data.amount), data[0].amount);
        done();
      });
    });

    it('find instance with a numeric datatype', function(done) {
      Expense.find({where: {id: 258}}, function(err, result) {
        should.not.exist(err);
        should.exist(result);
        should.equal(result.length, 1);
        should.deepEqual(parseInt(result[0].__data.id), data[2].id);
        done();
      });
    });
  });

  it('should run migration', function(done) {
    db.automigrate('PostWithBoolean', function() {
      done();
    });
  });

  var post;
  it('should support boolean types with true value', function(done) {
    Post.create(
      {title: 'T1', content: 'C1', approved: true, created: created},
      function(err, p) {
        should.not.exists(err);
        post = p;
        Post.findById(p.id, function(err, p) {
          should.not.exists(err);
          p.should.have.property('approved', true);
          p.created.getTime().should.be.eql(created.getTime());
          done();
        });
      });
  });

  it('should preserve property `count` after query execution', function(done) {
    Post.create(
      {title: 'T10', content: 'C10'},
      function(err, p) {
        if (err) return done(err);
        post = p;
        var query = "UPDATE PostWithBoolean SET title ='T20' WHERE id=" + post.id;
        db.connector.execute(query, function(err, results) {
          results.should.have.property('count', 1);
          results.should.have.property('affectedRows', 1);
          done(err);
        });
      });
  });

  it('should support `rows` if RETURNING used after UPDATE', function(done) {
    Post.create(
      {title: 'rows returned from update', content: 'Content'},
      function(err, p) {
        if (err) return done(err);
        post = p;
        var query = 'UPDATE PostWithBoolean SET title =\'something else\' WHERE id=' + post.id + ' RETURNING id';
        db.connector.execute(query, function(err, results) {
          results.should.have.property('count', 1);
          results.should.have.property('affectedRows', 1);
          results.rows[0].id.should.eql(post.id);
          done(err);
        });
      });
  });

  it('should support updating boolean types with false value', function(done) {
    Post.update({id: post.id}, {approved: false}, function(err) {
      should.not.exists(err);
      Post.findById(post.id, function(err, p) {
        should.not.exists(err);
        p.should.have.property('approved', false);
        done();
      });
    });
  });

  it('should support boolean types with false value', function(done) {
    Post.create(
      {title: 'T2', content: 'C2', approved: false, created: created},
      function(err, p) {
        should.not.exists(err);
        post = p;
        Post.findById(p.id, function(err, p) {
          should.not.exists(err);
          p.should.have.property('approved', false);
          done();
        });
      });
  });

  it('should support date types with eq', function(done) {
    Post.find({
      where: {created: created},
    }, function(err, posts) {
      if (err) return done(err);
      posts.length.should.eql(2);
      done();
    });
  });

  it('should support date types with between', function(done) {
    Post.find({
      where: {
        created: {
          between: [new Date(Date.now() - 5000), new Date(Date.now() + 5000)],
        }},
    }, function(err, posts) {
      if (err) return done(err);
      posts.length.should.eql(2);
      done();
    });
  });

  it('should return the model instance for upsert', function(done) {
    Post.upsert({id: post.id, title: 'T2_new', content: 'C2_new',
      approved: true}, function(err, p) {
      p.should.have.property('id', post.id);
      p.should.have.property('title', 'T2_new');
      p.should.have.property('content', 'C2_new');
      p.should.have.property('approved', true);
      done();
    });
  });

  it('should return the model instance for upsert when id is not present',
    function(done) {
      Post.upsert({title: 'T2_new', content: 'C2_new', approved: true},
        function(err, p) {
          p.should.have.property('id');
          p.should.have.property('title', 'T2_new');
          p.should.have.property('content', 'C2_new');
          p.should.have.property('approved', true);
          done();
        });
    });

  it('should escape number values to defect SQL injection in findById',
    function(done) {
      Post.findById('(SELECT 1+1)', function(err, p) {
        should.exists(err);
        done();
      });
    });

  it('should escape number values to defect SQL injection in find',
    function(done) {
      Post.find({where: {id: '(SELECT 1+1)'}}, function(err, p) {
        should.exists(err);
        done();
      });
    });

  it('should escape number values to defect SQL injection in find with gt',
    function(done) {
      Post.find({where: {id: {gt: '(SELECT 1+1)'}}}, function(err, p) {
        should.exists(err);
        done();
      });
    });

  it('should escape number values to defect SQL injection in find',
    function(done) {
      Post.find({limit: '(SELECT 1+1)'}, function(err, p) {
        should.exists(err);
        done();
      });
    });

  it('should escape number values to defect SQL injection in find with inq',
    function(done) {
      Post.find({where: {id: {inq: ['(SELECT 1+1)']}}}, function(err, p) {
        should.exists(err);
        done();
      });
    });

  context('GeoPoint types', function() {
    var GeoPoint = juggler.ModelBuilder.schemaTypes.geopoint;
    var loc;

    it('should support GeoPoint types', function(done) {
      loc = new GeoPoint({lng: 10, lat: 20});
      Post.create({title: 'T1', content: 'C1', loc: loc}, function(err, p) {
        should.not.exists(err);
        Post.findById(p.id, function(err, p) {
          should.not.exists(err);
          p.loc.lng.should.be.eql(10);
          p.loc.lat.should.be.eql(20);
          done();
        });
      });
    });

    it('should support simple where filter', function(done) {
      loc = new GeoPoint({lng: 5, lat: -10});
      Post.create({title: 'T2', content: 'C2', loc: loc}, function(err, p) {
        should.not.exists(err);
        Post.find({where: {loc: loc}}, function(err, post) {
          should.not.exist(err);
          should.exist(post);
          post.length.should.equal(1);
          should.exist(post[0].loc);
          post[0].loc.lng.should.equal(loc.lng);
          post[0].loc.lat.should.equal(loc.lat);
          done();
        });
      });
    });

    it('should support complicated where filter', function(done) {
      Post.find({where: {and: [{loc: loc}, {title: {like: '%t%'}}]}}, function(err, post) {
        should.not.exist(err);
        should.exist(post);
        post.length.should.equal(0);
        done();
      });
    });
  });

  context('pattern matching operators', function() {
    before(deleteTestFixtures);
    before(createTestFixtures);

    it('supports case sensitive queries using like', function(done) {
      Post.find({where: {content: {like: '%TestCase%'}}}, function(err, posts) {
        if (err) return done(err);
        posts.length.should.equal(1);
        posts[0].content.should.equal('T1_TestCase');
        done();
      });
    });

    it('rejects case insensitive queries using like', function(done) {
      Post.find({where: {content: {like: '%tesTcasE%'}}}, function(err, posts) {
        if (err) return done(err);
        posts.length.should.equal(0);
        done();
      });
    });

    it('supports like for no match', function(done) {
      Post.find({where: {content: {like: '%TestXase%'}}}, function(err, posts) {
        if (err) return done(err);
        posts.length.should.equal(0);
        done();
      });
    });

    it('supports negative case sensitive queries using nlike', function(done) {
      Post.find({where: {content: {nlike: '%Case%'}}}, function(err, posts) {
        if (err) return done(err);
        posts.length.should.equal(0);
        done();
      });
    });

    it('rejects negative case insensitive queries using nlike', function(done) {
      Post.find({where: {content: {nlike: '%casE%'}}}, function(err, posts) {
        if (err) return done(err);
        posts.length.should.equal(2);
        done();
      });
    });

    it('supports nlike for no match', function(done) {
      Post.find({where: {content: {nlike: '%TestXase%'}}},
        function(err, posts) {
          if (err) return done(err);
          posts.length.should.equal(2);
          done();
        });
    });

    it('supports case insensitive queries using ilike', function(done) {
      Post.find({where: {content: {ilike: '%tesTcasE%'}}},
        function(err, posts) {
          if (err) return done(err);
          posts.length.should.equal(1);
          posts[0].content.should.equal('T1_TestCase');
          done();
        });
    });

    it('supports ilike for no match', function(done) {
      Post.find({where: {content: {ilike: '%tesTxasE%'}}},
        function(err, posts) {
          if (err) return done(err);
          posts.length.should.equal(0);
          done();
        });
    });

    it('supports negative case insensitive queries using nilike',
      function(done) {
        Post.find({where: {content: {nilike: '%casE%'}}}, function(err, posts) {
          if (err) return done(err);
          posts.length.should.equal(0);
          done();
        });
      });

    it('supports nilike for no match', function(done) {
      Post.find({where: {content: {nilike: '%tesTxasE%'}}},
        function(err, posts) {
          if (err) return done(err);
          posts.length.should.equal(2);
          done();
        });
    });

    it('supports like for date types (with explicit typecast)', function(done) {
      PostWithDate.find({where: {created: {like: '%05%'}}}, function(err, result) {
        should.not.exists(err);
        result.length.should.equal(1);
        done();
      });
    });

    it('supports case insensitive queries using ilike for date types (with explicit typecast)', function(done) {
      PostWithDate.find({where: {created: {ilike: '%05%'}}}, function(err, result) {
        should.not.exists(err);
        result.length.should.equal(1);
        done();
      });
    });

    it('supports nlike for no match for date types (with explicit typecast)', function(done) {
      PostWithDate.find({where: {content: {nlike: '%07%'}}},
        function(err, posts) {
          should.not.exists(err);
          posts.length.should.equal(2);
          done();
        });
    });

    it('supports case insensitive queries using nilike for date types (with explicit typecast)', function(done) {
      PostWithDate.find({where: {created: {nilike: '%07%'}}}, function(err, result) {
        should.not.exists(err);
        result.length.should.equal(2);
        done();
      });
    });

    function deleteTestFixtures(done) {
      Post.destroyAll(function(err) {
        should.not.exist(err);
        if (PostWithDate) PostWithDate.destroyAll(done);
        done();
      });
    }

    function createTestFixtures(done) {
      PostWithDate = db.define('PostWithDate', {
        title: {type: String, length: 255, index: true},
        content: {type: String},
        created: {
          type: String,
          postgresql: {
            dataType: 'timestamp with time zone',
          },
        },
      });
      db.automigrate(function(err, result) {
        if (err) throw err;
        Post.create([{
          title: 't1',
          content: 'T1_TestCase',
        }, {
          title: 't2',
          content: 'T2_TheOtherCase',
        }], function(err, result) {
          should.not.exist(err);
          PostWithDate.create([
            {
              title: 'Title 1',
              content: 'Content 1',
              created: '2017-05-17 12:00:01',
            },
            {
              title: 'Title 2',
              content: 'Content 2',
              created: '2017-04-17 12:00:01',
            },
          ], done);
        });
      });
    }
  });

  context('regexp operator', function() {
    before(function deleteTestFixtures(done) {
      Post.destroyAll(done);
    });
    before(function createTestFixtures(done) {
      Post.create([{
        title: 'a',
        content: 'AAA',
      }, {
        title: 'b',
        content: 'BBB',
      }], done);
    });
    after(function deleteTestFixtures(done) {
      Post.destroyAll(done);
    });

    context('with regex strings', function() {
      context('using no flags', function() {
        it('should work', function(done) {
          Post.find({where: {content: {regexp: '^A'}}}, function(err, posts) {
            should.not.exist(err);
            posts.length.should.equal(1);
            posts[0].content.should.equal('AAA');
            done();
          });
        });
      });

      context('using flags', function() {
        beforeEach(function addSpy() {
          sinon.stub(console, 'warn');
        });
        afterEach(function removeSpy()  {
          console.warn.restore();
        });

        it('should work', function(done) {
          Post.find({where: {content: {regexp: '^a/i'}}}, function(err, posts) {
            should.not.exist(err);
            posts.length.should.equal(1);
            posts[0].content.should.equal('AAA');
            done();
          });
        });

        it('should print a warning when the global flag is set',
            function(done) {
              Post.find({where: {content: {regexp: '^a/g'}}}, function(err, posts) {
                console.warn.calledOnce.should.be.ok;
                done();
              });
            });

        it('should print a warning when the multiline flag is set',
            function(done) {
              Post.find({where: {content: {regexp: '^a/m'}}}, function(err, posts) {
                console.warn.calledOnce.should.be.ok;
                done();
              });
            });
      });
    });

    context('with regex literals', function() {
      context('using no flags', function() {
        it('should work', function(done) {
          Post.find({where: {content: {regexp: /^A/}}}, function(err, posts) {
            should.not.exist(err);
            posts.length.should.equal(1);
            posts[0].content.should.equal('AAA');
            done();
          });
        });
      });

      context('using flags', function() {
        beforeEach(function addSpy() {
          sinon.stub(console, 'warn');
        });
        afterEach(function removeSpy()  {
          console.warn.restore();
        });

        it('should work', function(done) {
          Post.find({where: {content: {regexp: /^a/i}}}, function(err, posts) {
            should.not.exist(err);
            posts.length.should.equal(1);
            posts[0].content.should.equal('AAA');
            done();
          });
        });

        it('should print a warning when the global flag is set',
            function(done) {
              Post.find({where: {content: {regexp: /^a/g}}}, function(err, posts) {
                console.warn.calledOnce.should.be.ok;
                done();
              });
            });

        it('should print a warning when the multiline flag is set',
            function(done) {
              Post.find({where: {content: {regexp: /^a/m}}}, function(err, posts) {
                console.warn.calledOnce.should.be.ok;
                done();
              });
            });
      });
    });

    context('with regex objects', function() {
      beforeEach(function addSpy() {
        sinon.stub(console, 'warn');
      });
      afterEach(function removeSpy()  {
        console.warn.restore();
      });

      context('using no flags', function() {
        it('should work', function(done) {
          Post.find({where: {content: {regexp: new RegExp(/^A/)}}},
              function(err, posts) {
                should.not.exist(err);
                posts.length.should.equal(1);
                posts[0].content.should.equal('AAA');
                done();
              });
        });
      });

      context('using flags', function() {
        it('should work', function(done) {
          Post.find({where: {content: {regexp: new RegExp(/^a/i)}}},
              function(err, posts) {
                should.not.exist(err);
                posts.length.should.equal(1);
                posts[0].content.should.equal('AAA');
                done();
              });
        });

        it('should print a warning when the global flag is set',
            function(done) {
              Post.find({where: {content: {regexp: new RegExp(/^a/g)}}},
              function(err, posts) {
                console.warn.calledOnce.should.be.ok;
                done();
              });
            });

        it('should print a warning when the multiline flag is set',
            function(done) {
              Post.find({where: {content: {regexp: new RegExp(/^a/m)}}},
              function(err, posts) {
                console.warn.calledOnce.should.be.ok;
                done();
              });
            });
      });
    });
  });

  context('json data type', function() {
    var Customer;

    before(function(done) {
      db = getDataSource();

      Customer = db.define('Customer', {
        address: {
          type: 'object',
          postgresql: {
            dataType: 'json',
          },
        },
      });

      db.automigrate(function(err) {
        if (err) return done(err);
        Customer.create([{
          address: {
            city: 'Springfield',
            street: {
              number: 42,
            },
          },
        }, {
          address: {
            city: 'Hill Valley',
            street: {
              number: 56,
            },
          },
        }], function(err, customers) {
          return done(err);
        });
      });
    });

    it('allows querying for nested json properties', function(done) {
      Customer.find({
        where: {
          'address.city': 'Hill Valley',
        },
      }, function(err, results) {
        if (err) return done(err);
        results.length.should.eql(1);
        results[0].address.city.should.eql('Hill Valley');
        done();
      });
    });

    it('queries multiple levels of nesting', function(done) {
      Customer.find({
        where: {
          'address.street.number': 56,
        },
      }, function(err, results) {
        if (err) return done(err);
        results.length.should.eql(1);
        results[0].address.city.should.eql('Hill Valley');
        done();
      });
    });

    it('allows ordering by nested json properties', function(done) {
      Customer.find({
        order: ['address.city DESC'],
      }, function(err, results1) {
        if (err) return done(err);
        results1[0].address.city.should.eql('Springfield');
        Customer.find({
          order: ['address.city ASC'],
        }, function(err, results2) {
          if (err) return done(err);
          results2[0].address.city.should.eql('Hill Valley');
          done();
        });
      });
    });
  });
});

describe('Serial properties', function() {
  var db;

  before(function() {
    db = getSchema();
  });

  it('should allow serial properties', function(done) {
    var schema =
      {
        'name': 'TestInventory',
        'options': {
          'idInjection': false,
          'postgresql': {
            'schema': 'public', 'table': 'inventorytest',
          },
        },
        'properties': {
          'productId': {
            'type': 'String', 'required': true, 'id': true,
          },
          'productCode': {
            'type': 'number', 'generated': true,
          },
        },
      };
    var models = db.modelBuilder.buildModels(schema);
    var Model = models['TestInventory'];
    var count = 0;
    Model.attachTo(db);

    db.automigrate(function(err, data) {
      async.series([
        function(callback) {
          Model.destroyAll(callback);
        },
        function(callback) {
          Model.create({productId: 'p001'}, callback);
        },
        function(callback) {
          Model.create({productId: 'p002'}, callback);
        },
        function(callback) {
          Model.findOne({where: {productId: 'p001'}}, function(err, r) {
            r.should.have.property('productId');
            r.should.have.property('productCode', 1);
            callback(null, r);
          });
        },
        function(callback) {
          Model.findOne({where: {productId: 'p002'}}, function(err, r) {
            r.should.have.property('productId');
            r.should.have.property('productCode', 2);
            callback(null, r);
          });
        },
      ], done);
    });
  });
});

var data = [
  {
    id: 1,
    description: 'Expense 1',
    amount: 159.99,
  },
  {
    id: 200,
    description: 'Expense 2',
    amount: 10,
  },
  {
    id: 258,
    description: 'Expense 3',
    amount: 12.49,
  },
];

// FIXME: The following test cases are to be reactivated for PostgreSQL
/*

 test.it('should not generate malformed SQL for number columns set to empty string', function (test) {
 var Post = dataSource.define('posts', {
 title: { type: String }
 , userId: { type: Number }
 });
 var post = new Post({title:'no userId', userId:''});

 Post.destroyAll(function () {
 post.save(function (err, post) {
 var id = post.id
 Post.all({where:{title:'no userId'}}, function (err, post) {
 test.ok(!err);
 test.ok(post[0].id == id);
 test.done();
 });
 });
 });
 });

 test.it('all should support regex', function (test) {
 Post = dataSource.models.Post;

 Post.destroyAll(function () {
 Post.create({title:'PostgreSQL Test Title'}, function (err, post) {
 var id = post.id
 Post.all({where:{title:/^PostgreSQL/}}, function (err, post) {
 test.ok(!err);
 test.ok(post[0].id == id);
 test.done();
 });
 });
 });
 });

 test.it('all should support arbitrary expressions', function (test) {
 Post.destroyAll(function () {
 Post.create({title:'PostgreSQL Test Title'}, function (err, post) {
 var id = post.id
 Post.all({where:{title:{ilike:'postgres%'}}}, function (err, post) {
 test.ok(!err);
 test.ok(post[0].id == id);
 test.done();
 });
 });
 });
 })

 test.it('all should support like operator ', function (test) {
 Post = dataSource.models.Post;
 Post.destroyAll(function () {
 Post.create({title:'PostgreSQL Test Title'}, function (err, post) {
 var id = post.id
 Post.all({where:{title:{like:'%Test%'}}}, function (err, post) {
 test.ok(!err);
 test.ok(post[0].id == id);
 test.done();
 });
 });
 });
 });

 test.it('all should support \'not like\' operator ', function (test) {
 Post = dataSource.models.Post;
 Post.destroyAll(function () {
 Post.create({title:'PostgreSQL Test Title'}, function (err, post) {
 var id = post.id
 Post.all({where:{title:{nlike:'%Test%'}}}, function (err, post) {
 test.ok(!err);
 test.ok(post.length===0);
 test.done();
 });
 });
 });
 });

 test.it('all should support arbitrary where clauses', function (test) {
 Post = dataSource.models.Post;
 Post.destroyAll(function () {
 Post.create({title:'PostgreSQL Test Title'}, function (err, post) {
 var id = post.id;
 Post.all({where:"title = 'PostgreSQL Test Title'"}, function (err, post) {
 test.ok(!err);
 test.ok(post[0].id == id);
 test.done();
 });
 });
 });
 });

 test.it('all should support arbitrary parameterized where clauses', function (test) {
 Post = dataSource.models.Post;
 Post.destroyAll(function () {
 Post.create({title:'PostgreSQL Test Title'}, function (err, post) {
 var id = post.id;
 Post.all({where:['title = ?', 'PostgreSQL Test Title']}, function (err, post) {
 test.ok(!err);
 test.ok(post[0].id == id);
 test.done();
 });
 });
 });
 });
 */
