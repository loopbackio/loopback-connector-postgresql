require('loopback-datasource-juggler/test/common.batch.js');
require('loopback-datasource-juggler/test/include.test.js');

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