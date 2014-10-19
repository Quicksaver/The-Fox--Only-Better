Modules.VERSION = '1.0.3';

this.__defineGetter__('RSS_TICKER_UI', function() { return window.RSS_TICKER_UI; });
this.__defineGetter__('RSS_TICKER_UTILS', function() { return window.RSS_TICKER_UTILS; });
this.__defineGetter__('RSS_TICKER_FEED_MANAGER', function() { return window.RSS_TICKER_FEED_MANAGER; });

this.RSSTickerReload = function() {
	RSS_TICKER_UI.unloadTicker();
	RSS_TICKER_UI.loadTicker();
	
	// we don't want a doubled menu item for this toolbar
	var i = gNavToolbox.externalToolbars.indexOf(RSS_TICKER_UI.toolbar);
	if(i > -1) {
		gNavToolbox.externalToolbars.splice(i, 1);
	}
	
	RSSTickerStyle();
};

this.RSSTickerStyle = function() {
	if(typeof(slimChromeContainer) != 'undefined') {
		toggleAttribute(slimChromeContainer, 'RSSTicker', Prefs.tickerPlacement == 2);
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
	
	Prefs.listen('tickerPlacement', RSSTickerStyle);
	
	Listeners.add(window, 'LoadedSlimChrome', RSSTickerReload);
	Listeners.add(window, 'UnloadedSlimChrome', RSSTickerReload);
	
	if(typeof(slimChromeContainer) != 'undefined' && slimChromeContainer) {
		RSSTickerReload();
	}
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'LoadedSlimChrome', RSSTickerReload);
	Listeners.remove(window, 'UnloadedSlimChrome', RSSTickerReload);
	
	Prefs.unlisten('tickerPlacement', RSSTickerStyle);
	
	toCode.revert(RSS_TICKER_UI, 'RSS_TICKER_UI.loadTicker');
	
	// this is usually unloaded before slimChrome when disabling the add-on, so its listeners don't trigger this
	if(UNLOADED) {
		RSSTickerReload();
	}
};
