#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const apiJscaPath = process.argv[2];
if (!apiJscaPath) {
	console.error('Usage: node update-tss-tags.js <path-to-api.jsca>');
	process.exit(1);
}

const tssCsonPath = path.resolve(__dirname, '..', 'grammars', 'tss.cson');

// Read api.jsca
const apiData = JSON.parse(fs.readFileSync(apiJscaPath, 'utf8'));

// Extract Titanium.UI.* view/window types (usable as TSS tag selectors)
const sdkViewTags = new Set();
for (const t of apiData.types) {
	if (t.isInternal) {
		continue;
	}
	if (!t.name.startsWith('Titanium.UI.')) {
		continue;
	}
	if (t.inherits !== 'Titanium.UI.View' && t.inherits !== 'Titanium.UI.Window') {
		continue;
	}
	const parts = t.name.split('.');
	const shortName = parts[parts.length - 1];
	sdkViewTags.add(shortName);
}

// Read current tss.cson
const tssContent = fs.readFileSync(tssCsonPath, 'utf8');

// Extract current tag list from the regex
const tagMatch = tssContent.match(/\(\?<!\[-a-zA-Z\]\)\(([A-Za-z|]+)\)\(\?!\[-a-zA-Z\]\)/);
if (!tagMatch) {
	console.error('Could not find TAG regex in', tssCsonPath);
	process.exit(1);
}

const existingTags = tagMatch[1].split('|');

// Tags in the current regex that are NOT Titanium.UI.* view types
// These are Alloy-specific or legacy tags we want to preserve
const nonSdkTags = existingTags.filter(tag => !sdkViewTags.has(tag));

// Combine: SDK tags (from api.jsca) + preserved non-SDK tags, deduplicate, sort
const allTags = [ ...new Set([ ...sdkViewTags, ...nonSdkTags ]) ].sort();

// Build the new match line
const indent = '          ';
const newMatchLine = `${indent}'match': "\\\\b(?<![-a-zA-Z])(${allTags.join('|')})(?![-a-zA-Z])"`;

// Replace in the file
const updatedContent = tssContent.replace(
	/([ \t]*'match': "\\\\b\(\?<!\[-a-zA-Z\]\)\().*(\)\(\?!\[-a-zA-Z\]\)")/,
	newMatchLine
);

fs.writeFileSync(tssCsonPath, updatedContent);

console.log(`Updated ${tssCsonPath}`);
console.log(`  SDK view tags:  ${sdkViewTags.size}`);
console.log(`  Non-SDK tags:   ${nonSdkTags.length}`);
console.log(`  Total tags:     ${allTags.length}`);
