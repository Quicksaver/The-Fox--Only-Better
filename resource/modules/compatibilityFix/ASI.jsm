// VERSION 2.0.0

this.ASI = {
	id: 'australissmall@icons.com',

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
		Styles.load('ASI', 'ASI');
	},

	disable: function() {
		Styles.unload('ASI');
	}
};

Modules.LOADMODULE = function() {
	Prefs.listen('slimChrome', ASI);

	if(Prefs.slimChrome) {
		ASI.listen();
	}
};

Modules.UNLOADMODULE = function() {
	ASI.unlisten();

	Prefs.unlisten('slimChrome', ASI);
};
