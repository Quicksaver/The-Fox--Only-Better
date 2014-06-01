moduleAid.VERSION = '1.0.1';

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
		toggleAttribute(slimChromeContainer, 'RSSTicker', prefAid.tickerPlacement == 2);
	}
};

moduleAid.LOADMODULE = function() {
	prefAid.setDefaults({ tickerPlacement: 1 }, 'rssticker');
	
	// the ticker toolbar should be added before our elements, not after
	toCode.modify(RSS_TICKER_UI, 'RSS_TICKER_UI.loadTicker', [
		["document.getElementById( 'navigator-toolbox' ).appendChild( RSS_TICKER_UI.toolbar );",
			"document.getElementById('navigator-toolbox').insertBefore(RSS_TICKER_UI.toolbar, document.getElementById('"+objName+"-slimChrome-container'));"
		]
	]);
	
	prefAid.listen('tickerPlacement', RSSTickerStyle);
	
	listenerAid.add(window, 'LoadedSlimChrome', RSSTickerReload);
	listenerAid.add(window, 'UnloadedSlimChrome', RSSTickerReload);
	
	if(typeof(slimChromeContainer) != 'undefined' && slimChromeContainer) {
		RSSTickerReload();
	}
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(window, 'LoadedSlimChrome', RSSTickerReload);
	listenerAid.remove(window, 'UnloadedSlimChrome', RSSTickerReload);
	
	prefAid.unlisten('tickerPlacement', RSSTickerStyle);
	
	toCode.revert(RSS_TICKER_UI, 'RSS_TICKER_UI.loadTicker');
	
	// this is usually unloaded before slimChrome when disabling the add-on, so its listeners don't trigger this
	if(UNLOADED) {
		RSSTickerReload();
	}
};
