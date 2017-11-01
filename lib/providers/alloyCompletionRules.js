'use babel';

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
						for (const key of allKeys) {
							completions.push({
								text: key,
								type: 'variable'
							});
						};
					} catch (error) {
						console.log(error);
					}
				}
			}

			return completions;
		}
	},

	i18n: {
		regExp: /(L\(|titleid\s*[:=]\s*)["'](\w*)/,// /L\(["']([^\s\\\(\)"':,;<>~!@\$%\^&\*\|\+=\[\]\{\}`\?\…]*)$/,
		getCompletions(request) {
			let completions = undefined;
			const line = Utils.getLine(request);
			const alloyRootPath = Utils.getAlloyRootPath();
			if (this.regExp.test(line)) {
				const defaultLang = atom.config.get('appc.defaultI18nLanguage');
				const i18nPath = Utils.getI18nPath();
				if (Utils.isExistAsDirectory(i18nPath)) {
					const i18nStringPath = path.join(Utils.getI18nPath(), defaultLang, "strings.xml");
					completions = [];
					if (Utils.isExistAsFile(i18nStringPath)) {
						parseString(Utils.getFileEditor(i18nStringPath).getText(), (error, result) => {
							if (result && result.resources) {
								for (let value of result.resources.string) {
									completions.push({
										text: value.$.name,
										leftLabel: defaultLang,
										rightLabel: value._,
										type: 'variable',
										replacementPrefix: Utils.getCustomPrefix(request),
									})
								}
							}
						});
					}
				}
			}
			return completions;
		}
	},
	image: {
		regExp: /image\s*[:=]\s*["']/,///["']\/i([-a-zA-Z0-9-_\/]*)$/,
		getCompletions(request) {
			// const { prefix } = request;
			let completions = undefined;
			const line = Utils.getLine(request);
			if (this.regExp.test(line)) {
				const alloyRootPath = Utils.getAlloyRootPath();
				const assetPath = path.join(alloyRootPath, 'assets');
				completions = [];
				// limit search to these sub-directories
				let paths = ['images', 'iphone', 'iphone/images', 'android', 'android/images', 'windows', 'windows/images'];
				paths = paths.map(aPath => path.join(assetPath, aPath));
				
				for (const imgPath of paths) {
					if (Utils.isExistAsDirectory(imgPath)) {
						const files = find.fileSync(imgPath);
						const images = [];
						for (const file of files) {
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
						}

						for (const image of images) {
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
						}
					}
				}
			}
			return completions;
		}
	}
};