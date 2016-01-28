// VERSION 1.1.3

this.AwesomerUnifiedComplete = {
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

	searchSettingsBtnCommand: function() {
		//BrowserUITelemetry.countSearchSettingsEvent('urlbar-awesomer');
		openOptions({ pane: 'paneAwesomeBar' });
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

this.AwesomerBar = {
	kXULNS: "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",

	get popup () { return $('PopupAutoCompleteRichResult'); },
	get footer () { return $('urlbar-search-footer'); },
	get oneOffList () { return $(objName+'-urlbar-search-engines'); },
	get hottext () { return $(objName+'-urlbar-search-hottext'); },

	_searchBundle: null,
	get searchBundle () {
		if(!this._bundle) {
			this._searchBundle = Services.strings.createBundle("chrome://browser/locale/search.properties");
		}
		return this._searchBundle;
	},

	currentEngine: null,

	handleEvent: function(e) {
		switch(e.type) {
			case 'popupshowing':
				this.onPopupShowing();
				break;

			case 'mouseover':
				this.setHottext(e.originalTarget);
				break;

			case 'mouseout':
				this.clearHottext();
				break;

			case 'keypress':
				this.onKeypress(e);
				break;
		}
	},

	observe: function(aSubject, aTopic, aData) {
		switch(aTopic) {
			case "nsPref:changed":
				switch(aSubject) {
					case "searchEnginesInURLBar":
						this.toggle();
						break;
				}
				break;

			case "browser-search-engine-modified":
				this.updateCurrentEngine();
				break;
		}
	},

	// this is all closed off in the searchbar's binding handler, so I have to replicate it here and adapt it to the location bar:
	// http://mxr.mozilla.org/mozilla-central/source/browser/components/search/content/search.xml#1158
	onPopupShowing: function() {
		// Clear the hottext label for now.
		this.clearHottext();

		// Clear the list of one-off buttons, we rebuild it each time.
		let list = this.oneOffList;
		while(list.firstChild) {
			list.firstChild.remove();
		}

		// We also show the current (default) search engine in this list, since the option to show the typed text is not visible every time (bug 1175646)
		let hiddenList = Prefs.hiddenOneOffs ? Prefs.hiddenOneOffs.split(",") : [];
		let engines = Services.search.getVisibleEngines().filter(e => hiddenList.indexOf(e.name) == -1);
		for(let engine of engines) {
			let button = document.createElementNS(this.kXULNS, "button");
			button.id = "urlbar-engine-one-off-item-" + engine.name.replace(/ /g, '-');
			let uri = (engine.iconURI) ? engine.iconURI.spec : "chrome://browser/skin/search-engine-placeholder.png";
			button.setAttribute("image", uri);
			button.setAttribute("class", "searchbar-engine-one-off-item");
			button.setAttribute("tooltiptext", engine.name);
			button.setAttribute("hottext", Strings.get("awesomeBar", "searchwith", [ ["%engineName%", engine.name ] ]));
			button.engine = engine;

			button.handleEvent = function(e) {
				switch(e.type) {
					case "click":
						// Right-clicking an engine should make it the current engine and show suggestions from it
						if(e.button == 2) {
							Services.search.currentEngine = this.engine;
							break;
						}

						// We want middle clicks to go through as well
						if(e.button != 1) { break; }

					case "command": {
						let uri;
						let input = gBrowser.userTypedValue;
						if(!input) {
							// When the user hasn't made any input, open the search engine's homepage
							uri = this.engine.searchForm;
						} else {
							let engineName = this.engine.name;
							let searchQuery = gURLBar.value;
							uri = "moz-action:searchengine," + JSON.stringify({ engineName, input, searchQuery });
						}
						gURLBar.value = uri;
						gURLBar.handleCommand(e);
						break;
					}
				}
			};
			button.addEventListener("click", button);
			button.addEventListener("command", button);

			list.appendChild(button);
		}

		// Handle opensearch items.
		let addEngines = gBrowser.selectedBrowser.engines;
		if(addEngines && addEngines.length) {
			for(let engine of addEngines) {
				let button = document.createElementNS(this.kXULNS, "button");
				let label = this.searchBundle.formatStringFromName("cmd_addFoundEngine", [engine.title], 1);
				button.id = "urlbar-add-engine-" + engine.title.replace(/ /g, '-');
				button.setAttribute("class", "addengine-item");
				button.setAttribute("hottext", label);
				button.setAttribute("pack", "start");
				button.setAttribute("crop", "end");
				button.setAttribute("tooltiptext", engine.uri);
				button.setAttribute("uri", engine.uri);
				if(engine.icon) {
					button.setAttribute("image", engine.icon);
				}
				button.setAttribute("title", engine.title);

				button.handleEvent = function(e) {
					switch(e.type) {
						case "command": {
							// On success, rebuild the engines icons (there's no need to hide and show the popup just for this).
							let callback = {
								onSuccess: function(engine) {
									AwesomerBar.onPopupShowing();
								},
								onError: function(errorCode) {
									Cu.reportError("Error adding search engine: " + errorCode);
								}
							};
							Services.search.addEngine(this.getAttribute("uri"), null, this.getAttribute("image"), false, callback);
						}
					}
				};
				button.addEventListener("command", button);

				list.appendChild(button);
			}
		}

		this.updateCurrentEngine();
	},

	updateCurrentEngine: function() {
		// don't bother of course
		let state = this.popup.state;
		if(state != 'open' && state != 'showing') { return; }

		let current = Services.search.currentEngine;
		let list = this.oneOffList;
		for(let child of list.childNodes) {
			if(child.engine === current) {
				setAttribute(child, 'active', 'true');
				this.hottext.emptyValue = current.description || current.name;
			} else {
				removeAttribute(child, 'active');
			}
		}

		this.updateHottext();

		// no point of course
		if(this.currentEngine == current) { return; }
		this.currentEngine = current;

		// Re-do the suggestions to reflect the new engine choice.
		let text = gBrowser.userTypedValue;
		if(text) {
			this.popup.input.controller.startSearch(text);
		}
	},

	setHottext: function(node) {
		let text = node && (node.getAttribute('hottext') || node.getAttribute('tooltiptext'));
		if(text) {
			this.hottext.overrideValue = text;
			this.updateHottext();
		}
	},

	clearHottext: function() {
		this.hottext.overrideValue = '';
		this.updateHottext();
	},

	updateHottext: function() {
		let hottext = this.hottext;
		hottext.value = hottext.overrideValue || hottext.emptyValue || '';
	},

	// Press Ctrl+Up and Ctrl+Down to change the current search engine while typing in the location bar.
	onKeypress: function(e) {
		// don't bother of course
		let state = this.popup.state;
		if(state != 'open' && state != 'showing') { return; }

		let accel = (DARWIN ? e.metaKey : e.ctrlKey);
		if(!accel || e.altKey || e.shiftKey || (DARWIN && e.ctrlKey)) { return; }

		if(e.key != "ArrowUp" && e.key != "ArrowDown") { return; }

		let current;
		let list = this.oneOffList;
		for(let child of list.childNodes) {
			if(child.engine === this.currentEngine) {
				current = child;
				break;
			}
		}
		if(!current) { return; }

		// Some buttons may be there to add engines, so we can't select those with the keyboard obviously.
		let start = current;
		do {
			switch(e.key) {
				case "ArrowUp":
					current = current.previousSibling;
					if(!current) {
						current = list.lastChild;
					}
					break;

				case "ArrowDown":
					current = current.nextSibling;
					if(!current) {
						current = list.firstChild;
					}
					break;
			}
			if(current == start) { return; }
		}
		while(current && !current.engine);

		if(current) {
			e.preventDefault();
			e.stopPropagation();
			if(this.currentEngine != current.engine) {
				Services.search.currentEngine = current.engine;
			}
		}
	},

	toggle: function(unload) {
		if(!unload && Prefs.searchEnginesInURLBar) {
			Overlays.overlayWindow(window, 'awesomeBar', this);
		} else {
			Overlays.removeOverlayWindow(window, 'awesomeBar');
		}
	},

	onLoad: function() {
		// Make sure we don't trigger a synchronous search service usage.
		// See https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIBrowserSearchService.
		Services.search.init(() => { this.onInit(); });
	},

	onInit: function() {
		Prefs.setDefaults({ hiddenOneOffs: '' }, 'search', 'browser');

		this.currentEngine = Services.search.currentEngine;

		Listeners.add(this.popup, 'popupshowing', this);
		Listeners.add(this.footer, 'mouseover', this);
		Listeners.add(this.footer, 'mouseout', this);
		Listeners.add(gURLBar, 'keypress', this, true);

		Observers.add(this, "browser-search-engine-modified");
	},

	onUnload: function() {
		Listeners.remove(this.popup, 'popupshowing', this);
		Listeners.remove(this.footer, 'mouseover', this);
		Listeners.remove(this.footer, 'mouseout', this);
		Listeners.remove(gURLBar, 'keypress', this, true);

		Observers.remove(this, "browser-search-engine-modified");
	}
};

this.toggleAdaptSearchBar = function() {
	Modules.loadIf('adaptSearchBar', Prefs.adaptSearchBar);
};

Modules.LOADMODULE = function() {
	UnifiedComplete.register(AwesomerUnifiedComplete);
	if(AwesomerUnifiedComplete.useOverride) {
		AwesomerUnifiedComplete.init();
	}

	Prefs.listen('searchEnginesInURLBar', AwesomerBar);
	AwesomerBar.toggle();

	Prefs.listen('adaptSearchBar', toggleAdaptSearchBar);
	toggleAdaptSearchBar();
};

Modules.UNLOADMODULE = function() {
	Prefs.unlisten('adaptSearchBar', toggleAdaptSearchBar);
	Modules.unload('adaptSearchBar');

	Prefs.unlisten('searchEnginesInURLBar', AwesomerBar);
	AwesomerBar.toggle(true);

	UnifiedComplete.unregister(AwesomerUnifiedComplete);
	AwesomerUnifiedComplete.uninit();
};
