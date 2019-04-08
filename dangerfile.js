/* global process, fail */

// requires
const eslint = require('@seadub/danger-plugin-eslint').default;
const junit = require('@seadub/danger-plugin-junit').default;
const dependencies = require('@seadub/danger-plugin-dependencies').default;
const fs = require('fs');
const path = require('path');

async function main() {
	const eslintConfig = fs.readFileSync(path.join(__dirname, '.eslintrc'), 'utf8');
	await Promise.all([
		eslint(eslintConfig, [ '.js', '.jsx' ]),
		junit({ pathToReport: './junit_report.xml' }),
		dependencies({ type: 'npm' })
	]);
}
main()
	.then(() => process.exit(0))
	.catch(err => {
		fail(err.toString());
		process.exit(1);
	});
