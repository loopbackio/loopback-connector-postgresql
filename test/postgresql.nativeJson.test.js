var should = require('should'),
  assert = require('assert');
var MyModel, db;

describe('database native json column', function () {
  before(function () {
    db = getDataSource();
    MyModel = db.define('MyJsonModel', {
      name: {
        type: 'String'
      },
      jsonField: {
        type: 'Json',
        postgresql: {
          dataType: 'jsonb'
        }
      }
    });
  });

  it('should automigrate without errors', function (done) {
    db.automigrate('MyJsonModel', done);
  });

  it('should insert json objects', function (done) {
    var mObject = {};
    mObject.num = 5;
    mObject.str = 'howdy';
    mObject.arr = [];
    mObject.arr.push(1);
    mObject.arr.push(2);
    mObject.arr.push(3);

    MyModel.create({name: 'qwe', jsonField: mObject}, function (err, m) {
      should.not.exist(err);
      should.exist(m.jsonField);
      should.exist(m.jsonField.num);
      m.jsonField.num.should.be.equal(5);

      done();
    })
  });

  it('should filter records based on criteria with json field', function (done) {
    MyModel.findOne({where: {
      and: [
        {"name": "qwe"},
        {"jsonfield->'num'": 5}
      ]
    }}, function(err, obj) {
      should.not.exist(err);
      should.exist(obj);
      should.exist(obj.jsonField.num);
      obj.jsonField.num.should.be.equal(5);
      done();
    })
  });

  it('should order records based on criteria with json field', function(done) {
    MyModel.find({order: "jsonfield->'num' desc"}, function(err, data) {
      should.not.exist(err);
      done();
    });
  });
});
