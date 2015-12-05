// VERSION 1.0.0

this.CTRbackForward = function() {
	Styles.loadIf('CTRbackForward', 'CTRbackForward', false, Prefs.backforward);
};

Modules.LOADMODULE = function() {
	Prefs.setDefaults({ backforward: false }, 'classicthemerestorer');

	Prefs.listen('backforward', CTRbackForward);
	CTRbackForward();
};

Modules.UNLOADMODULE = function() {
	Prefs.unlisten('backforward', CTRbackForward);
	Styles.unload('CTR');
};
