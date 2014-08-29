var xtend    = require('xtend')
  , s2       = require('s2')
  , merge    = require('merge-stream')
  , map      = require('map-stream')
  , distance = require('gps-distance')
  , EARTH_RADIUS = 6371
;
 
function radius2height (radius) {
 return 1 - Math.sqrt(1 - Math.pow((radius / EARTH_RADIUS), 2));
}
 
function height2radius (height) {
 return Math.sqrt(1 - Math.pow(1 - height, 2)) * EARTH_RADIUS;
}

function put (db, key, value, os, cb) {
  if (typeof key == 'string') {
    db._nearby.put.call(db, key, value, typeof os == 'function' ? os.bind(null, null, key) : os
                                      , typeof cb == 'function' ? cb.bind(null, null, key) : cb);
    return;
  }
  if (typeof key != 'object') throw new Error('Key is not an Object!');

  key = xtend({
    lat: 0
    , lng: 0
    , customKey: '' + Date.now()
  }, key);

  value = {
    value: value
    , _nearby: {
      lat: key.lat
      , lng: key.lng
    }
  };

  var ll = new s2.S2LatLng(key.lat, key.lng);
  var id = new s2.S2CellId(ll.normalized());
  var newKey = '' + id.toString() + '!' + key.customKey;

  db._nearby.put.call(db, newKey, JSON.stringify(value), typeof os == 'function' ? os.bind(null, null, newKey) : os
                                                       , typeof cb == 'function' ? cb.bind(null, null, newKey) : cb);
}

function createNearStream (db, os) {
  os = xtend({
    lat: 0
    , lng: 0
    , radius: 100
  }, os);

  var ll  = new s2.S2LatLng(os.lat, os.lng);
  var cap = new s2.S2Cap(ll.normalized().toPoint(), radius2height(os.radius / 1000));

  var ss = merge();
  s2.getCover(cap).map(function (id) {
    var cell = id.id();
    ss.add(db.createReadStream({
        gte: cell.toString()
        , lt: cell.next().toString()
    }));
  });

  return ss.pipe(map(function (data, cb) {
    var msg = JSON.parse(data.value);
    var dist = distance(os.lat, os.lng, msg._nearby.lat, msg._nearby.lng) * 1000;

    var _nearby = msg._nearby;
    _nearby.distance = dist;
    msg = msg.value;
    
    cb(null, dist < os.radius ? { key: data.key, value: msg, _nearby: _nearby } : undefined);
  }));
}

module.exports = function (db, os) {
  os = xtend({
    prefix: ''
  }, os);

  db._nearby = { put: db.put };

  db[os.prefix + 'put']              = put.bind(null, db);
  db[os.prefix + 'createNearStream'] = createNearStream.bind(null, db);

  return db;
};