moduleAid.VERSION = '1.0.13';

moduleAid.LOADMODULE = function() {
	moduleAid.load('compatibilityFix/downloadsIndicator');
	moduleAid.load('compatibilityFix/bookmarkedItem');
	moduleAid.load('compatibilityFix/focusSearch');
	moduleAid.load('compatibilityFix/identityBox');
	
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
	
	AddonManager.getAddonByID("status4evar@caligonstudios.com", function(addon) {
		moduleAid.loadIf('compatibilityFix/S4E', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID("linklocationbar@gnt.de", function(addon) {
		moduleAid.loadIf('compatibilityFix/LinkLocationBar', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID("{F5DDF39C-9293-4d5e-9AA8-E04E6DD5E9B4}", function(addon) {
		moduleAid.loadIf('compatibilityFix/hackBar', (addon && addon.isActive));
	});
	
	moduleAid.load('compatibilityFix/UIEnhancer');
	
	// changes introduced to the top TabsToolbar/nav-bar divider style,
	// this can be removed in FF32
	toggleAttribute(document.documentElement, objName+'-FF32', Services.vc.compare(Services.appinfo.platformVersion, "32.0a1") >= 0);
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload('compatibilityFix/downloadsIndicator');
	moduleAid.unload('compatibilityFix/bookmarkedItem');
	moduleAid.unload('compatibilityFix/focusSearch');
	moduleAid.unload('compatibilityFix/identityBox');
	moduleAid.unload('compatibilityFix/TreeStyleTab');
	moduleAid.unload('compatibilityFix/omnibar');
	moduleAid.unload('compatibilityFix/RSSTicker');
	moduleAid.unload('compatibilityFix/TabGroupsManager');
	moduleAid.unload('compatibilityFix/S4E');
	moduleAid.unload('compatibilityFix/LinkLocationBar');
	moduleAid.unload('compatibilityFix/hackBar');
	moduleAid.unload('compatibilityFix/UIEnhancer');
	
	removeAttribute(document.documentElement, objName+'-FF32');
};
