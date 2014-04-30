moduleAid.VERSION = '1.0.0';

moduleAid.LOADMODULE = function() {
	styleAid.load('speedDial', 'speedDial');
};

moduleAid.UNLOADMODULE = function() {
	styleAid.unload('speedDial');
};
