// VERSION 1.0.2

this.UnifiedComplete = {
	sandbox: null,
	listeners: new Set(),

	get enabled () {
		return this.useOverride() && !!this.sandbox;
	},

	// We only register and load our component if it's needed for any of our custom behavior. Otherwise the native autocomplete component is used.
	useOverride: function() {
		// No point if user doesn't want it in the first place. Normally this should always be true though.
		return Prefs.unifiedcomplete;
	},

	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'unifiedcomplete':
				if(this.useOverride) {
					this.init();
				} else {
					this.uninit();
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
		}
	}
};

Modules.LOADMODULE = function() {
	// These preferences are proxies for the following native Firefox preferences.
	Prefs.proxyNative('suggestSearchesEnabled', 'suggest.enabled', true, 'search', 'browser');
	Prefs.proxyNative('suggestSearches', 'suggest.searches', false, 'urlbar', 'browser');
	Prefs.proxyNative('suggestHistory', 'suggest.history', true, 'urlbar', 'browser');
	Prefs.proxyNative('suggestBookmark', 'suggest.bookmark', true, 'urlbar', 'browser');
	Prefs.proxyNative('suggestOpenpage', 'suggest.openpage', true, 'urlbar', 'browser');
	Prefs.proxyNative('maxSuggest', 'maxRichResults', 12, 'urlbar', 'browser');

	Prefs.setDefaults({ unifiedcomplete: true }, 'urlbar', 'browser');

	Prefs.listen('unifiedcomplete', UnifiedComplete);

	if(UnifiedComplete.useOverride) {
		UnifiedComplete.load();
	}
};

Modules.UNLOADMODULE = function() {
	Prefs.unlisten('unifiedcomplete', UnifiedComplete);

	UnifiedComplete.unload();
};
