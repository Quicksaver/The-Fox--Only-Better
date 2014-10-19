Modules.VERSION = '1.0.1';

this.toggleUIEnhancerURLBar = function() {
	// force a reload of this feature, so the breadcrumbs are added back after the nav-bar moves and the location bar binding removes them
	if(Prefs.enhanceURLBar) {
		Prefs.enhanceURLBar = false;
		aSync(function() { Prefs.enhanceURLBar = true; });
	}
};

this.UIEnhancerFixer = function(aEnabled) {
	if(aEnabled) {
		Prefs.setDefaults({ enhanceURLBar: true }, 'UIEnhancer');
		
		Listeners.add(window, 'LoadedSlimChrome', toggleUIEnhancerURLBar);
	} else {
		Listeners.remove(window, 'LoadedSlimChrome', toggleUIEnhancerURLBar);
	}
};

this.UIEnhancerListener = {
	onEnabled: function(addon) {
		if(addon.id == 'UIEnhancer@girishsharma') { UIEnhancerFixer(true); }
	},
	onDisabled: function(addon) {
		if(addon.id == 'UIEnhancer@girishsharma') { UIEnhancerFixer(false); }
	}
};

this.toggleUIEnhancerListener = function(unloaded) {
	if(!UNLOADED && !unloaded && Prefs.slimChrome) {
		AddonManager.addAddonListener(UIEnhancerListener);
		AddonManager.getAddonByID('UIEnhancer@girishsharma', function(addon) {
			if(addon && addon.isActive) { UIEnhancerFixer(true); }
		});
	} else {
		AddonManager.removeAddonListener(UIEnhancerListener);
		UIEnhancerFixer(false);
	}
};

Modules.LOADMODULE = function() {
	Prefs.listen('slimChrome', toggleUIEnhancerListener);
	
	toggleUIEnhancerListener();
};

Modules.UNLOADMODULE = function() {
	toggleUIEnhancerListener(true);
	
	Prefs.unlisten('slimChrome', toggleUIEnhancerListener);
};
