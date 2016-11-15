/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 1.1.1

this.TabCenter = {
	id: 'tabcentertest1@mozilla.com',

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
		if(addon.id == this.id) {
			this.disable();

			// Make sure Slim Chrome is re-enabled (if necessary) after having been disabled to allow Tab Center to unload properly.
			toggleSlimChrome();
		}
	},

	onDisabling: function(addon) {
		if(addon.id == this.id) {
			// Tab Center has trouble deinitializing because it can't find the nav-bar in the toolbox.
			// So we disable Slim Chrome to put it back, then re-enable it later once Tab Center is fully unloaded.
			// (This can probably be safely removed once Tab Center is updated.)
			Modules.unload('slimChrome');
		}
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
		// The Sky Lights shouldn't be visible above the veritcal tabs strip.
		// Don't use an external sheet for this, it's just better to load this code per-window as necessary.
		let sscode = '\
			@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n\
			@-moz-document url("'+document.baseURI+'") {\n\
				window['+objName+'_UUID="'+_UUID+'"]:not([tabspinned="true"]) #verticaltabs-box {\n\
					transition: box-shadow 150ms, width 150ms, z-index 0s ease-out 400ms;\n\
				}\n\
				window['+objName+'_UUID="'+_UUID+'"] #verticaltabs-box:hover {\n\
					z-index: 410;\n\
				}\n\
			}';
		Styles.load('tabCenter_'+_UUID, sscode, true);

		Watchers.addAttributeWatcher(document.documentElement, 'tabspinned', this, false, false);

		if(self.slimChrome) {
			slimChrome.delayMove();
		}
	},

	disable: function() {
		Styles.unload('tabCenter_'+_UUID);
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
