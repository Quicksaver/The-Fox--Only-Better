// VERSION 2.0.1

this.slimKey = {
	id: objName+'-key-slimChrome',
	oncommand: objName+'.toggleSlimChromePref();',
	get keycode () { return Prefs.slimChromeKeycode; },
	get accel () { return Prefs.slimChromeAccel; },
	get shift () { return Prefs.slimChromeShift; },
	get alt () { return Prefs.slimChromeAlt; },
	get ctrl () { return Prefs.slimChromeCtrl; },

	observe: function(aSubject, aTopic, aData) {
		this.set();
	},

	set: function() {
		if(this.keycode != 'none') { Keysets.register(this); }
		else { Keysets.unregister(this); }
	}
};

Modules.LOADMODULE = function() {
	// this is to migrate to the new Keysets object, it can probably be removed once most users have updated to the latest version
	if(!Prefs.migratedKeysets) {
		Prefs.migratedKeysets = true;
		Prefs.slimChromeKeycode = Keysets.translateFromConstantCode(Prefs.slimChromeKeycode);
	}

	slimKey.set();

	Prefs.listen('slimChromeKeycode', slimKey);
	Prefs.listen('slimChromeAccel', slimKey);
	Prefs.listen('slimChromeShift', slimKey);
	Prefs.listen('slimChromeAlt', slimKey);
	Prefs.listen('slimChromeCtrl', slimKey);
};

Modules.UNLOADMODULE = function() {
	Prefs.unlisten('slimChromeKeycode', slimKey);
	Prefs.unlisten('slimChromeAccel', slimKey);
	Prefs.unlisten('slimChromeShift', slimKey);
	Prefs.unlisten('slimChromeAlt', slimKey);
	Prefs.unlisten('slimChromeCtrl', slimKey);

	Keysets.unregister(slimKey);
};
