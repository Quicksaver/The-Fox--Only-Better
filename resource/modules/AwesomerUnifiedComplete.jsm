/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 1.3.0

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
		// The original button in the nightly builds registers each click, so we must do the same since it's still the same button.
		// From discussion in #telemetry, it's acceptable to also do the same for release builds, since the results can be filtered by version.
		window.BrowserUITelemetry.countSearchSettingsEvent('urlbar');
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

		let gFx52 = Services.vc.compare(Services.appinfo.version, "52.0a1") >= 0;

		// Make sure any opened pages already registered with _unifiedComplete are removed from the original instance (no point in memory hogging).
		for(let browser of gBrowser.browsers) {
			if(browser.registeredOpenURI) {
				if(!gFx52) {
					gBrowser._unifiedComplete.unregisterOpenPage(browser.registeredOpenURI);
				} else {
					gBrowser._unifiedComplete.unregisterOpenPage(browser.registeredOpenURI, browser.getAttribute("usercontextid") || 0);
				}
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
				if(!gFx52) {
					gBrowser._unifiedComplete.registerOpenPage(browser.registeredOpenURI);
				} else {
					gBrowser._unifiedComplete.registerOpenPage(browser.registeredOpenURI, browser.getAttribute("usercontextid") || 0);
				}
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
			// unifiedcomplete pref was removed in FF49, see bug 1223728
			if(Services.vc.compare(Services.appinfo.version, "49.0a1") >= 0 || Prefs.unifiedcomplete) {
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

		let gFx52 = Services.vc.compare(Services.appinfo.version, "52.0a1") >= 0;

		for(let browser of gBrowser.browsers) {
			if(browser.registeredOpenURI) {
				if(!gFx52) {
					gBrowser._unifiedComplete.unregisterOpenPage(browser.registeredOpenURI);
				} else {
					gBrowser._unifiedComplete.unregisterOpenPage(browser.registeredOpenURI, browser.getAttribute("usercontextid") || 0);
				}
			}
		}

		Object.defineProperty(gBrowser, '_unifiedComplete', {
			configurable: true,
			enumerable: true,
			value: Cc["@mozilla.org/autocomplete/search;1?name=unifiedcomplete"].getService(Ci.mozIPlacesAutoComplete)
		});

		for(let browser of gBrowser.browsers) {
			if(browser.registeredOpenURI) {
				if(!gFx52) {
					gBrowser._unifiedComplete.registerOpenPage(browser.registeredOpenURI);
				} else {
					gBrowser._unifiedComplete.registerOpenPage(browser.registeredOpenURI, browser.getAttribute("usercontextid") || 0);
				}
			}
		}

		Prefs.unlisten("maxRichResults", this);
		this.resetPopupMaxResults();
	}
};

this.AwesomerBar = {
	kXULNS: "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",

	// To make sure there are at least 4 engines in a single row and there are a maximum of 4 rows, if not just cut out any extra engines.
	kMinEnginesPerRow: 4,
	kMaxEngineRows: 4,

	get popup () { return $('PopupAutoCompleteRichResult'); },
	get footer () { return $('urlbar-search-footer'); },
	get searchPopup () { return $('PopupSearchAutoComplete'); },
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

			// These are clicks in the search bar's engine icons. For consistency, right-clicks in those will do the same as
			// right-clicking engines in the location bar: instead of showing a context menu, it sets the engine as the current one.
			// This can be disabled using a hidden preference though if necessary.
			case 'click':
				// Does the user even want to modify the right click behavior?
				// 0 uses original context menu behavior,
				// 1 right click to set default,
				// 2 right click shows context menu, shift+right click sets as default
				// 3 left click does one-off, shift+left click sets as default
				if(Prefs.rightClickEngines == 0) { return; }

				// 2 and 3 require shift
				if(Prefs.rightClickEngines > 1 && !e.shiftKey) { return; }

				// We're only interested in right-clicks here.
				if(Prefs.rightClickEngines < 3 && e.button != 2) { return; }

				// Otherwise really only want left clicks only
				if(Prefs.rightClickEngines == 3 && e.button != 0) { return; }

				// We only want to alter the behavior of one-off search icons.
				let target = e.originalTarget;
				if(!target.classList.contains('searchbar-engine-one-off-item') || !target.engine) { return; }

				// Alright, we're through, so cancel showing the context menu, and select the default engine directly.
				e.preventDefault();
				e.stopPropagation();

				// The binding in search.xml doesn't expose the building routine of the panel. So we have to do it here like it does.
				let selectEngine = target.engine;
				let currentEngine = Services.search.currentEngine;

				// Make the target button of the context menu reflect the current search engine first.
				// Doing this as opposed to rebuilding all the one-off buttons avoids flicker.
				target.id = "searchbar-engine-one-off-item-" + currentEngine.name.replace(/ /g, '-');
				let uri = (currentEngine.iconURI) ? currentEngine.iconURI.spec : "chrome://browser/skin/search-engine-placeholder.png";
				target.setAttribute("image", uri);
				target.setAttribute("tooltiptext", currentEngine.name);
				target.engine = currentEngine;

				Services.search.currentEngine = selectEngine;
				break;
		}
	},

	observe: function(aSubject, aTopic, aData) {
		switch(aTopic) {
			case "nsPref:changed":
				switch(aSubject) {
					case "searchEnginesInURLBar":
					case "oneOffSearches":
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

						// userTypedValue is null in case we came from the adaptable search bar, pasting its value to the location bar,
						// in which case we want to re-use the search term.
						if(!input && self.gSearchBar && gSearchBar.value && gSearchBar.value == gURLBar.value) {
							input = gURLBar.value;
						}

						if(!input) {
							// When the user hasn't made any input, open the search engine's homepage
							uri = this.engine.searchForm;
						} else {
							let engineName = this.engine.name;
							let searchQuery = gURLBar.textValue || gURLBar.value;
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
									if(errorCode != Ci.nsISearchInstallCallback.ERROR_DUPLICATE_ENGINE) {
										// Download error is shown by the search service
										return;
									}

									// I don't particularly agree with this behavior, but it's what the original code does,
									// and I don't want to create inconsistencies. So...
									// See bug 1222107.
									let kSearchBundleURI = "chrome://global/locale/search/search.properties";
									let searchBundle = Services.strings.createBundle(kSearchBundleURI);
									let brandBundle = $("bundle_brand");
									let brandName = brandBundle.getString("brandShortName");
									let title = searchBundle.GetStringFromName("error_invalid_engine_title");
									let text = searchBundle.formatStringFromName(
										"error_duplicate_engine_msg", [ brandName, target.getAttribute("uri") ], 2
									);
									Services.prompt.QueryInterface(Ci.nsIPromptFactory);
									let prompt = Services.prompt.getPrompt(gBrowser.contentWindow, Ci.nsIPrompt);
									prompt.QueryInterface(Ci.nsIWritablePropertyBag2);
									prompt.setPropertyAsBool("allowTabModal", true);
									prompt.alert(title, text);
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

		// This is how we implement multi-line search engines in the location bar, we simply limit the max-width of the engines container,
		// based on the total panel width:
		// - 180px minimum width should leave enough space for at least 3 buttons.
		// - leave 13.5em width for the status label, 14em in hidpi
		// - leave another 57px for the settings button, 75px in hidpi
		// For instance, in a panel that's 850px wide, this should fit 11 search engine icons comfortably.
		let maxwidth = Math.max(180, this.popup.boxObject.width);
		let minwidth = 57 *this.kMinEnginesPerRow; // rough default approximation of each engine button width
		let maxheight = 35 *this.kMaxEngineRows; // rough default approximantion of each engine button height
		if(list.firstChild) {
			minwidth = list.firstChild.boxObject.width *this.kMinEnginesPerRow;
			maxheight = list.firstChild.boxObject.height *this.kMaxEngineRows;
		}
		let sscode = '\
			@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n\
			@-moz-document url("'+document.baseURI+'") {\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-urlbar-search-engines,\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-urlbar-search-engines-container {\n\
					max-height: '+maxheight+'px;\n\
					min-width: '+minwidth+'px;\n\
					max-width: calc('+maxwidth+'px - 13.5em - 57px);\n\
				}\n\
				@media (min-resolution: 1.1dppx) {\n\
					window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-urlbar-search-engines,\n\
					window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-urlbar-search-engines-container {\n\
						max-width: calc('+maxwidth+'px - 14em - 75px);\n\
					}\n\
				}\n\
			}';
		Styles.load('searchEnginesInURLBar_'+_UUID, sscode, true);

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
		hottext.textContent = hottext.overrideValue || hottext.emptyValue || '';
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
		if(!unload && !oneOffSearches.enabled && Prefs.searchEnginesInURLBar) {
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
		Listeners.add(this.searchPopup, 'click', this, true);
		Listeners.add(gURLBar, 'keypress', this, true);

		Observers.add(this, "browser-search-engine-modified");
	},

	onUnload: function() {
		Styles.unload('searchEnginesInURLBar_'+_UUID);

		Listeners.remove(this.popup, 'popupshowing', this);
		Listeners.remove(this.footer, 'mouseover', this);
		Listeners.remove(this.footer, 'mouseout', this);
		Listeners.remove(this.searchPopup, 'click', this, true);
		Listeners.remove(gURLBar, 'keypress', this, true);

		Observers.remove(this, "browser-search-engine-modified");
	}
};

this.suggestionsPanel = {
	get gFx48 () {
		delete this.gFx48;
		this.gFx48 = Services.vc.compare(Services.appinfo.version, "48.0a1") >= 0;
		return this.gFx48;
	},

	get popup () { return $('PopupAutoCompleteRichResult'); },

	_titleStart: 0,
	get titleStart() {
		return this._titleStart;
	},
	set titleStart(v) {
		if(this._titleStart != v) {
			this._titleStart = v;
			this.setupTitleStart();
		}
		return this._titleStart;
	},

	handleEvent: function(e) {
		switch(e.type) {
			// Not needed with FF48
			case 'popupshowing':
				// When using the slim style, we need to set a specific width on one of the nodes of each item,
				// it's unfortunate that we can't just use percentages directly in the main stylesheet (simply doesn't work).
				let width = Math.max(200, Math.ceil(this.popup.boxObject.width /2));
				let sscode = '\
					@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n\
					@-moz-document url("'+document.baseURI+'") {\n\
						window['+objName+'_UUID="'+_UUID+'"] #PopupAutoCompleteRichResult[awesomerStyle="slim"] .ac-title-box {\n\
							min-width: '+width+'px;\n\
							max-width: '+width+'px;\n\
						}\n\
					}';
				Styles.load('awesomerStyleSlim_'+_UUID, sscode, true);
				break;

			case 'LoadedSlimChrome':
			case 'UnloadedSlimChrome':
				this.setupURLBar();
				break;

			// used to capture right clicks in suggestions and paste their value to the urlbar
			case 'click': {
				if(e.button != 2) { break; }

				let item = this.popup.richlistbox && this.popup.richlistbox.currentItem;
				if(!item || !isAncestor(e.originalTarget, item)) { break; }

				let url = item.getAttribute('displayurl') || item.getAttribute('url');
				let parse = gURLBar._parseActionUrl(url);
				if(parse && parse.params && parse.params.input) {
					url = parse.params.input;
				}
				gURLBar.value = url;
				gURLBar.select();
				break;
			}
		}
	},

	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case "awesomerStyle":
				if(!this.gFx48) {
					this.toggleListeners();
				}
				this.setStyle();
				// no break, we also need to update the max rows when the style changes

			case "richMaxSearchRows":
			case "slimMaxSearchRows":
			case "frogMaxSearchRows":
				this.setMaxRows();
				break;

			case "awesomerColor":
				this.setColor();
				break;
		}
	},

	setStyle: function() {
		setAttribute(this.popup, 'awesomerStyle', Prefs.awesomerStyle);

		// Make sure the popup knows its rows height has changed, it should recalculate each row's height.
		this.popup._rowHeight = 0;
	},

	setMaxRows: function() {
		if(this.popup._normalMaxRows >= 0) {
			this.popup._normalMaxRows = Prefs[Prefs.awesomerStyle+'MaxSearchRows'];
		} else {
			gURLBar.maxRows = Prefs[Prefs.awesomerStyle+'MaxSearchRows'];
		}
	},

	setColor: function() {
		setAttribute(this.popup, 'awesomerColor', Prefs.awesomerColor);
	},

	toggleListeners: function() {
		if(Prefs.awesomerStyle == 'slim') {
			Listeners.add(this.popup, 'popupshowing', this);
		} else {
			this.unsetListeners();
		}
	},

	unsetListeners: function() {
		Listeners.remove(this.popup, 'popupshowing', this);

		// Mkae sure we also unload the stylesheet, as it won't be needed anymore.
		Styles.unload('awesomerStyleSlim_'+_UUID);
	},

	setupURLBar: function() {
		if(!gURLBar._maxDropMarkerRows) {
			gURLBar._maxDropMarkerRows = gURLBar.maxDropMarkerRows;
		}

		// Always define this when calling this method, because it comes from an XBL binding it likes to reset back to the default field value.
		Object.defineProperty(gURLBar, 'maxDropMarkerRows', {
			configurable: true,
			enumerable: true,
			get: function() { return Prefs[Prefs.awesomerStyle+'MaxDropMarkerRows']; }
		});

		if(!gURLBar._backupMaxRows) {
			gURLBar._backupMaxRows = (this.popup._normalMaxRows >= 0) ? this.popup._normalMaxRows : gURLBar.maxRows;
		}
		this.setMaxRows();
	},

	// Doing it dynamically instead of overriding the binding (which I hate), we have to make sure labels aren't cropped unnecessarily.
	setupRichlistItems: function() {
		let popup = this.popup;
		let popupOpen = popup.popupOpen;

		let items = popup.richlistbox.childNodes;
		for(let item of items) {
			let piggybacked = Piggyback.add('awesomerStyle', item, '_handleOverflow', function() {
				let itemRect = this.getBoundingClientRect();
				let titleRect = this._titleText.getBoundingClientRect();
				let tagsRect = this._tagsText.getBoundingClientRect();
				let separatorRect = this._separator.getBoundingClientRect();
				let urlRect = this._urlText.getBoundingClientRect();
				let actionRect = this._actionText.getBoundingClientRect();
				let separatorURLActionWidth = separatorRect.width + Math.max(urlRect.width, actionRect.width);

				// Total width for the title and URL/action is the width of the item minus the start of the title text minus a little optional extra padding.
				// This extra padding amount is basically arbitrary but keeps the text from getting too close to the popup's edge.
				let dir = this.getAttribute("dir");
				let titleStart = dir == "rtl" ? itemRect.right - titleRect.right : titleRect.left - itemRect.left;

				// Keep this updated in case of any changes (themes?).
				suggestionsPanel.titleStart = titleStart;

				let popup = this.parentNode.parentNode;
				let itemWidth = itemRect.width - titleStart - popup.overflowPadding;

				if(this._tags.hasAttribute("empty")) {
					// The tags box is not displayed in this case.
					tagsRect.width = 0;
				}
				let titleTagsWidth = titleRect.width + tagsRect.width;

				switch(Prefs.awesomerStyle) {
					case "slim":
						if(titleTagsWidth + separatorURLActionWidth > itemWidth) {
							// Title + tags + URL/action overflows the item width.

							// The percentage of the item width allocated to the title and tags.
							let titleTagsPct = 0.66;

							let titleTagsAvailable = itemWidth - separatorURLActionWidth;
							let titleTagsMaxWidth = Math.max(titleTagsAvailable, itemWidth * titleTagsPct);
							if(titleTagsWidth > titleTagsMaxWidth) {
								// Title + tags overflows the max title + tags width.

								// The percentage of the title + tags width allocated to the title.
								let titlePct = 0.33;

								let titleAvailable = titleTagsMaxWidth - tagsRect.width;
								let titleMaxWidth = Math.max(titleAvailable, titleTagsMaxWidth * titlePct);
								let tagsAvailable = titleTagsMaxWidth - titleRect.width;
								let tagsMaxWidth = Math.max(tagsAvailable, titleTagsMaxWidth * (1 - titlePct));
								this._titleText.style.maxWidth = titleMaxWidth + "px";
								this._tagsText.style.maxWidth = tagsMaxWidth + "px";
							}
							let urlActionMaxWidth = Math.max(itemWidth - titleTagsWidth, itemWidth * (1 - titleTagsPct));
							urlActionMaxWidth -= separatorRect.width;
							this._urlText.style.maxWidth = urlActionMaxWidth + "px";
							this._actionText.style.maxWidth = urlActionMaxWidth + "px";
						}
						break;

					default:
						if(titleTagsWidth > itemWidth) {
							// Title + tags overflows the max title + tags width.

							// The percentage of the title + tags width allocated to the title.
							let titlePct = 0.33;

							let titleAvailable = itemWidth - tagsRect.width;
							let titleMaxWidth = Math.max(titleAvailable, itemWidth * titlePct);
							let tagsAvailable = itemWidth - titleRect.width;
							let tagsMaxWidth = Math.max(tagsAvailable, itemWidth * (1 - titlePct));
							this._titleText.style.maxWidth = titleMaxWidth + "px";
							this._tagsText.style.maxWidth = tagsMaxWidth + "px";
						}

						if(separatorURLActionWidth > itemWidth) {
							this._urlText.style.maxWidth = itemWidth + "px";
							this._actionText.style.maxWidth = itemWidth + "px";
						}
						break;
				}

				// Url/action bits won't be visible in Rich and Frog styles until this runs, to prevent them jumping around the first time the panel is opened.
				setAttribute(this, 'positioned', 'true');
			});

			if(piggybacked && popupOpen) {
				item.handleOverUnderflow();
			}
		}
	},

	// The position of the url/action text in the entries depends on where their titles are positioned as well.
	// (Calculating from hard-coded CSS values doesn't seem very reliable, in addition there is some dynamic margin being applied to align page icons with identity box sometimes.)
	setupTitleStart: function() {
		let sscode = '\
			@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n\
			@-moz-document url("'+document.baseURI+'") {\n\
				window['+objName+'_UUID="'+_UUID+'"] #PopupAutoCompleteRichResult[awesomerStyle="rich"] .autocomplete-richlistitem:-moz-locale-dir(ltr) :-moz-any(.ac-url, .ac-action),\n\
				window['+objName+'_UUID="'+_UUID+'"] #PopupAutoCompleteRichResult[awesomerStyle="frog"] .autocomplete-richlistitem:-moz-locale-dir(ltr)[selected="true"] :-moz-any(.ac-url, .ac-action) {\n\
					left: '+this.titleStart+'px;\n\
				}\n\
				window['+objName+'_UUID="'+_UUID+'"] #PopupAutoCompleteRichResult[awesomerStyle="rich"] .autocomplete-richlistitem:-moz-locale-dir(rtl) :-moz-any(.ac-url, .ac-action),\n\
				window['+objName+'_UUID="'+_UUID+'"] #PopupAutoCompleteRichResult[awesomerStyle="frog"] .autocomplete-richlistitem:-moz-locale-dir(rtl)[selected="true"] :-moz-any(.ac-url, .ac-action) {\n\
					right: '+this.titleStart+'px;\n\
				}\n\
			}';
		Styles.load('titleStart_'+_UUID, sscode, true);
	},

	init: function() {
		Overlays.overlayWindow(window, (this.gFx48) ? 'suggestionsPanel48' : 'suggestionsPanel');

		let gFx48 = this.gFx48;

		// The rows don't have the same height in every style, the original method doesn't know how to handle that.
		Piggyback.add('awesomerStyle', this.popup, 'adjustHeight', function() {
			// Figure out how many rows to show
			let rows = this.richlistbox.childNodes;
			let numRows = Math.min(this._matchCount, this.maxRows, rows.length);

			this.removeAttribute("height");

			// Default the height to 0 if we have no rows to show
			let height = 0;
			if(numRows) {
				if(!gFx48 || this._rlbPadding == undefined) {
					let style = window.getComputedStyle(this.richlistbox);

					let transition = style.transitionProperty;
					this._rlbAnimated = transition && transition != "none";

					if(gFx48) {
						let paddingTop = parseInt(style.paddingTop) || 0;
						let paddingBottom = parseInt(style.paddingBottom) || 0;
						this._rlbPadding = paddingTop + paddingBottom;
					}
				}

				switch(Prefs.awesomerStyle) {
					case "frog":
						if(!this._rowHeight) {
							let selectedRow = this.richlistbox.selectedItem;
							let normalRow = rows[0];
							if(normalRow == selectedRow) {
								normalRow = normalRow.nextSibling;
							}

							let heights = {};
							if(selectedRow) {
								heights.selected = selectedRow.getBoundingClientRect().height;
							}
							if(normalRow) {
								heights.normal = normalRow.getBoundingClientRect().height;
							}

							// We got both sizes, awesome. Use them as usual
							if(selectedRow && normalRow) {
								this._rowHeight = heights;
							}

							// If we have a selected row but no normal rows, then we only have the one row. It works actually.
							else if(selectedRow) {
								height = heights.selected;
								this.richlistbox.style.maxHeight = heights.selected + "px";
							}

							// If we only have unselected rows, try to cope for now by adding space for one extra row.
							else {
								height = heights.normal * (numRows +1);
								this.richlistbox.style.maxHeight = (heights.normal * (this.maxRows +1)) + "px";
							}
						}

						if(this._rowHeight) {
							// Calculate the height to have the first row to last row shown
							height = this._rowHeight.selected + (this._rowHeight.normal * (numRows -1));

							// Set a fixed max-height to avoid flicker when growing the panel.
							this.richlistbox.style.maxHeight = (this._rowHeight.selected + (this._rowHeight.normal * (this.maxRows -1)) + (gFx48 ? this._rlbPadding : 0)) + "px";
						}
						break;

					default:
						if(!this._rowHeight) {
							let firstRowRect = rows[0].getBoundingClientRect();
							this._rowHeight = firstRowRect.height;
						}

						// Calculate the height to have the first row to last row shown
						height = this._rowHeight * numRows;

						// Set a fixed max-height to avoid flicker when growing the panel.
						this.richlistbox.style.maxHeight = ((this._rowHeight * this.maxRows) + (gFx48 ? this._rlbPadding : 0)) + "px";
						break;
				}

				if(gFx48) {
					height += this._rlbPadding;
				}
			}

			let animate = this._rlbAnimated && !trueAttribute(this, "dontanimate");
			let currentHeight = this.richlistbox.getBoundingClientRect().height;
			let setHeight = () => {
				if(animate) {
					this.richlistbox.removeAttribute("height");
					this.richlistbox.style.height = height + "px";
				} else {
					this.richlistbox.style.removeProperty("height");
					this.richlistbox.height = height;
				}
			};
			if(height > currentHeight) {
				// Grow immediately.
				setHeight();
			} else {
				// Delay shrinking to avoid flicker.
				Timers.init('awesomerShrinkTimeout', () => {
					this._collapseUnusedItems();
					setHeight();
				}, this.mInput.shrinkDelay);
			}

			// By now, all the entries should already be visible. So make sure they aren't cropped to the edge if using a style other than slim.
			if(gFx48) {
				suggestionsPanel.setupRichlistItems();
			}
		});

		// Make this method compatible with the piggyback above
		Piggyback.add('awesomerStyle', this.popup, '_invalidate', function() {
			Timers.cancel('awesomerShrinkTimeout');
			return true;
		}, Piggyback.MODE_BEFORE);

		Prefs.listen('richMaxSearchRows', this);
		Prefs.listen('slimMaxSearchRows', this);
		Prefs.listen('frogMaxSearchRows', this);
		Prefs.listen('awesomerStyle', this);
		Prefs.listen('awesomerColor', this);

		Listeners.add(window, 'LoadedSlimChrome', this);
		Listeners.add(window, 'UnloadedSlimChrome', this);
		Listeners.add(this.popup, 'click', this);

		this.setStyle();
		this.setColor();
		this.setupURLBar();

		if(!this.gFx48) {
			this.toggleListeners();
		}
	},

	uninit: function() {
		Overlays.removeOverlayWindow(window, (this.gFx48) ? 'suggestionsPanel48' : 'suggestionsPanel');

		Styles.unload('titleStart_'+_UUID);

		Listeners.remove(window, 'LoadedSlimChrome', this);
		Listeners.remove(window, 'UnloadedSlimChrome', this);
		Listeners.remove(this.popup, 'click', this);
		Prefs.unlisten('richMaxSearchRows', this);
		Prefs.unlisten('slimMaxSearchRows', this);
		Prefs.unlisten('frogMaxSearchRows', this);
		Prefs.unlisten('awesomerStyle', this);
		Prefs.unlisten('awesomerColor', this);
		removeAttribute(this.popup, 'awesomerStyle');
		removeAttribute(this.popup, 'awesomerColor');
		this.popup._rowHeight = 0;

		Piggyback.revert('awesomerStyle', this.popup, 'adjustHeight');
		Piggyback.revert('awesomerStyle', this.popup, '_invalidate');

		Object.defineProperty(gURLBar, 'maxDropMarkerRows', {
			configurable: true,
			enumerable: true,
			value: gURLBar._maxDropMarkerRows || 14,
			writable: false
		});
		delete gURLBar._maxDropMarkerRows;

		if(this.popup._normalMaxRows >= 0) {
			this.popup._normalMaxRows = gURLBar._backupMaxRows || -1;
		} else {
			gURLBar.maxRows = gURLBar._backupMaxRows || 6;
		}
		delete gURLBar._backupMaxRows;

		if(!this.gFx48) {
			this.unsetListeners();
		} else {
			let items = this.popup.richlistbox.childNodes;
			for(let item of items) {
				Piggyback.revert('awesomerStyle', item, '_handleOverflow');
				removeAttribute(item, 'positioned');
			}
		}
	}
};

Modules.LOADMODULE = function() {
	UnifiedComplete.register(AwesomerUnifiedComplete);
	if(AwesomerUnifiedComplete.useOverride) {
		AwesomerUnifiedComplete.init();
	}

	Prefs.listen('searchEnginesInURLBar', AwesomerBar);
	oneOffSearches.listen(AwesomerBar);
	AwesomerBar.toggle();

	suggestionsPanel.init();
};

Modules.UNLOADMODULE = function() {
	suggestionsPanel.uninit();

	Prefs.unlisten('searchEnginesInURLBar', AwesomerBar);
	oneOffSearches.unlisten(AwesomerBar);
	AwesomerBar.toggle(true);

	UnifiedComplete.unregister(AwesomerUnifiedComplete);
	AwesomerUnifiedComplete.uninit();
};
