// VERSION 1.0.2

this.AwsesomerUnifiedComplete = {
	get useOverride () { return UnifiedComplete.enabled; },

	onUnifiedComplete: function() {
		if(this.useOverride) {
			this.init();
		} else {
			this.uninit();
		}
	},

	handleEvent: function(e) {
		switch(e.type) {
			case 'SlimChromeMovedNavBar':
				// If we're listening, then we should be initializing it.
				this.init();
				break;
		}
	},

	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case "maxRichResults":
				this.resetPopupMaxResults();
				break;
		}
	},

	resetPopupMaxResults: function() {
		gURLBar.popup._maxResults = 0;
	},

	init: function() {
		let args = gURLBar.getAttribute('autocompletesearch').split(" ");
		let iA = args.indexOf('awesomerunifiedcomplete');
		if(iA == -1) {
			let iU = args.indexOf('unifiedcomplete');
			if(iU > -1) {
				args.splice(iU, 1);
			}
			args.push('awesomerunifiedcomplete');

			gURLBar.setAttribute('autocompletesearch', args.join(" "));
			gURLBar.mSearchNames = null;

			// Make sure we keep it initialized when Slim Chrome resets the binding.
			Listeners.add(gNavBar, 'SlimChromeMovedNavBar', this);
		}

		// Make sure any opened pages already registered with _unifiedComplete are removed from the original instance (no point in memory hogging).
		for(let browser of gBrowser.browsers) {
			if(browser.registeredOpenURI) {
				gBrowser._unifiedComplete.unregisterOpenPage(browser.registeredOpenURI);
			}
		}

		// Replace the original unifiedComplete instance, so that new pages are registered with our instance.
		Object.defineProperty(gBrowser, '_unifiedComplete', {
			configurable: true,
			enumerable: true,
			value: Cc["@mozilla.org/autocomplete/search;1?name=awesomerunifiedcomplete"].getService(Ci.mozIPlacesAutoComplete)
		});

		// Re-register already opened pages.
		for(let browser of gBrowser.browsers) {
			if(browser.registeredOpenURI) {
				gBrowser._unifiedComplete.registerOpenPage(browser.registeredOpenURI);
			}
		}

		Prefs.listen("maxRichResults", this);
		this.resetPopupMaxResults();
	},

	uninit: function() {
		Listeners.remove(gNavBar, 'SlimChromeMovedNavBar', this);

		let args = gURLBar.getAttribute('autocompletesearch').split(" ");
		let iA = args.indexOf('awesomerunifiedcomplete');
		if(iA > -1) {
			args.splice(iA, 1);
			if(Prefs.unifiedcomplete) {
				let iU = args.indexOf('unifiedcomplete');
				if(iU == -1) {
					args.push('unifiedcomplete');
				}
			} else {
				let iI = args.indexOf('urlinline');
				if(iI == -1) {
					args.push('urlinline');
				}
				let iH = args.indexOf('history');
				if(iH == -1) {
					args.push('history');
				}
			}

			gURLBar.setAttribute('autocompletesearch', args.join(" "));
			gURLBar.mSearchNames = null;
		}

		for(let browser of gBrowser.browsers) {
			if(browser.registeredOpenURI) {
				gBrowser._unifiedComplete.unregisterOpenPage(browser.registeredOpenURI);
			}
		}

		Object.defineProperty(gBrowser, '_unifiedComplete', {
			configurable: true,
			enumerable: true,
			value: Cc["@mozilla.org/autocomplete/search;1?name=unifiedcomplete"].getService(Ci.mozIPlacesAutoComplete)
		});

		for(let browser of gBrowser.browsers) {
			if(browser.registeredOpenURI) {
				gBrowser._unifiedComplete.registerOpenPage(browser.registeredOpenURI);
			}
		}

		Prefs.unlisten("maxRichResults", this);
		this.resetPopupMaxResults();
	}
};

Modules.LOADMODULE = function() {
	UnifiedComplete.register(AwsesomerUnifiedComplete);
	if(AwsesomerUnifiedComplete.useOverride) {
		AwsesomerUnifiedComplete.init();
	}
};

Modules.UNLOADMODULE = function() {
	UnifiedComplete.unregister(AwsesomerUnifiedComplete);
	AwsesomerUnifiedComplete.uninit();
};
