'use strict';
const IntervalTree = require('augmented-interval-tree');
const Ip = require('ip');
const Lab = require('lab');
const IpMap = require('../lib');

const lab = exports.lab = Lab.script();
const expect = Lab.expect;
const describe = lab.describe;
const it = lab.it;


describe('IP Map', () => {
  function getTreeRoot (tree) {
    const symbols = Object.getOwnPropertySymbols(tree);

    expect(symbols.length).to.equal(1);
    return tree[symbols[0]];
  }

  describe('constructor ()', () => {
    it('constructs an interval tree', (done) => {
      const map = new IpMap();

      expect(map).to.be.an.instanceof(IpMap);
      expect(map.ips).to.be.an.instanceof(Map);
      expect(map.ranges).to.be.an.instanceof(IntervalTree);
      expect(map.ips.size).to.equal(0);
      expect(getTreeRoot(map.ranges)).to.equal(null);
      done();
    });
  });

  describe('insert ()', () => {
    it('inserts into the map', (done) => {
      const map = new IpMap();
      let entries;

      map.insert('127.0.0.1', 'foo');
      entries = map.ips.entries();
      expect(entries.next().value).to.equal([Ip.toLong('127.0.0.1'),
        { data: 'foo' }]);
      expect(entries.next().done).to.equal(true);
      expect(getTreeRoot(map.ranges)).to.equal(null);

      map.insert('0.0.0.0/8', 'bar');
      entries = map.ips.entries();
      expect(entries.next().value).to.equal([Ip.toLong('127.0.0.1'),
        { data: 'foo' }]);
      expect(entries.next().done).to.equal(true);
      const range = Ip.cidrSubnet('0.0.0.0/8');
      expect(getTreeRoot(map.ranges)).to.equal({
        start: Ip.toLong(range.firstAddress),
        end: Ip.toLong(range.lastAddress),
        max: Ip.toLong(range.lastAddress),
        left: null,
        right: null,
        data: 'bar'
      });
      done();
    });

    it('rejects invalid values', (done) => {
      const map = new IpMap();

      function fail (value, type, message) {
        expect(() => { map.insert(value); }).to.throw(type, message);
      }

      [undefined, null, true, false, 0, NaN, {}].forEach((value) => {
        fail(value, TypeError, 'value must be a string');
      });

      ['', 'foo', '999.999.999.999', '2.2.2.3a', 'a/b', 'a/b/c', '127.0.0.1/3c',
        '127.0.0.x/8', '12.0.0.1/3.1'].forEach((value) => {
        fail(value, RangeError, 'invalid IP');
      });

      expect(map.ips.size).to.equal(0);
      expect(getTreeRoot(map.ranges)).to.equal(null);
      done();
    });
  });

  describe('lookup ()', () => {
    it('determines if the value is in the map', (done) => {
      const map = new IpMap();

      map.insert('127.0.0.1', 'foo');
      map.insert('0.0.0.0/8', 'bar');
      map.insert('0.0.0.4', 'baz');

      // Hit in the single IP address map.
      expect(map.lookup('127.0.0.1')).to.equal({ data: 'foo' });

      // Hit in the map and the tree. Map takes priority.
      expect(map.lookup('0.0.0.4')).to.equal({ data: 'baz' });

      // Miss in the map and hit in the tree.
      expect(map.lookup('0.0.0.8')).to.equal({
        start: 1,
        end: 16777214,
        data: 'bar'
      });

      // Miss in the map and tree.
      expect(map.lookup('127.0.0.2')).to.equal(null);

      done();
    });

    it('rejects invalid values', (done) => {
      const map = new IpMap();

      [undefined, null, true, false, 0, NaN, {}, '', 'foo', '999.999.999.999',
        '2.2.2.3a', '0.0.0.0/8'].forEach((value) => {
        expect(() => {
          map.lookup(value);
        }).to.throw(TypeError, 'value must be an IP address');
      });

      done();
    });
  });
});
