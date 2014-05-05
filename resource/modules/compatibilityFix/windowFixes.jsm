moduleAid.VERSION = '1.0.6';

moduleAid.LOADMODULE = function() {
	moduleAid.load('compatibilityFix/downloadsIndicator');
	moduleAid.load('compatibilityFix/bookmarkedItem');
	moduleAid.load('compatibilityFix/focusSearch');
	
	AddonManager.getAddonByID('treestyletab@piro.sakura.ne.jp', function(addon) {
		moduleAid.loadIf('compatibilityFix/TreeStyleTab', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID("omnibar@ajitk.com", function(addon) {
		moduleAid.loadIf('compatibilityFix/omnibar', (addon && addon.isActive));
	});
	
	moduleAid.load('compatibilityFix/UIEnhancer');
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload('compatibilityFix/downloadsIndicator');
	moduleAid.unload('compatibilityFix/bookmarkedItem');
	moduleAid.unload('compatibilityFix/focusSearch');
	moduleAid.unload('compatibilityFix/TreeStyleTab');
	moduleAid.unload('compatibilityFix/omnibar');
	moduleAid.unload('compatibilityFix/UIEnhancer');
};
