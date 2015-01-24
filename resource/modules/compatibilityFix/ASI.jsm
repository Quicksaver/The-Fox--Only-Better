Modules.VERSION = '1.0.0';

this.ASIFixer = function(aEnabled) {
	if(aEnabled) {
		Styles.load('ASI', 'ASI');
	} else {
		Styles.unload('ASI');
	}
};

this.ASIListener = {
	onEnabled: function(addon) {
		if(addon.id == 'australissmall@icons.com') { ASIFixer(true); }
	},
	onDisabled: function(addon) {
		if(addon.id == 'australissmall@icons.com') { ASIFixer(false); }
	}
};

this.toggleASIListener = function(unloaded) {
	if(!UNLOADED && !unloaded && Prefs.slimChrome) {
		AddonManager.addAddonListener(ASIListener);
		AddonManager.getAddonByID('australissmall@icons.com', function(addon) {
			if(addon && addon.isActive) { ASIFixer(true); }
		});
	} else {
		AddonManager.removeAddonListener(ASIListener);
		ASIFixer(false);
	}
};

Modules.LOADMODULE = function() {
	Prefs.listen('slimChrome', toggleASIListener);
	
	toggleASIListener();
};

Modules.UNLOADMODULE = function() {
	toggleASIListener(true);
	
	Prefs.unlisten('slimChrome', toggleASIListener);
};
