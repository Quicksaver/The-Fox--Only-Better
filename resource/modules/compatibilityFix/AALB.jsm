// VERSION 1.0.0

this.__defineGetter__('SegmentUrlBarCtrl', function() { return window.SegmentUrlBarCtrl; });

this.AALB = {
	handleEvent: function(e) {
		this.delay();
	},

	observe: function(aSubject, aTopic, aData) {
		this.delay();
	},

	delay: function() {
		Timers.init('AALB', () => {
			this.reinit();
		}, 100);
	},

	reinit: function() {
		Timers.cancel('AALB');
		SegmentUrlBarCtrl.init();
	}
};

Modules.LOADMODULE = function() {
	Prefs.listen('includeNavBar', AALB);

	Listeners.add(window, 'LoadedSlimChrome', AALB);
	Listeners.add(window, 'UnloadedSlimChrome', AALB);
};

Modules.UNLOADMODULE = function() {
	Prefs.unlisten('includeNavBar', AALB);

	Listeners.remove(window, 'LoadedSlimChrome', AALB);
	Listeners.remove(window, 'UnloadedSlimChrome', AALB);

	AALB.reinit();
};
