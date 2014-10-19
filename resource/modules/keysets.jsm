Modules.VERSION = '1.0.1';

this.slimChromeKey = {
	id: objName+'-key-slimChrome',
	oncommand: objName+'.toggleSlimChromePref();',
	get keycode () { return Prefs.slimChromeKeycode; },
	get accel () { return Prefs.slimChromeAccel; },
	get shift () { return Prefs.slimChromeShift; },
	get alt () { return Prefs.slimChromeAlt; }
};

this.setKeys = function() {
	if(slimChromeKey.keycode != 'none') { Keysets.register(slimChromeKey); }
	else { Keysets.unregister(slimChromeKey); }
};

Modules.LOADMODULE = function() {
	setKeys();
	
	Prefs.listen('slimChromeKeycode', setKeys);
	Prefs.listen('slimChromeAccel', setKeys);
	Prefs.listen('slimChromeShift', setKeys);
	Prefs.listen('slimChromeAlt', setKeys);
};

Modules.UNLOADMODULE = function() {
	Prefs.unlisten('slimChromeKeycode', setKeys);
	Prefs.unlisten('slimChromeAccel', setKeys);
	Prefs.unlisten('slimChromeShift', setKeys);
	Prefs.unlisten('slimChromeAlt', setKeys);
	
	Keysets.unregister(slimChromeKey);
};
