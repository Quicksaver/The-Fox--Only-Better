moduleAid.VERSION = '1.0.8';

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
	
	AddonManager.getAddonByID("{1f91cde0-c040-11da-a94d-0800200c9a66}", function(addon) {
		moduleAid.loadIf('compatibilityFix/RSSTicker', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID("{ca526f8b-9e0a-4756-9077-19d6f3e64ea8}", function(addon) {
		moduleAid.loadIf('compatibilityFix/TabGroupsManager', (addon && addon.isActive));
	});
	
	moduleAid.load('compatibilityFix/UIEnhancer');
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload('compatibilityFix/downloadsIndicator');
	moduleAid.unload('compatibilityFix/bookmarkedItem');
	moduleAid.unload('compatibilityFix/focusSearch');
	moduleAid.unload('compatibilityFix/TreeStyleTab');
	moduleAid.unload('compatibilityFix/omnibar');
	moduleAid.unload('compatibilityFix/RSSTicker');
	moduleAid.unload('compatibilityFix/TabGroupsManager');
	moduleAid.unload('compatibilityFix/UIEnhancer');
};
