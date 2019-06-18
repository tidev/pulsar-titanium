'use babel';

import { updates } from 'titanium-editor-commons';
import { log } from 'util';
// import { UpdateInfo } from 'titanium-editor-commons/updates';

const Update = {

	checkingForUpdates: false,

	async refresh() {
		this.checkingForUpdates = true;

		try {
			this.updates = await updates.checkAllUpdates();
		} catch (error) {
			// console.log(error);
		}
		this.checkingForUpdates = false;
		if (this.updates.length) {
			return this.updates;
		}

	},

	async validateEnvironment () {
		const environmentInfo = {
			installed: [],
			missing: []
		};
		const [ coreVersion, installVersion, sdkVersion ] = await Promise.all([
			await updates.appc.core.checkInstalledVersion(),
			await updates.appc.install.checkInstalledVersion(),
			await updates.titanium.sdk.checkInstalledVersion()
		]);

		if (coreVersion) {
			environmentInfo.installed.push({
				name: updates.ProductNames.AppcCore,
				version: coreVersion
			});
		} else {
			environmentInfo.missing.push({
				name: updates.ProductNames.AppcCore,
				getInstallInfo: () => {
					return updates.appc.core.checkForUpdate();
				}
			});
		}

		if (installVersion) {
			environmentInfo.installed.push({
				name: updates.ProductNames.AppcInstaller,
				version: installVersion
			});
		} else {
			environmentInfo.missing.push({
				name: updates.ProductNames.AppcInstaller,
				getInstallInfo: () => {
					return updates.appc.install.checkForUpdate();
				}
			});
		}

		if (sdkVersion) {
			environmentInfo.installed.push({
				name: updates.ProductNames.TitaniumSDK,
				version: sdkVersion
			});
		} else {
			environmentInfo.missing.push({
				name: updates.ProductNames.TitaniumSDK,
				getInstallInfo: () => {
					return updates.titanium.sdk.checkForUpdate();
				}
			});
		}

		return environmentInfo;
	},

	async installUpdates (updateInfo, progress, incrementUpdate = false) {
		const totalUpdates = updateInfo.length;
		let counter = 1;

		// sort prior to running
		updateInfo.sort((curr, prev) => curr.priority - prev.priority);
		for (const update of updateInfo) {
			if (!incrementUpdate || update.selected) {
				const label = update.label || `${update.productName}: ${update.latestVersion}`;
				progress.hud.display({
					text: `Installing ${label} (${counter}/${totalUpdates})`
				});
				try {
					await update.action(update.latestVersion);
					progress.hud.display({
						text: `Installed ${label} (${counter}/${totalUpdates})`
					});
				} catch (error) {
					progress.hud.display({
						text: `Failed to install ${label} (${counter}/${totalUpdates})`
					});
					const errorNotification = atom.notifications.addError(`Failed to update to ${update.label}`);
				}
				counter++;
			}
		}
	}
};

export default Update;
