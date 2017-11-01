'use babel';

/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import fs from 'fs';
import Utils from '../utils';
import related from '../related';
import _ from 'underscore';
import find from 'find';
import path from 'path';
import { parseString } from 'xml2js';

const tagRegExp = /(<([^>]+)>)/ig;

module.exports = {
	cfg: {
		regExp: /Alloy\.CFG\.([-a-zA-Z0-9-_\/]*)$/,
		getCompletions(request) {
			let completions = undefined;
			const line = Utils.getLine(request);

			if (this.regExp.test(line)) {
				const cfgPath = path.join(Utils.getAlloyRootPath(), 'config.json');
				const cfgKeys = [];
				completions = [];
				if (Utils.isExistAsFile(cfgPath)) {
					try {
						// merge ally evn and platform(os) keys
						let cfgObj = JSON.parse(Utils.getFileEditor(cfgPath).getText());
						cfgObj = _.reduce(cfgObj, function (memo, value, key) {
							if ((key === "global") || key.startsWith('env:') || key.startsWith('os:')) {
								return _.extend(memo, value);
							} else {
								return memo;
							}
						}
							, {});

						const allKeys = Utils.getAllKeys(cfgObj);

						for (let key of Array.from(allKeys)) {
							completions.push({
								text: key,
								type: 'variable'
							});
						}
					} catch (error) {
						console.log(error);
					}
				}
			}

			return completions;
		}
	},

	i18n: {
		regExp: /L\(["']([^\s\\\(\)"':,;<>~!@\$%\^&\*\|\+=\[\]\{\}`\?\…]*)$/,
		getCompletions(request) {
			let completions = undefined;
			const line = Utils.getLine(request);
			const alloyRootPath = Utils.getAlloyRootPath();
			if (this.regExp.test(line)) {
				const defaultLang = atom.config.get('titanium-alloy.defaultI18nLanguage');
				const i18nStringPath = path.join(Utils.getI18nPath(), defaultLang, "strings.xml");

				completions = [];
				if (Utils.isExistAsFile(i18nStringPath)) {
					parseString(Utils.getFileEditor(i18nStringPath).getText(), (error, result) =>
						_.each(Utils.__guard__(result != null ? result.resources : undefined, x => x.string) || [], value =>
							completions.push({
								text: value.$.name,
								leftLabel: defaultLang,
								rightLabel: value._,
								type: 'variable',
								replacementPrefix: Utils.getCustomPrefix(request),
								description: value._
							})
						)
					);
				}
			}
			return completions;
		}
	},
	image: {
		regExp: /image\s*[:=]\s*["']/,///["']\/i([-a-zA-Z0-9-_\/]*)$/,
		getCompletions(request) {
			// const { prefix } = request;
			let completions = [];
			const line = Utils.getLine(request);
			if (this.regExp.test(line)) {
				const alloyRootPath = Utils.getAlloyRootPath();
				const assetPath = path.join(alloyRootPath, 'assets');

				// limit search to these sub-directories
				let paths = ['images', 'iphone', 'iphone/images', 'android', 'android/images', 'windows', 'windows/images'];
				paths = paths.map(aPath => path.join(assetPath, aPath));
				
				paths.forEach(imgPath => {
					if (Utils.isExistAsDirectory(imgPath)) {
						const files = find.fileSync(imgPath);
						const images = [];
						files.forEach(file => {
							// test whether image is includes scaling factor (for iOS)
							const matches = file.match(/(^[\w\/]+)(@[\w~]+)(.\w+$)/);
							if (matches && matches.length === 4) {
								let prefix = matches[1];
								let scale = matches[2];
								let suffix = matches[3];
								let image = images.find(image => image.prefix === prefix);
								if (image) {
									image.scales.push(scale);
								} else {
									images.push({
										prefix,
										suffix,
										file,
										scales: [scale]
									});
								}
							} else if (!file.endsWith('.DS_Store')) {
								images.push({
									prefix: file,
									suffix: '',	
									file
								})
							}
						});

						images.forEach(image => {
							completions.push({
								type: 'file',
								// snippet: Utils.toUnixPath(image.file.replace(assetPath, '')),
								text: Utils.toUnixPath(`${image.prefix}${image.suffix}`.replace(assetPath, '')),
								rightLabel: image.scales ? image.scales.join(', ') : null,
								replacementPrefix: Utils.getCustomPrefix(request),
								iconHTML: `<div style='margin: 0; padding: 2px; height:25px; width:25px;'><div style='margin: 0; padding: 0; background-position: center; background-repeat: no-repeat; background-size: contain; background-image: url(${image.file}); height:25px; width:25px; border:none;'></div></div>`,
								// iconHTML: `<image style='background: url(${file}) no-repeat center; background-size: contain; width:29px; height:29px; '></image>`,
								// description: `${file}`,
								// descriptionMoreURL: `${file}`
							});
						});
					}
				});
			}
			return completions;
		}
	}
};