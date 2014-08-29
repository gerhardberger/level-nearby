var level  = require('level')
  , nearby = require('./index.js')
;

var db = nearby(level('./db'));


db.put({ lat: 34.0908829, lng: -118.3856206 }, 'value2', {}, function (err, key) {
  if (err) { console.log(err); return; }
  console.log('success', key);
});

db.put('foo', 'bar', function (err, key) {
	if (err) { console.log(err); return; }
	console.log('success', key);
});


db.createNearStream({ lat: 34.0908829, lng: -118.3646206, radius: 1940 })
  .on('data', function (data) {
  console.log(data.key, '=', data.value);
  console.log('distance: ', data._nearby.distance + 'm');
});