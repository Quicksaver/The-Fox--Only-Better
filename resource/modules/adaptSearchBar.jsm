// VERSION 1.1.3

this.__defineGetter__('gSearchBar', function() { return $('searchbar'); });

this.adaptSearchBar = {
	initialized: false,

	get nonEmptyMode () { return Prefs.awesomerURLBar && Prefs.searchEnginesInURLBar && Prefs.showOnlyNonEmptySearchBar; },

	receiveMessage: function(m) {
		let name = Messenger.messageName(m);

		switch(name) {
			case 'AdaptSearchBar:Value':
				m.target._adaptSearchValue = m.data;
				this.updateSearchBar();
				break;
		}
	},

	handleEvent: function(e) {
		switch(e.type) {
			case 'TabSelect':
				this.updateSearchBar();
				break;

			case 'focus':
				if(!this.nonEmptyMode) { break; }

				switch(e.target) {
					// We don't want to focus the search bar in this case, focus the location bar instead..
					case gSearchBar:
						e.preventDefault();
						e.stopPropagation();
						// When the search bar isn't empty (always in this case? unless some add-on triggers this somehow)
						// use its value in the location bar as well
						if(gSearchBar.value) {
							gURLBar.value = gSearchBar.value;
							gURLBar.valueIsTyped = false;
							gURLBar.userTypedValue = null;
						}
						gURLBar.focus();
						break;

					// Always hide the search bar if the cursor is in the location bar.
					case gURLBar:
						this.maybeHideSearchBar();
						break;
				}
				break;

			case 'blur':
				if(!this.nonEmptyMode) { break; }

				// When bluring the location bar, we should revert its search value back to the current location if the user didn't change it.
				if(!this.maybeHideSearchBar() && (!gURLBar.value || gURLBar.value == gSearchBar.value)) {
					gURLBar.handleRevert();
				}
				break;
		}
	},

	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'showOnlyNonEmptySearchBar':
			case 'searchEnginesInURLBar':
			case 'awesomerURLBar':
				this.toggleShowOnlyNonEmptySearchBar();
				break;
		}
	},

	onWidgetAdded: function(aWidgetId) {
		if(aWidgetId == 'search-container') {
			this.init();
		}
	},

	onWidgetRemoved: function(aWidgetId) {
		if(aWidgetId == 'search-container') {
			this.deinit();
		}
	},

	init: function() {
		if(this.initialized) { return; }

		// this probably means the search bar has been removed by the user in customize mode,
		// our CustomizableUI handlers will reinit this if necessary if it's added back
		if(!gSearchBar) { return; }

		this.initialized = true;

		Listeners.add(gBrowser.tabContainer, 'TabSelect', adaptSearchBar);

		Messenger.listenWindow(window, 'AdaptSearchBar:Value', adaptSearchBar);
		Messenger.loadInWindow(window, 'adaptSearchBar', false);

		Prefs.listen('showOnlyNonEmptySearchBar', this);
		Prefs.listen('searchEnginesInURLBar', this);
		Prefs.listen('awesomerURLBar', this);
		this.toggleShowOnlyNonEmptySearchBar();
	},

	deinit: function() {
		if(!this.initialized) { return; }
		this.initialized = false;

		Prefs.unlisten('showOnlyNonEmptySearchBar', this);
		Prefs.unlisten('searchEnginesInURLBar', this);
		Prefs.unlisten('awesomerURLBar', this);
		this.toggleShowOnlyNonEmptySearchBar(true);

		Messenger.unlistenWindow(window, 'AdaptSearchBar:Value', adaptSearchBar);
		Messenger.unloadFromWindow(window, 'adaptSearchBar');

		Listeners.remove(gBrowser.tabContainer, 'TabSelect', adaptSearchBar);

		for(let browser of gBrowser.browsers) {
			delete browser._adaptSearchValue;
		}
	},

	updateSearchBar: function() {
		let searchbar = gSearchBar;

		// this shouldn't happen, but just in case
		if(!searchbar) {
			this.deinit();
			return;
		}

		let browser = gBrowser.mCurrentBrowser;

		// don't change the search bar's value when we're not in a search results page
		if(!this.nonEmptyMode && (browser._adaptSearchValue === undefined || browser._adaptSearchValue === null)) { return; }
		let value = browser._adaptSearchValue || '';

		if(searchbar._textbox.valueIsTyped) {
			// if the typed value is empty or the same as the content filled value, reset the valueIsTyped flag
			if(!searchbar.value || searchbar.value == value) {
				searchbar._textbox.valueIsTyped = false;
			}

			// don't change the value if the user is typing or has typed in the search bar
			if(!this.nonEmptyMode && searchbar.value) { return; }
		}

		if(searchbar.value != value) {
			searchbar.value = value;
		}

		this.maybeHideSearchBar();
	},

	maybeHideSearchBar: function() {
		let hide = this.nonEmptyMode && (document.activeElement == gURLBar.inputField || !gSearchBar.value);
		toggleAttribute(gNavBar, 'hideSearchBar', hide);
		return hide;
	},

	toggleShowOnlyNonEmptySearchBar: function(unload) {
		if(!unload && this.nonEmptyMode) {
			Listeners.add(gURLBar, 'focus', this);
			Listeners.add(gURLBar, 'blur', this);
			Listeners.add(gSearchBar, 'focus', this, true);

			Piggyback.add('adaptSearchBar', gSearchBar, 'openSuggestionsPanel', function() {
				// If the search bar is set to be shown only when non-empty, we shouldn't use its suggestions popup.
				// Instead, open the location bar's popup, but only if the location bar isn't already focused.
				if(document.activeElement != gURLBar.inputField) {
					gURLBar.focus();
					gURLBar.showHistoryPopup();
				}
			});

			this.updateSearchBar();
		} else {
			Listeners.remove(gURLBar, 'focus', this);
			Listeners.remove(gURLBar, 'blur', this);
			Listeners.remove(gSearchBar, 'focus', this, true);

			Piggyback.revert('adaptSearchBar', gSearchBar, 'openSuggestionsPanel');

			removeAttribute(gNavBar, 'hideSearchBar');
		}
	}
};

Modules.LOADMODULE = function() {
	CustomizableUI.addListener(adaptSearchBar);

	adaptSearchBar.init();
};

Modules.UNLOADMODULE = function() {
	CustomizableUI.removeListener(adaptSearchBar);

	adaptSearchBar.deinit();
};
