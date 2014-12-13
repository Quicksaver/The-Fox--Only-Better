Modules.VERSION = '1.0.17';

Modules.LOADMODULE = function() {
	Modules.load('compatibilityFix/downloadsIndicator');
	Modules.load('compatibilityFix/bookmarkedItem');
	Modules.load('compatibilityFix/focusSearch');
	Modules.load('compatibilityFix/identityBox');
	Modules.load('compatibilityFix/devEdition');
	
	AddonManager.getAddonByID('treestyletab@piro.sakura.ne.jp', function(addon) {
		Modules.loadIf('compatibilityFix/TreeStyleTab', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID("omnibar@ajitk.com", function(addon) {
		Modules.loadIf('compatibilityFix/omnibar', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID("{1f91cde0-c040-11da-a94d-0800200c9a66}", function(addon) {
		Modules.loadIf('compatibilityFix/RSSTicker', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID("{ca526f8b-9e0a-4756-9077-19d6f3e64ea8}", function(addon) {
		Modules.loadIf('compatibilityFix/TabGroupsManager', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID("status4evar@caligonstudios.com", function(addon) {
		Modules.loadIf('compatibilityFix/S4E', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID("linklocationbar@gnt.de", function(addon) {
		Modules.loadIf('compatibilityFix/LinkLocationBar', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID("{F5DDF39C-9293-4d5e-9AA8-E04E6DD5E9B4}", function(addon) {
		Modules.loadIf('compatibilityFix/hackBar', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID("{4176DFF4-4698-11DE-BEEB-45DA55D89593}", function(addon) {
		Modules.loadIf('compatibilityFix/AniWeather', (addon && addon.isActive));
	});
	
	Modules.load('compatibilityFix/UIEnhancer');
};

Modules.UNLOADMODULE = function() {
	Modules.unload('compatibilityFix/downloadsIndicator');
	Modules.unload('compatibilityFix/bookmarkedItem');
	Modules.unload('compatibilityFix/focusSearch');
	Modules.unload('compatibilityFix/identityBox');
	Modules.unload('compatibilityFix/devEdition');
	Modules.unload('compatibilityFix/TreeStyleTab');
	Modules.unload('compatibilityFix/omnibar');
	Modules.unload('compatibilityFix/RSSTicker');
	Modules.unload('compatibilityFix/TabGroupsManager');
	Modules.unload('compatibilityFix/S4E');
	Modules.unload('compatibilityFix/LinkLocationBar');
	Modules.unload('compatibilityFix/hackBar');
	Modules.unload('compatibilityFix/AniWeather');
	Modules.unload('compatibilityFix/UIEnhancer');
};
