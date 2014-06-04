moduleAid.VERSION = '1.0.0';

this.slimChromeKey = {
	id: objName+'-key-slimChrome',
	oncommand: objName+'.toggleSlimChromePref();',
	get keycode () { return prefAid.slimChromeKeycode; },
	get accel () { return prefAid.slimChromeAccel; },
	get shift () { return prefAid.slimChromeShift; },
	get alt () { return prefAid.slimChromeAlt; }
};

this.setKeys = function() {
	if(slimChromeKey.keycode != 'none') { keysetAid.register(slimChromeKey); }
	else { keysetAid.unregister(slimChromeKey); }
};

moduleAid.LOADMODULE = function() {
	setKeys();
	
	prefAid.listen('slimChromeKeycode', setKeys);
	prefAid.listen('slimChromeAccel', setKeys);
	prefAid.listen('slimChromeShift', setKeys);
	prefAid.listen('slimChromeAlt', setKeys);
};

moduleAid.UNLOADMODULE = function() {
	prefAid.unlisten('slimChromeKeycode', setKeys);
	prefAid.unlisten('slimChromeAccel', setKeys);
	prefAid.unlisten('slimChromeShift', setKeys);
	prefAid.unlisten('slimChromeAlt', setKeys);
	
	keysetAid.unregister(slimChromeKey);
};
