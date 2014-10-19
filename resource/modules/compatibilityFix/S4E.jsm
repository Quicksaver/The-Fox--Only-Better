Modules.VERSION = '1.0.5';

this.__defineGetter__('S4Eprogress', function() { return $('urlbar-progress-alt'); });

this.S4Estate = false;

this.S4Elistener = function() {
	if(!Prefs.includeNavBar) { return; }
	
	var current = S4Eprogress && !S4Eprogress.hidden && !S4Eprogress.collapsed;
	S4Estate = current;
	if(typeof(setMini) != 'undefined') {
		if(S4Estate) {
			// show immediately when progress bar becomes visible
			setMini(true);
		} else if(!slimChromeOnTabSelect.handler()) {
			// don't hide immediately when page load ends
			Timers.init('setMini', hideMiniInABit, 2000);
		}
	}
};

Modules.LOADMODULE = function() {
	Styles.load('S4E', 'S4E');
	
	Watchers.addAttributeWatcher(S4Eprogress, 'hidden', S4Elistener, false, false);
	Watchers.addAttributeWatcher(S4Eprogress, 'collapsed', S4Elistener, false, false);
	Watchers.addAttributeWatcher(S4Eprogress, 'value', S4Elistener, false, false);
};

Modules.UNLOADMODULE = function() {
	Watchers.removeAttributeWatcher(S4Eprogress, 'hidden', S4Elistener, false, false);
	Watchers.removeAttributeWatcher(S4Eprogress, 'collapsed', S4Elistener, false, false);
	Watchers.removeAttributeWatcher(S4Eprogress, 'value', S4Elistener, false, false);
	
	if(UNLOADED) {
		Styles.unload('S4E');
	}
};
