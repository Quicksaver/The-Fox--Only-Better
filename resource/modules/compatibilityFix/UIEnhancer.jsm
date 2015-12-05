// VERSION 2.0.0

this.UIEnhancer = {
	id: 'UIEnhancer@girishsharma',

	handleEvent: function(e) {
		switch(e.type) {
			case 'LoadedSlimChrome':
				// force a reload of this feature, so the breadcrumbs are added back after the nav-bar moves and the location bar binding removes them
				if(Prefs.enhanceURLBar) {
					Prefs.enhanceURLBar = false;
					aSync(function() { Prefs.enhanceURLBar = true; });
				}
				break;
		}
	},

	observe: function(aSubject, aTopic, aData) {
		if(Prefs.slimChrome) {
			this.listen();
		} else {
			this.unlisten();
		}
	},

	onEnabled: function(addon) {
		if(addon.id == this.id) { this.enable(); }
	},

	onDisabled: function(addon) {
		if(addon.id == this.id) { this.disable(); }
	},

	listen: function() {
		AddonManager.addAddonListener(this);
		AddonManager.getAddonByID(this.id, (addon) => {
			if(addon && addon.isActive) { this.enable(); }
		});
	},

	unlisten: function() {
		AddonManager.removeAddonListener(this);
		this.disable();
	},

	enable: function() {
		Prefs.setDefaults({ enhanceURLBar: true }, 'UIEnhancer');

		Listeners.add(window, 'LoadedSlimChrome', this);
	},

	disable: function() {
		Listeners.remove(window, 'LoadedSlimChrome', this);
	}
};

Modules.LOADMODULE = function() {
	Prefs.listen('slimChrome', UIEnhancer);

	if(Prefs.slimChrome) {
		UIEnhancer.listen();
	}
};

Modules.UNLOADMODULE = function() {
	UIEnhancer.unlisten();

	Prefs.unlisten('slimChrome', UIEnhancer);
};
