Modules.VERSION = '2.0.0';

this.__defineGetter__('RSS_TICKER_UI', function() { return window.RSS_TICKER_UI; });
this.__defineGetter__('RSS_TICKER_UTILS', function() { return window.RSS_TICKER_UTILS; });
this.__defineGetter__('RSS_TICKER_FEED_MANAGER', function() { return window.RSS_TICKER_FEED_MANAGER; });

this.RSSTicker = {	
	handleEvent: function(e) {
		switch(e.type) {
			case 'LoadedSlimChrome':
			case 'UnloadedSlimChrome':
				this.reload();
				break;
		}
	},
	
	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'tickerPlacement':
				this.style();
				break;
		}
	},
	
	reload: function() {
		RSS_TICKER_UI.unloadTicker();
		RSS_TICKER_UI.loadTicker();
		
		// we don't want a doubled menu item for this toolbar
		var i = gNavToolbox.externalToolbars.indexOf(RSS_TICKER_UI.toolbar);
		if(i > -1) {
			gNavToolbox.externalToolbars.splice(i, 1);
		}
		
		this.style();
	},
	
	style: function() {
		if(typeof(slimChrome) != 'undefined') {
			toggleAttribute(slimChrome.container, 'RSSTicker', Prefs.tickerPlacement == 2);
		}
	}
};

Modules.LOADMODULE = function() {
	Prefs.setDefaults({ tickerPlacement: 1 }, 'rssticker');
	
	toCode.modify(RSS_TICKER_UI, 'RSS_TICKER_UI.loadTicker', [
		// the ticker toolbar should be added before our elements, not after
		["document.getElementById( 'navigator-toolbox' ).appendChild( RSS_TICKER_UI.toolbar );",
			"document.getElementById('navigator-toolbox').insertBefore(RSS_TICKER_UI.toolbar, document.getElementById('theFoxOnlyBetter-slimChrome-container'));"
		]
	]);
	
	Prefs.listen('tickerPlacement', RSSTicker);
	
	Listeners.add(window, 'LoadedSlimChrome', RSSTicker);
	Listeners.add(window, 'UnloadedSlimChrome', RSSTicker);
	
	if(typeof(slimChrome) != 'undefined' && slimChrome.container) {
		RSSTicker.reload();
	}
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'LoadedSlimChrome', RSSTicker);
	Listeners.remove(window, 'UnloadedSlimChrome', RSSTicker);
	
	Prefs.unlisten('tickerPlacement', RSSTicker);
	
	toCode.revert(RSS_TICKER_UI, 'RSS_TICKER_UI.loadTicker');
	
	// this is usually unloaded before slimChrome when disabling the add-on, so its listeners don't trigger this
	if(UNLOADED) {
		RSSTicker.reload();
	}
};
