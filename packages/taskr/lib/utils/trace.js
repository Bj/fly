'use strict';

const extractPath = /\s+at.*(?:\(|\s)(.*)\)?/;
const isPath = /^(?:(?:(?:node|(?:internal\/[\w/]*)?\w+)\.js:\d+:\d+)|native)/;

module.exports = function (stack) {
	return stack.replace(/\\/g, '/').split('\n').filter(x => {
		const matches = x.match(extractPath);
		return matches === null || !matches[1] || !isPath.test(matches[1]);
	}).filter(x => x.trim() !== '').join('\n');
}
