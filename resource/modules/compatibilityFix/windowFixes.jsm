moduleAid.VERSION = '1.0.2';

moduleAid.LOADMODULE = function() {
	AddonManager.getAddonByID('treestyletab@piro.sakura.ne.jp', function(addon) {
		moduleAid.loadIf('compatibilityFix/TreeStyleTab', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID("omnibar@ajitk.com", function(addon) {
		moduleAid.loadIf('compatibilityFix/omnibar', (addon && addon.isActive));
	});
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload('compatibilityFix/TreeStyleTab');
	moduleAid.unload('compatibilityFix/omnibar');
};
