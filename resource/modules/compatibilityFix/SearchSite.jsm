// VERSION 1.0.1

this.__defineGetter__('searchSite', function() { return window.searchSite; });

this.SearchSite = {
	initialized: false,

	kBtnId: "searchsite-go-button-urlbar",
	kMenuId: "searchsite-domain-menu-urlbar",

	get btn () { return $(this.kBtnId); },

	handleEvent: function(e) {
		switch(e.type) {
			case 'click':
			case 'command':
				// Only so searchSite's methods still work, this is actually kind of irrelevant for this case.
				searchSite.domainTriggerNode = e.originalTarget;

				// We need to copy the value in the urlbar to the search bar so that it knows what to search for.
				// This is not a problem when we focused the location bar and the search bar's value already was pasted in it.
				if(gURLBar.valueIsTyped) {
					gSearchBar._textbox.value = gURLBar.value;
				}

				gSearchBar.handleSearchCommand(e);
				break;

			case 'focus':
			case 'input':
			case 'blur':
			case 'keydown':
				if(!Timers.SearchSite) {
					Timers.init('SearchSite', () => { this.buttonVisibility(); });
				}
				break;
		}
	},

	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'showOnlyNonEmptySearchBar':
			case 'searchEnginesInURLBar':
			case 'awesomerURLBar':
				this.toggle();
				break;
		}
	},

	onWidgetAdded: function(aWidgetId) {
		if(aWidgetId == 'search-container') {
			this.toggle();
		}
	},

	onWidgetRemoved: function(aWidgetId) {
		if(aWidgetId == 'search-container') {
			this.toggle();
		}
	},

	buttonVisibility: function() {
		this.btn.hidden = !gURLBar.value || (!gURLBar.valueIsTyped && gURLBar.value != gSearchBar._textbox.value);
	},

	toggle: function() {
		if(Prefs.awesomerURLBar && Prefs.searchEnginesInURLBar && Prefs.showOnlyNonEmptySearchBar) {
			let placement = CustomizableUI.getPlacementOfWidget("search-container");
			if(placement && placement.area == CustomizableUI.AREA_NAVBAR) {
				this.init();
				return;
			}
		}
		this.uninit();
	},

	init: function() {
		if(this.initialized) { return; }
		this.initialized = true;

		// Base the context menu on the original, but we need to change the commands when the entries are clicked.
		let menu = $("searchsite-domain-menu").cloneNode(true);
		menu.id += "-urlbar";
		for(let child of menu.childNodes) {
			if(child.id) {
				child.id += "-urlbar";
				removeAttribute(child, 'onclick');
				Listeners.add(child, "command", this);
			}
		}
		$("mainPopupSet").appendChild(menu);

		// Search Site uses a template node to create its button, we can obviously do the same.
		let btn = $("searchsite-template").childNodes[0].cloneNode(true);
		btn.id = this.kBtnId;
		removeAttribute(btn, 'onclick');
		Listeners.add(btn, "click", this);
		$("urlbar-icons").appendChild(btn);

		Listeners.add(gURLBar, 'focus', this);
		Listeners.add(gURLBar, 'input', this);
		Listeners.add(gURLBar, 'blur', this);
		// Some special keys, like Esc, modify the urlbar's value but don't trigger an input event.
		Listeners.add(gURLBar, 'keydown', this);
	},

	uninit: function() {
		if(!this.initialized) { return; }
		this.initialized = false;

		let menu = $(this.kMenuId);
		for(let child of menu.childNodes) {
			if(child.id) {
				Listeners.remove(child, "command", this);
			}
		}
		menu.remove();

		let btn = this.btn;
		Listeners.remove(btn, "click", this);
		btn.remove();

		Listeners.remove(gURLBar, 'focus', this);
		Listeners.remove(gURLBar, 'input', this);
		Listeners.remove(gURLBar, 'blur', this);
		Listeners.remove(gURLBar, 'keydown', this);
	}
};

Modules.LOADMODULE = function() {
	CustomizableUI.addListener(SearchSite);

	Prefs.listen('showOnlyNonEmptySearchBar', SearchSite);
	Prefs.listen('searchEnginesInURLBar', SearchSite);
	Prefs.listen('awesomerURLBar', SearchSite);

	SearchSite.toggle();
};

Modules.UNLOADMODULE = function() {
	CustomizableUI.removeListener(SearchSite);

	Prefs.unlisten('showOnlyNonEmptySearchBar', SearchSite);
	Prefs.unlisten('searchEnginesInURLBar', SearchSite);
	Prefs.unlisten('awesomerURLBar', SearchSite);

	SearchSite.uninit();
};
