moduleAid.VERSION = '1.0.0';

this.__defineGetter__('S4Eprogress', function() { return $('urlbar-progress-alt'); });

this.S4Elistener = {
	observer: null,
	state: false,
	
	handler: function() {
		var current = S4Eprogress && !S4Eprogress.hidden && !S4Eprogress.collapsed;
		this.state = current;
		if(typeof(setMini) != 'undefined') {
			if(this.state) {
				// show immediately when progress bar becomes visible
				setMini(this.state);
			} else {
				// don't hide immediately when page load ends
				timerAid.init('setMini', hideMiniInABit, 2000);
			}
		}
	}
};

this.S4EkeepVisible = function(e) {
	if(S4Elistener.state) {
		e.preventDefault();
		e.stopPropagation();
	}
};

moduleAid.LOADMODULE = function() {
	S4Elistener.observer = new window.MutationObserver(S4Elistener.handler);
	S4Elistener.observer.observe(S4Eprogress, { attributes: true });
};

moduleAid.UNLOADMODULE = function() {
	S4Elistener.observer.disconnet();	
};
