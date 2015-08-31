Modules.VERSION = '1.0.0';

// there's no point in showing any of the Sky Lights content in the preferences if they can't be used,
// in that case we show only the requirements notice instead
this.showSkyLights = function() {
	let requirements = $('paneSkyLights-requirements');
	let nodes = $$(':not(.header)[data-category="paneSkyLights"]');
	let show = Prefs.slimChrome && Prefs.includeNavBar;
	
	requirements.hidden = show;
	for(let node of nodes) {
		if(node == requirements) { continue; }
		node.hidden = !show;
	}
};

Modules.LOADMODULE = function() {
	Prefs.listen('slimChrome', showSkyLights);
	Prefs.listen('includeNavBar', showSkyLights);
	
	showSkyLights();
};

Modules.UNLOADMODULE = function() {
	Prefs.unlisten('slimChrome', showSkyLights);
	Prefs.unlisten('includeNavBar', showSkyLights);
};
