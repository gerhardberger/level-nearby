# level-nearby

store data with a given lat/long pair and retrieve all the entries given a lat/long pair and a radius in that radius. the module uses google's s2 library in [node](https://github.com/mapbox/node-s2).

## example
``` js
var level  = require('level');
var nearby = require('level-nearby');

var db = nearby(level('./db'));

db.put({ lat: 34.0908829, lng: -118.3856206 }, 'foo', function (err) {
  if (err) console.log(err);
  console.log('success');
});

db.createNearStream({ lat: 34.0908829, lng: -118.3646206, radius: 2000 })
  .on('data', function (data) {
  console.log(data.value);      // prints 'foo'
});
```

## methods
``` js
var nearby = require('level-nearby');
```

### nearby(db, options)
transforms `db` the be able to perform the `put` and `createNearStream` methods on it. `options` can have a `prefix` field, than the methods will have that prefix.

### db.put(keyObj, value[, options][, callback]))
insert `value` in `db` with a key that represents the given latitude (`lat`) and longitude (`lng`) in `keyObj`. `keyObj` can have a `customId` than that makes the key unique. By default the customId is a timestamp. If `keyObj` is a *String* it falls back to the default `put` function.

### db.createNearStream(searchObj)
retrieves the entries in `db` that are in the `radius` of the `lat`, `lng` pair. returns a read stream with the results. `radius` is measured in **meters**. In the retrieved `data` object there is a `_nearby` field besides `key` and `value`, containing a `lat`, `lng`, `distance` field.

## install
``` batch
npm install level-nearby
```

## license
MIT