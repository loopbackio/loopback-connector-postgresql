// Copyright IBM Corp. 2013,2016. All Rights Reserved.
// Node module: loopback-connector-postgresql
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

// See also https://github.com/strongloop/loopback-connector-mongodb/blob/master/test/mongodb.test.js

'use strict';
var juggler = require('loopback-datasource-juggler');
var GeoPoint = juggler.GeoPoint;
var should = require('should');

require('./init');


var db, PostWithLocation;

describe('geo queries', function() {

  before(function(done) {
    db = getDataSource();
    PostWithLocation = db.define('PostWithLocation', {
      title: {type: String, length: 255, index: true},
      content: {type: String},
      location: {type: GeoPoint},
    });
    db.automigrate('PostWithLocation', done);
  });
  before(function deleteTestFixtures(done) {
    PostWithLocation.destroyAll(done);
  });
  before(function createTestFixtures(done) {
    PostWithLocation.create([{
      title: 'a',
      content: 'AAA',
      location: new GeoPoint({lat: 0, lng: 0}),
    }, {
      title: 'b',
      content: 'BBB',
      location: new GeoPoint({lat: 0, lng: 180}),
    }], done);
  });
  after(function deleteTestFixtures(done) {
    PostWithLocation.destroyAll(done);
  });

  it('create should convert geopoint to geojson', function(done) {
    var point = new GeoPoint({ lat: 1.234, lng: 56.78 });

    PostWithLocation.create({ location: point }, function(err, post) {
      should.not.exist(err);
      point.lat.should.be.equal(post.location.lat);
      point.lng.should.be.equal(post.location.lng);
      done();
    });
  });

  it('find should be able to query by location', function(done) {
    var point = new GeoPoint({
      lat: (Math.random() * 180) - 90,
      lng: (Math.random() * 360) - 180,
    });
    PostWithLocation.find({
      where: {
        location: {
          near: new GeoPoint(point),
        },
      },
    }, function(err, results) {
      should.not.exist(err);
      should.exist(results);
      var dist = 0;
      results.forEach(function(result) {
        var currentDist = getDistanceBetweenPoints(point, result.location);
        currentDist.should.be.aboveOrEqual(dist);
        dist = currentDist;
      });

      done();
    });
  });

  //TODO (gdingle): extend with more test cases similar to mongodb connector

});

//TODO (gdingle): move to library... this is copied from mongodb connector
function getDistanceBetweenPoints(point1, point2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(point2.lat - point1.lat);  // deg2rad below
  var dLon = deg2rad(point2.lng - point1.lng);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(point1.lat)) * Math.cos(deg2rad(point2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km

  return d;
};

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
