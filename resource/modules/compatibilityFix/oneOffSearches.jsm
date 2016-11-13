/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 1.0.0

this.oneOffSearches = {
	get enabled() {
		return Services.vc.compare(Services.appinfo.version, "51.0a1") >= 0 && Prefs.oneOffSearches;
	},

	_handlers: new Set(),

	listen: function(handler) {
		this._handlers.add(handler);
	},

	unlisten: function(handler) {
		this._handlers.delete(handler);
	},

	observe: function(aSubject, aTopic, aData) {
		for(let handler of this._handlers) {
			try {
				if(handler.observe) {
					handler.observe(aSubject, aTopic, aData);
				} else {
					handler(aSubject, aTopic, aData);
				}
			}
			catch(ex) {
				Cu.reportError(ex);
			}
		}
	},

	init: function() {
		if(Services.vc.compare(Services.appinfo.version, "51.0a1") >= 0) {
			Prefs.setDefaults({
				oneOffSearches: Services.prefs.getDefaultBranch("browser.urlbar.").getBoolPref("oneOffSearches")
			}, "urlbar", "browser");

			Prefs.listen('oneOffSearches', this);
		}
	},

	uninit: function() {
		if(Services.vc.compare(Services.appinfo.version, "51.0a1") >= 0) {
			Prefs.unlisten('oneOffSearches', this);
		}
	}
}

Modules.LOADMODULE = function() {
	oneOffSearches.init();
};

Modules.UNLOADMODULE = function() {
	oneOffSearches.uninit();
};
