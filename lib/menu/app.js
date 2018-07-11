module.exports = {
	items: [
		{
			label: 'Packages',
			submenu: [
				{
					label: 'Appcelerator Titanium',
					submenu: [
						{ label: 'Open related View…', command: 'appc:open-related-view' },
						{ label: 'Open related Style…', command: 'appc:open-related-style' },
						{ label: 'Open related Controller…', command: 'appc:open-related-controller' },
						{ label: 'Build', command: 'appc:build' },
						{ label: 'Toggle Console', command: 'appc:console:toggle' },
						{ label: 'Toggle related Files', command: 'appc:open-or-close-related' },
						{ label: 'Add Component', command: 'appc:generate' },
						{ label: 'Take Screenshot', command: 'appc:take-screenshot' },
						{ label: 'Clean Project', command: 'appc:clean' },
					]
				}
			]
		}
	]
};
