// VERSION 1.1.0

this.gotoSearch = function() {
	let gWindow = window
			.QueryInterface(Ci.nsIInterfaceRequestor)
			.getInterface(Ci.nsIWebNavigation)
			.QueryInterface(Ci.nsIDocShellTreeItem)
			.rootTreeItem
			.QueryInterface(Ci.nsIInterfaceRequestor)
			.getInterface(Ci.nsIDOMWindow);
	if(!gWindow) { return; }

	let uri = "about:preferences";
	let ref = "search";
	for(let tab of gWindow.gBrowser.tabs) {
		if(tab.linkedBrowser.currentURI.spec.startsWith(uri)) {
			// We found a preferences tab already open, just make sure it's switched to the Search pane and use it.
			gWindow.gBrowser.selectedTab = tab;
			tab.linkedBrowser.contentWindow.gotoPref(ref);
			return;
		}
	}

	// We couldn't find a preferences tab, so open a new one and switch to it.
	gWindow.gBrowser.selectedTab = gWindow.gBrowser.addTab(uri+'#'+ref);
};

this.suggestSearches = {
	get checkbox () { return $('paneAwesomeBar-suggestSearches'); },

	apply: function() {
		let checked = this.checkbox.checked;
		// When checking this checkbox, we enable both related preferences since they're both required for the feature to work.
		// But when unchecking it, we only disable the urlbar-related preference, as it's not necessarily true the user wants to disable it also for the search bar.
		// When disabling the add-on, both preferences are reverted to their original values anyway. And the original preferences (in Fx's options) are easily accessible
		// through our shortcut button in the same pane too if they want further control.
		if(checked) {
			Prefs.suggestSearchesEnabled = true;
		}
	}
};

this.awesomerStyleDependencies = {
	get radio () { return $('paneAwesomeBar-style'); },

	handleEvent: function() {
		this.apply(this.radio.value);
	},

	observe: function() {
		this.apply(Prefs.awesomerStyle);
	},

	apply: function(current) {
		let nodes = $$('[awesomerStyle]');
		for(let node of nodes) {
			node.collapsed = node.getAttribute('awesomerStyle') != current;
		}
	},

	init: function() {
		Prefs.listen('awesomerStyle', this);
		Listeners.add(this.radio, "command", this);
		this.apply(Prefs.awesomerStyle);
	},

	uninit: function() {
		Prefs.unlisten('awesomerStyle', this);
		Listeners.remove(this.radio, "command", this);
	}
};

Modules.LOADMODULE = function() {
	suggestSearches.apply();
	awesomerStyleDependencies.init();
};

Modules.UNLOADMODULE = function() {
	awesomerStyleDependencies.uninit();
};
