moduleAid.VERSION = '1.0.0';

this.toggleUIEnhancerURLBar = function() {
	// force a reload of this feature, so the breadcrumbs are added back after the nav-bar moves and the location bar binding removes them
	if(prefAid.enhanceURLBar) {
		prefAid.enhanceURLBar = false;
		aSync(function() { prefAid.enhanceURLBar = true; });
	}
};

this.UIEnhancerFixer = function(aEnabled) {
	if(aEnabled) {
		prefAid.setDefaults({ enhanceURLBar: true }, 'UIEnhancer');
		
		listenerAid.add(window, 'LoadedSlimChrome', toggleUIEnhancerURLBar);
	} else {
		listenerAid.remove(window, 'LoadedSlimChrome', toggleUIEnhancerURLBar);
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
	if(!UNLOADED && !unloaded && prefAid.slimChrome) {
		AddonManager.addAddonListener(UIEnhancerListener);
		AddonManager.getAddonByID('UIEnhancer@girishsharma', function(addon) {
			if(addon && addon.isActive) { UIEnhancerFixer(true); }
		});
	} else {
		AddonManager.removeAddonListener(UIEnhancerListener);
		UIEnhancerFixer(false);
	}
};

moduleAid.LOADMODULE = function() {
	prefAid.listen('slimChrome', toggleUIEnhancerListener);
	
	toggleUIEnhancerListener();
};

moduleAid.UNLOADMODULE = function() {
	toggleUIEnhancerListener(true);
	
	prefAid.unlisten('slimChrome', toggleUIEnhancerListener);
};
