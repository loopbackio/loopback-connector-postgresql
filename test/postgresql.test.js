var juggler = require('loopback-datasource-juggler');
require('loopback-datasource-juggler/test/common.batch.js');
require('loopback-datasource-juggler/test/include.test.js');

require('./init');
var should = require('should');

var Post, db, created;

describe('postgresql connector', function () {

  before(function () {
    db = getDataSource();

    Post = db.define('PostWithBoolean', {
      title: { type: String, length: 255, index: true },
      content: { type: String },
      loc: 'GeoPoint',
      created: Date,
      approved: Boolean
    });
    created = new Date();
  });

  it('should run migration', function (done) {
    db.automigrate('PostWithBoolean', function () {
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
      where: {created: created}
    }, function(err, posts) {
      if(err) return done(err);
      posts.length.should.eql(2);
      done();
    });
  });

  it('should support date types with between', function(done) {
    Post.find({
      where: {
        created: {
          between: [new Date(Date.now() - 5000), new Date(Date.now() + 5000)]
        }}
    }, function(err, posts) {
      if(err) return done(err);
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

  it('should support GeoPoint types', function(done) {
    var GeoPoint = juggler.ModelBuilder.schemaTypes.geopoint;
    var loc = new GeoPoint({lng: 10, lat: 20});
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
});

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
