// VERSION 1.0.2

Modules.LOADMODULE = function() {
	// change the default style and animation for the FT DeepDark theme, because it looks awesome there
	Prefs.setDefaults({
		slimStyle: 'compact',
		slimAnimation: 'slidedown'
	});

	Styles.load('FTDeepDark', 'FTDeepDark');
};

Modules.UNLOADMODULE = function() {
	Styles.unload('FTDeepDark');
};
