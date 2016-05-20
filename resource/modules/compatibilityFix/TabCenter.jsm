// VERSION 1.0.0

this.TabCenter = {
	id: 'tabcentertest1@mozilla.com',

	handleEvent: function(e) {
		switch(e.type) {
			case 'SlimChromeNormalActiveArea':
				// With Tab Center enabled, the tabs are placed on the side, so we should make it easier to show the chrome at the top.
				e.preventDefault();
				e.stopPropagation();
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

	attrWatcher: function() {
		if(self.slimChrome) {
			slimChrome.delayMove();
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
		// Don't use an external sheet for this, it's just better to load this code per-window as necessary.
		let sscode = '\
			@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n\
			@-moz-document url("'+document.baseURI+'") {\n\
				window['+objName+'_UUID="'+_UUID+'"] #verticaltabs-box {\n\
					transition: box-shadow 150ms ease-out 300ms, width 150ms ease-out 300ms, z-index 0s ease-out 400ms;\n\
				}\n\
				window['+objName+'_UUID="'+_UUID+'"] #verticaltabs-box:hover {\n\
					z-index: 410;\n\
				}\n\
			}';
		Styles.load('tabCenter_'+_UUID, sscode, true);

		Listeners.add(window, 'SlimChromeNormalActiveArea', this);
		Watchers.addAttributeWatcher(document.documentElement, 'tabspinned', this, false, false);

		if(self.slimChrome) {
			slimChrome.delayMove();
		}
	},

	disable: function() {
		Styles.unload('tabCenter_'+_UUID);
		Listeners.remove(window, 'SlimChromeNormalActiveArea', this);
		Watchers.removeAttributeWatcher(document.documentElement, 'tabspinned', this, false, false);

		if(!UNLOADED && Prefs.slimChrome && self.slimChrome) {
			slimChrome.delayMove();
		}
	}
};

Modules.LOADMODULE = function() {
	Prefs.listen('slimChrome', TabCenter);

	if(Prefs.slimChrome) {
		TabCenter.listen();
	}
};

Modules.UNLOADMODULE = function() {
	TabCenter.unlisten();

	Prefs.unlisten('slimChrome', TabCenter);
};
