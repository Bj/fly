'use strict';

const sep = require('path').sep;
const format = require('path').format;
const Promise = require('bluebird');
const flatten = require('flatten');
const arrify = require('arrify');
const co = Promise.coroutine;
const rgx = /[\\|\/]/g;

module.exports = co(function * (dirs, opts) {
	dirs = flatten(arrify(dirs));
	opts = opts || {};

	const files = this._.files;
	// using `watcher`? original globs passed as `prevs`
	// non-wildcard glob segments that should be trimmed!
	const trims = (this._.prevs || this._.globs).map(g => {
		let seg = g.split(rgx);
		const idx = seg.findIndex(str => str.includes('*'));
		(idx === -1) ? seg.pop() : (seg = seg.slice(0, idx));
		return seg.join(sep);
	}).sort((a, b) => b.length - a.length);

	return yield Promise.all(
		flatten(
			files.map(obj => {
				// store data; no longer changes
				const data = obj.data;

				return dirs.map(d => {
					// clone `pathObject`; per target dir
					const o = {dir: obj.dir, base: obj.base};
					// replace `source` segments with `target` dir
					for (const t of trims) {
						o.dir = o.dir.replace(t, d);
					}
					// create final filepath & write to it!
					return this.$.write(format(o), data);
				});
			})
		)
	);
});
