Modules.VERSION = '1.0.2';

Modules.LOADMODULE = function() {
	AddonManager.getAddonByID('{64161300-e22b-11db-8314-0800200c9a66}', function(addon) {
		Modules.loadIf('compatibilityFix/speedDial', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID('{77d2ed30-4cd2-11e0-b8af-0800200c9a66}', function(addon) {
		Modules.loadIf('compatibilityFix/FTDeepDark', (addon && addon.isActive));
	});
};

Modules.UNLOADMODULE = function() {
	Modules.unload('compatibilityFix/speedDial');
	Modules.unload('compatibilityFix/FTDeepDark');
};
