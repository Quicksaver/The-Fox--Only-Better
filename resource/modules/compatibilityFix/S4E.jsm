Modules.VERSION = '2.0.0';

this.S4E = {
	state: false,
	
	get progress () { return $('urlbar-progress-alt'); },
	
	attrWatcher: function() {
		if(!Prefs.includeNavBar) { return; }
		
		var current = this.progress && !this.progress.hidden && !this.progress.collapsed;
		this.state = current;
		if(typeof(slimChrome) != 'undefined') {
			if(this.state) {
				// show immediately when progress bar becomes visible
				slimChrome.setMini(true);
			} else if(!slimChrome.onTabSelect()) {
				// don't hide immediately when page load ends
				Timers.init('setMini', () => { slimChrome.hideMiniInABit(); }, 2000);
			}
		}
	}
};

Modules.LOADMODULE = function() {
	Styles.load('S4E', 'S4E');
	
	Watchers.addAttributeWatcher(S4E.progress, 'hidden', S4E, false, false);
	Watchers.addAttributeWatcher(S4E.progress, 'collapsed', S4E, false, false);
	Watchers.addAttributeWatcher(S4E.progress, 'value', S4E, false, false);
};

Modules.UNLOADMODULE = function() {
	Watchers.removeAttributeWatcher(S4E.progress, 'hidden', S4E, false, false);
	Watchers.removeAttributeWatcher(S4E.progress, 'collapsed', S4E, false, false);
	Watchers.removeAttributeWatcher(S4E.progress, 'value', S4E, false, false);
	
	if(UNLOADED) {
		Styles.unload('S4E');
	}
};
