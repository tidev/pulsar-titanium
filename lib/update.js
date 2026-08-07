'use babel';

import { updates } from 'titanium-editor-commons';

import sudo from 'sudo-prompt';

const Update = {

	checkingForUpdates: false,
	updates: [],

	async refresh() {
		this.checkingForUpdates = true;

		// Deliberately not using updates.checkAllUpdates() as that always checks for a Node.js
		// update, which hits the network and takes the other checks down with it when it fails.
		const checkForUpdate = async check => {
			try {
				return await check();
			} catch (error) {
				console.warn('Failed to check for updates', error);
			}
		};

		const results = await Promise.all([
			checkForUpdate(() => updates.alloy.checkForUpdate()),
			checkForUpdate(() => updates.titanium.cli.checkForUpdate()),
			checkForUpdate(() => updates.titanium.sdk.checkForUpdate())
		]);

		this.updates = results
			.filter(update => update && update.hasUpdate)
			.sort((curr, prev) => curr.priority - prev.priority);

		this.checkingForUpdates = false;
		if (this.updates.length) {
			return this.updates;
		}

	},

	async getUpdates() {
		if (!this.updates) {
			return this.refresh();
		}
		return this.updates;
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
					if (error.metadata) {
						const { metadata } = error;
						if (metadata.errorCode === 'EACCES') {
							return new Promise((resolve, reject) => {
								const errorNotification = atom.notifications.addError(`Failed to install ${label} as it must be ran with sudo`, {
									dismissable: true,
									buttons: [
										{
											text: 'Install with Sudo',
											onDidClick: () => {
												const options = {
													name: 'Titanium Package for Atom',
												};
												sudo.exec(metadata.command, options, (err, res) => {
													if (err) {
														reject(err);
														return;
													}
													if (res) {
														errorNotification.dismiss();
														resolve();
													}
												});
											}
										}
									]
								});
								errorNotification.onDidDismiss(() => {
									resolve();
								});
							});
						} else if (metadata.errorCode === 'ESELECTERROR') {
							atom.notifications.addError(`Failed to select SDK please run "${metadata.command} manually to select it`);
						}
					} else {
						atom.notifications.addError(`Failed to update to ${update.label}`);
					}
				}
				counter++;
			}
		}
	}
};

export default Update;
