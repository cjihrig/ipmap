'use strict';
const Net = require('net');
const IntervalTree = require('augmented-interval-tree');
const Ip = require('ip');


class IpMap {
  constructor () {
    this.ips = new Map();
    this.ranges = new IntervalTree();
  }

  insert (value, data) {
    if (typeof value !== 'string') {
      throw new TypeError('value must be a string');
    }

    if (Net.isIP(value)) {
      this.ips.set(Ip.toLong(value), { data });
      return;
    }

    const parts = value.split('/');

    if (parts.length === 2 && Net.isIP(parts[0]) &&
        Number.isSafeInteger(+parts[1])) {
      const range = Ip.cidrSubnet(value);

      this.ranges.insert(Ip.toLong(range.firstAddress),
        Ip.toLong(range.lastAddress),
        data);
      return;
    }

    throw new RangeError('invalid IP');
  }

  lookup (value) {
    if (!Net.isIP(value)) {
      throw new TypeError('value must be an IP address');
    }

    const asLong = Ip.toLong(value);

    return this.ips.get(asLong) || this.ranges.find(asLong)[0] || null;
  }
}

module.exports = IpMap;
