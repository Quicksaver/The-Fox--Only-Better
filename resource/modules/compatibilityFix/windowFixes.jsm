moduleAid.VERSION = '1.0.0';

moduleAid.LOADMODULE = function() {
	moduleAid.load('compatibilityFix/popups');
	
	AddonManager.getAddonByID('treestyletab@piro.sakura.ne.jp', function(addon) {
		moduleAid.loadIf('compatibilityFix/TreeStyleTab', (addon && addon.isActive));
	});
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload('compatibilityFix/TreeStyleTab');
	moduleAid.unload('compatibilityFix/popups');
};
