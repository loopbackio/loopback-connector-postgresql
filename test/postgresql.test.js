require('loopback-datasource-juggler/test/common.batch.js');
require('loopback-datasource-juggler/test/include.test.js');


var should = require('should');

var Post, db;

describe('postgresql connector', function () {

  before(function () {
    db = getDataSource();

    Post = db.define('PostWithBoolean', {
      title: { type: String, length: 255, index: true },
      content: { type: String },
      approved: Boolean
    });
  });

  it('should run migration', function (done) {
    db.automigrate('PostWithBoolean', function () {
      done();
    });
  });
  
  var post;
  it('should support boolean types with true value', function(done) {
    Post.create({title: 'T1', content: 'C1', approved: true}, function(err, p) {
      should.not.exists(err);
      post = p;
      Post.findById(p.id, function(err, p) {
        should.not.exists(err);
        p.should.have.property('approved', true);
        done();
      });
    });
  });

  it('should support updating boolean types with false value', function(done) {
    Post.update({id: post.id}, {approved: false}, function(err, p) {
      should.not.exists(err);
      Post.findById(p.id, function(err, p) {
        should.not.exists(err);
        p.should.have.property('approved', false);
        done();
      });
    });
  });


  it('should support boolean types with false value', function(done) {
    Post.create({title: 'T2', content: 'C2', approved: false}, function(err, p) {
      should.not.exists(err);
      post = p;
      Post.findById(p.id, function(err, p) {
        should.not.exists(err);
        p.should.have.property('approved', false);
        done();
      });
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