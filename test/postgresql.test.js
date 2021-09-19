// Copyright IBM Corp. 2013,2019. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';
const juggler = require('loopback-datasource-juggler');
const CreateDS = juggler.DataSource;
const sinon = require('sinon');

require('./init');
const async = require('async');
const should = require('should');

let Post, Expense, db, created, PostWithDate;

describe('lazyConnect', function() {
  it('should skip connect phase (lazyConnect = true)', function(done) {
    const dsConfig = {
      host: '127.0.0.1',
      port: 4,
      lazyConnect: true,
      debug: false,
    };
    const ds = getDS(dsConfig);

    const errTimeout = setTimeout(function() {
      done();
    }, 2000);
    ds.on('error', function(err) {
      clearTimeout(errTimeout);
      done(err);
    });
  });

  it('should report connection error (lazyConnect = false)', function(done) {
    const dsConfig = {
      host: '127.0.0.1',
      port: 4,
      lazyConnect: false,
      debug: false,
    };
    const ds = getDS(dsConfig);

    ds.on('error', function(err) {
      err.message.should.containEql('ECONNREFUSED');
      done();
    });
  });
});

function getDS(config) {
  const db = new CreateDS(require('../'), config);
  return db;
}

describe('postgresql connector', function() {
  before(function() {
    db = global.getDataSource();

    Post = db.define('PostWithBoolean', {
      title: {type: String, length: 255, index: true},
      content: {type: String},
      loc: 'GeoPoint',
      created: Date,
      approved: Boolean,
      tags: {
        type: ['string'],
      },
      categories: {
        type: ['string'],
        postgresql: {
          dataType: 'varchar[]',
        },
      },
    }, {allowExtendedOperators: true});
    created = new Date();
  });

  after(function(done) {
    Post.destroyAll(done);
  });

  describe('Explicit datatype', function() {
    before(function(done) {
      db = global.getDataSource();

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

  let post;
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
      },
    );
  });

  it('should preserve property `count` after query execution', function(done) {
    Post.create(
      {title: 'T10', content: 'C10'},
      function(err, p) {
        if (err) return done(err);
        post = p;
        const query = "UPDATE PostWithBoolean SET title ='T20' WHERE id=" + post.id;
        db.connector.execute(query, function(err, results) {
          results.should.have.property('count', 1);
          results.should.have.property('affectedRows', 1);
          done(err);
        });
      },
    );
  });

  it('should support `rows` if RETURNING used after UPDATE', function(done) {
    Post.create(
      {title: 'rows returned from update', content: 'Content'},
      function(err, p) {
        if (err) return done(err);
        post = p;
        const query = 'UPDATE PostWithBoolean SET title =\'something else\' WHERE id=' + post.id + ' RETURNING id';
        db.connector.execute(query, function(err, results) {
          results.should.have.property('count', 1);
          results.should.have.property('affectedRows', 1);
          results.rows[0].id.should.eql(post.id);
          done(err);
        });
      },
    );
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

  it('should support creating and updating arrays with default dataType', function(done) {
    let postId;
    Post.create({title: 'Updating Arrays', content: 'Content', tags: ['AA', 'AB']})
      .then((post)=> {
        postId = post.id;
        post.should.have.property('tags');
        post.tags.should.be.Array();
        post.tags.length.should.eql(2);
        post.tags.toArray().should.eql(['AA', 'AB']);
        return Post.updateAll({where: {id: postId}}, {tags: ['AA', 'AC']});
      })
      .then(()=> {
        return Post.findOne({where: {id: postId}});
      })
      .then((post)=> {
        post.should.have.property('tags');
        post.tags.should.be.Array();
        post.tags.length.should.eql(2);
        post.tags.toArray().should.eql(['AA', 'AC']);
        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  it('should support creating and updating arrays with "varchar[]" dataType', function(done) {
    let postId;
    Post.create({title: 'Updating Arrays', content: 'Content', categories: ['AA', 'AB']})
      .then((post)=> {
        postId = post.id;
        post.should.have.property('categories');
        post.should.have.property('categories');
        post.categories.should.be.Array();
        post.categories.length.should.eql(2);
        post.categories.toArray().should.eql(['AA', 'AB']);
        return Post.updateAll({where: {id: postId}}, {categories: ['AA', 'AC']});
      })
      .then(()=> {
        return Post.findOne({where: {id: postId}});
      })
      .then((post)=> {
        post.should.have.property('categories');
        post.categories.should.be.Array();
        post.categories.length.should.eql(2);
        post.categories.toArray().should.eql(['AA', 'AC']);
        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  it('should support where filter for array type field', async () => {
    await Post.create({
      title: 'LoopBack Participates in Hacktoberfest',
      categories: ['LoopBack', 'Announcements'],
    });
    await Post.create({
      title: 'Growing LoopBack Community',
      categories: ['LoopBack', 'Community'],
    });

    const found = await Post.find({where: {and: [
      {
        categories: {'contains': ['LoopBack', 'Community']},
      },
    ]}});
    found.map(p => p.title).should.deepEqual(['Growing LoopBack Community']);
  });

  it('should support full text search for text type fields using simple string query', async () => {
    await Post.create({
      title: 'Loopback joined the OpenJS Foundation',
      categories: ['Loopback', 'Announcements'],
    });
    await Post.create({
      title: 'Loopback is a new incubating project in the OpenJS foundation',
      categories: ['Loopback', 'Community'],
    });

    const found = await Post.find({where: {and: [
      {
        title: {match: 'joining'},
      },
    ]}});
    found.map(p => p.title).should.deepEqual(['Loopback joined the OpenJS Foundation']);
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
      },
    );
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

  it('should escape number values to defect SQL injection in find (where)',
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

  it('should escape number values to defect SQL injection in find (limit)',
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
    const GeoPoint = juggler.ModelBuilder.schemaTypes.geopoint;
    let loc;

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

    it('should disregard empty and/or fields', function(done) {
      Post.find({where: {and: []}}, function(err, post) {
        should.not.exist(err);
        should.exist(post);
        post.length.should.not.equal(0);
        done();
      });
    });

    it('should preserve order of and/or in where', async function() {
      await Post.create({title: 'T3', content: 'C3', approved: false});
      // WHERE (title='T3' OR approved=false) AND (content='C2')
      const posts = await Post.find({where: {or: [{title: 'T3'},
        {approved: false}], content: 'C2'}});
      posts.length.should.equal(0);
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
        afterEach(function removeSpy() {
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
        afterEach(function removeSpy() {
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
      afterEach(function removeSpy() {
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
    let Customer;

    before(function(done) {
      db = global.getDataSource();

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
  let db;

  before(function() {
    db = global.getSchema();
  });

  it('should allow serial properties', function(done) {
    const schema =
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
    const models = db.modelBuilder.buildModels(schema);
    const Model = models['TestInventory'];
    const count = 0;
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

const data = [
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
