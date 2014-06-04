moduleAid.VERSION = '1.0.3';

this.__defineGetter__('S4Eprogress', function() { return $('urlbar-progress-alt'); });

this.S4Estate = false;

this.S4Elistener = function() {
	var current = S4Eprogress && !S4Eprogress.hidden && !S4Eprogress.collapsed;
	S4Estate = current;
	if(typeof(setMini) != 'undefined') {
		if(S4Estate) {
			// show immediately when progress bar becomes visible
			setMini(true);
		} else if(!slimChromeOnTabSelect.handler()) {
			// don't hide immediately when page load ends
			timerAid.init('setMini', hideMiniInABit, 2000);
		}
	}
};

moduleAid.LOADMODULE = function() {
	styleAid.load('S4E', 'S4E');
	
	objectWatcher.addAttributeWatcher(S4Eprogress, 'hidden', S4Elistener, false, false);
	objectWatcher.addAttributeWatcher(S4Eprogress, 'collapsed', S4Elistener, false, false);
	objectWatcher.addAttributeWatcher(S4Eprogress, 'value', S4Elistener, false, false);
};

moduleAid.UNLOADMODULE = function() {
	objectWatcher.removeAttributeWatcher(S4Eprogress, 'hidden', S4Elistener, false, false);
	objectWatcher.removeAttributeWatcher(S4Eprogress, 'collapsed', S4Elistener, false, false);
	objectWatcher.removeAttributeWatcher(S4Eprogress, 'value', S4Elistener, false, false);
	
	if(UNLOADED) {
		styleAid.unload('S4E');
	}
};
