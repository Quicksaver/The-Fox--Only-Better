moduleAid.VERSION = '1.0.0';

moduleAid.LOADMODULE = function() {
	AddonManager.getAddonByID('{64161300-e22b-11db-8314-0800200c9a66}', function(addon) {
		moduleAid.loadIf('compatibilityFix/speedDial', (addon && addon.isActive));
	});
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload('compatibilityFix/speedDial');
};
