Modules.VERSION = '2.0.1';

this.S4E = {
	state: false,
	
	get progress () { return $('urlbar-progress-alt'); },
	
	handleEvent: function(e) {
		switch(e.type) {
			// focusing forces a Top style, but bluring sometimes doesn't revert back to the original style,
			// I have no idea how _pmpack is lost though
			case 'LoadedSlimChrome':
			case 'UnloadedSlimChrome':
			case 'blur':
			case 'focus':
				if(gURLBar._pmpack === null) {
					switch(Prefs['progress.urlbar']) {
						case 1:
							gURLBar.pmpack = "end";
							break;
						case 2:
							gURLBar.pmpack = "begin";
							break;
						case 3:
							gURLBar.pmpack = "center";
							break;
						default: break;
					}
				}
				break;
		}
	},
	
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
	Prefs.setDefaults({ ['progress.urlbar']: 1 }, 'status4evar', '');
	
	Styles.load('S4E', 'S4E');
	
	Watchers.addAttributeWatcher(S4E.progress, 'hidden', S4E, false, false);
	Watchers.addAttributeWatcher(S4E.progress, 'collapsed', S4E, false, false);
	Watchers.addAttributeWatcher(S4E.progress, 'value', S4E, false, false);
	
	Listeners.add(window, 'LoadedSlimChrome', S4E);
	Listeners.add(window, 'UnloadedSlimChrome', S4E);
	Listeners.add(gURLBar, 'blur', S4E, true);
	Listeners.add(gURLBar, 'focus', S4E, true);
};

Modules.UNLOADMODULE = function() {
	Watchers.removeAttributeWatcher(S4E.progress, 'hidden', S4E, false, false);
	Watchers.removeAttributeWatcher(S4E.progress, 'collapsed', S4E, false, false);
	Watchers.removeAttributeWatcher(S4E.progress, 'value', S4E, false, false);
	
	Listeners.remove(window, 'LoadedSlimChrome', S4E);
	Listeners.remove(window, 'UnloadedSlimChrome', S4E);
	Listeners.remove(gURLBar, 'blur', S4E, true);
	Listeners.remove(gURLBar, 'focus', S4E, true);
	
	if(UNLOADED) {
		Styles.unload('S4E');
	}
};
