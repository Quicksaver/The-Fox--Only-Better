// VERSION 1.0.2

this.__defineGetter__('gSearchBar', function() { return $('searchbar'); });

this.adaptSearchBar = {
	initialized: false,

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

		Messenger.listenWindow(window, 'AdaptSearchBar:Value', adaptSearchBar);

		Listeners.add(gBrowser.tabContainer, 'TabSelect', adaptSearchBar);

		Messenger.loadInWindow(window, 'adaptSearchBar', false);
	},

	deinit: function() {
		if(!this.initialized) { return; }
		this.initialized = false;

		Messenger.unlistenWindow(window, 'AdaptSearchBar:Value', adaptSearchBar);

		Listeners.remove(gBrowser.tabContainer, 'TabSelect', adaptSearchBar);

		Messenger.unloadFromWindow(window, 'adaptSearchBar');

		for(let browser of gBrowser.browsers) {
			delete browser._adaptSearchValue;
		}
	},

	updateSearchBar: function() {
		// this shouldn't happen, but just in case
		if(!gSearchBar) {
			this.deinit();
			return;
		}

		let browser = gBrowser.mCurrentBrowser;

		// don't change the search bar's value when we're not in a search results page
		if(browser._adaptSearchValue === undefined || browser._adaptSearchValue === null) { return; }

  		if(gSearchBar._textbox.valueIsTyped) {
  			// if the typed value is empty or the same as the content filled value, reset the valueIsTyped flag
  			if(!gSearchBar.value || gSearchBar.value == browser._adaptSearchValue) {
  				gSearchBar._textbox.valueIsTyped = false;
  			}

  			// don't change the value if the user is typing or has typed in the search bar
  			if(gSearchBar.value) { return; }
  		}

		if(gSearchBar.value != browser._adaptSearchValue) {
			gSearchBar.value = browser._adaptSearchValue;
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
