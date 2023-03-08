module.exports = {
	items: [
		{
			label: 'Packages',
			submenu: [
				{
					label: 'Titanium SDK',
					submenu: [
						{ label: 'Add Component', command: 'titanium:generate' },
						{ label: 'Build', command: 'titanium:build' },
						{ label: 'Clean Project', command: 'titanium:clean' },
						{ label: 'Take Screenshot', command: 'titanium:take-screenshot' },
						{ label: 'Toggle Console', command: 'titanium:console:toggle' },
						{ label: 'Toggle related Files', command: 'titanium:open-or-close-related' },
						{ label: 'Toggle Toolbar', command: 'titanium:toolbar:toggle' },
						{ label: 'Open related Controller…', command: 'titanium:open-related-controller' },
						{ label: 'Open related Style…', command: 'titanium:open-related-style' },
						{ label: 'Open related View…', command: 'titanium:open-related-view' },
						{ label: 'Check For Updates', command: 'titanium:update:refresh' }
					]
				}
			]
		}
	]
};
