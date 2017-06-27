# ipmap

[![Current Version](https://img.shields.io/npm/v/ipmap.svg)](https://www.npmjs.org/package/ipmap)
[![Build Status via Travis CI](https://travis-ci.org/continuationlabs/ipmap.svg?branch=master)](https://travis-ci.org/continuationlabs/ipmap)
![Dependencies](http://img.shields.io/david/continuationlabs/ipmap.svg)

[![belly-button-style](https://cdn.rawgit.com/continuationlabs/belly-button/master/badge.svg)](https://github.com/continuationlabs/belly-button)

Map IP addresses and IP ranges to data values.

## Basic Usage

`ipmap` exports a single `IpMap` constructor. Individual IP addresses and IP ranges can be inserted using the `insert()` method. IP addresses can be queried using the `lookup()` method.

```javascript
'use strict';
const IpMap = require('ipmap');
const map = new IpMap();
let value;

map.insert('127.0.0.1', 'foo');
map.insert('0.0.0.0/8', 'bar');
map.insert('0.0.0.4', 'baz');

value = map.lookup('127.0.0.1');
// value equals { data: 'foo' }

value = map.lookup('0.0.0.4');
// value equals { data: 'baz' }

value = map.lookup('0.0.0.8');
// value equals { start: 1, end: 16777214, data: 'bar' }

value = map.lookup('127.0.0.2');
// value equals null
```

## API

### `IpMap()` constructor

  - Arguments
    - None

Constructs a new IP map instance. Must be called with `new`.

### `IpMap.prototype.insert(value[, data])`

  - Arguments
    - `value` (string) - An individual IP address (i.e. '127.0.0.1') or IP range (i.e. '0.0.0.0/8').
    - `data` (value) - Optional data to store as the key corresponding to `value`. Defaults to `undefined`.
  - Returns
    - Nothing

Inserts an IP address or IP range and optional corresponding data into the map.

### `IpMap.prototype.lookup(value)`

  - Arguments
    - `value` (string) - IP address to lookup in the map.
  - Returns
    - `matches` (object or null) - If no match is found, `null` is returned. If a match is found, an object with the following schema is returned:
      - `data` (value) - Any data stored with the IP.
      - `start` (number) - This field is only present if the match is an IP range. This is the range's starting IP address, expressed as a number.
      - `end` (number) - This field is only present if the match is an IP range. This is the range's ending IP address, expressed as a number.

Returns data corresponding to the first match found in the map. If `value` matches an individual IP address, that IP is treated as the match. If `value` matches one or more IP ranges, the first match is returned. If no match is found, `null` is returned.
