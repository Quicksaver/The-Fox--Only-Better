moduleAid.VERSION = '1.0.4';

moduleAid.LOADMODULE = function() {
	AddonManager.getAddonByID('treestyletab@piro.sakura.ne.jp', function(addon) {
		moduleAid.loadIf('compatibilityFix/TreeStyleTab', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID("omnibar@ajitk.com", function(addon) {
		moduleAid.loadIf('compatibilityFix/omnibar', (addon && addon.isActive));
	});
	
	moduleAid.load('compatibilityFix/downloadsIndicator');
	moduleAid.load('compatibilityFix/bookmarkedItem');
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload('compatibilityFix/TreeStyleTab');
	moduleAid.unload('compatibilityFix/omnibar');
	moduleAid.unload('compatibilityFix/downloadsIndicator');
	moduleAid.unload('compatibilityFix/bookmarkedItem');
};
