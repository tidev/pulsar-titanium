module.exports = {
	items: [
		{
			label: 'Packages',
			submenu: [
				{
					label: 'Titanium SDK',
					submenu: [
						{ label: 'Add Component', command: 'appc:generate' },
						{ label: 'Build', command: 'appc:build' },
						{ label: 'Clean Project', command: 'appc:clean' },
						{ label: 'Take Screenshot', command: 'appc:take-screenshot' },
						{ label: 'Toggle Console', command: 'appc:console:toggle' },
						{ label: 'Toggle related Files', command: 'appc:open-or-close-related' },
						{ label: 'Toggle Toolbar', command: 'appc:toolbar:toggle' },
						{ label: 'Open related Controller…', command: 'appc:open-related-controller' },
						{ label: 'Open related Style…', command: 'appc:open-related-style' },
						{ label: 'Open related View…', command: 'appc:open-related-view' },
						{ label: 'Check For Updates', command: 'appc:update:refresh' }
					]
				}
			]
		}
	]
};
