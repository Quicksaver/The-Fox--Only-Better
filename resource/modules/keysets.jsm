Modules.VERSION = '2.0.0';

this.slimKey = {
	key: {
		id: objName+'-key-slimChrome',
		oncommand: objName+'.toggleSlimChromePref();',
		get keycode () { return Prefs.slimChromeKeycode; },
		get accel () { return Prefs.slimChromeAccel; },
		get shift () { return Prefs.slimChromeShift; },
		get alt () { return Prefs.slimChromeAlt; }
	},
	
	observe: function(aSubject, aTopic, aData) {
		this.set();
	},
	
	set: function() {
		if(this.key.keycode != 'none') { Keysets.register(this.key); }
		else { Keysets.unregister(this.key); }
	}
};

Modules.LOADMODULE = function() {
	slimKey.set();
	
	Prefs.listen('slimChromeKeycode', slimKey);
	Prefs.listen('slimChromeAccel', slimKey);
	Prefs.listen('slimChromeShift', slimKey);
	Prefs.listen('slimChromeAlt', slimKey);
};

Modules.UNLOADMODULE = function() {
	Prefs.unlisten('slimChromeKeycode', slimKey);
	Prefs.unlisten('slimChromeAccel', slimKey);
	Prefs.unlisten('slimChromeShift', slimKey);
	Prefs.unlisten('slimChromeAlt', slimKey);
	
	Keysets.unregister(slimKey.key);
};
