/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 1.0.6

this.UnifiedComplete = {
	sandbox: null,
	listeners: new Set(),

	get enabled () {
		return this.useOverride() && !!this.sandbox;
	},

	// We only register and load our component if it's needed for any of our custom behavior. Otherwise the native autocomplete component is used.
	useOverride: function() {
		// unifiedcomplete pref was removed in FF49, see bug 1223728
		if(Services.vc.compare(Services.appinfo.version, "49.0a1") < 0) {
			// No point if user doesn't want it in the first place. Normally this should always be true though.
			if(!Prefs.unifiedcomplete) {
				return false;
			}
		}

		return Prefs.awesomerURLBar;
	},

	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'unifiedcomplete':
			case 'awesomerURLBar':
				if(this.useOverride()) {
					this.load();
				} else {
					this.unload();
				}
				break;
		}
	},

	register: function(aListener) {
		this.listeners.add(aListener);
	},

	unregister: function(aListener) {
		this.listeners.delete(aListener);
	},

	callListeners: function() {
		for(let listener of this.listeners) {
			try { listener.onUnifiedComplete(); }
			catch(ex) { Cu.reportError(ex); }
		}
	},

	load: function() {
		if(!this.sandbox) {
			// These preferences are proxies for the following native Firefox preferences.
			Prefs.proxyNative('suggestSearchesEnabled', 'suggest.enabled', true, 'search', 'browser');
			Prefs.proxyNative('suggestSearches', 'suggest.searches', false, 'urlbar', 'browser');
			Prefs.proxyNative('suggestHistory', 'suggest.history', true, 'urlbar', 'browser');
			Prefs.proxyNative('suggestBookmark', 'suggest.bookmark', true, 'urlbar', 'browser');
			Prefs.proxyNative('suggestOpenpage', 'suggest.openpage', true, 'urlbar', 'browser');
			Prefs.proxyNative('maxSuggest', 'maxRichResults', 12, 'urlbar', 'browser');

			let systemPrincipal = Cc["@mozilla.org/systemprincipal;1"].createInstance(Ci.nsIPrincipal);
			this.sandbox = Cu.Sandbox(systemPrincipal, { freshZone: true, sandboxName: objPathString+"-AwesomerUnifiedComplete" });
			Services.scriptloader.loadSubScript("resource://"+objPathString+"/modules/AwesomerUnifiedComplete.js", this.sandbox);
			this.sandbox.UnifiedComplete.prototype._load();
			this.callListeners();
		}
	},

	unload: function() {
		if(this.sandbox) {
			this.sandbox.UnifiedComplete.prototype._unload();
			Cu.nukeSandbox(this.sandbox);
			this.sandbox = null;
			this.callListeners();

			Prefs.unProxyNative('suggest.enabled');
			Prefs.unProxyNative('suggest.searches');
			Prefs.unProxyNative('suggest.history');
			Prefs.unProxyNative('suggest.bookmark');
			Prefs.unProxyNative('suggest.openpage');
			Prefs.unProxyNative('maxRichResults');
		}
	}
};

Modules.LOADMODULE = function() {
	// unifiedcomplete pref was removed in FF49, see bug 1223728
	if(Services.vc.compare(Services.appinfo.version, "49.0a1") < 0) {
		Prefs.setDefaults({ unifiedcomplete: true }, 'urlbar', 'browser');
		Prefs.listen('unifiedcomplete', UnifiedComplete);
	}

	Prefs.listen('awesomerURLBar', UnifiedComplete);

	if(UnifiedComplete.useOverride()) {
		UnifiedComplete.load();
	}
};

Modules.UNLOADMODULE = function() {
	if(Services.vc.compare(Services.appinfo.version, "49.0a1") < 0) {
		Prefs.unlisten('unifiedcomplete', UnifiedComplete);
	}
	Prefs.unlisten('awesomerURLBar', UnifiedComplete);

	UnifiedComplete.unload();
};
