const { createRunner } = require('@atom/mocha-test-runner');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
global.expect = chai.expect;

module.exports = createRunner({
	htmlTitle: 'Titanium Package Tests',
	reporter: process.env.MOCHA_REPORTER || 'spec',
	testSuffixes: [ 'spec.js' ]
});
