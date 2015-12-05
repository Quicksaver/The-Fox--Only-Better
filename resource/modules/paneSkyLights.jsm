// VERSION 1.1.0

this.identityBoxState = {
	get state() { return $('state-identityBoxLight'); },

	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'skyLights':
				aSync(() => {
					this.update(DnDprefs.getPref('skyLightsPlacements'));
				});
				break;

			case 'skyLightsPlacements':
				this.update(aData);
				break;
		}
	},

	update: function(aData) {
		let enabled = Prefs.skyLights;
		if(enabled) {
			let settings = aData && aData.settings.get('identityBox');
			enabled = settings && settings.enable;
		}

		this.state.value = enabled;
	}
};

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
	Prefs.listen('skyLights', identityBoxState);
	DnDprefs.addHandler('skyLightsPlacements', identityBoxState);

	showSkyLights();
	identityBoxState.update(DnDprefs.getPref('skyLightsPlacements'));
};

Modules.UNLOADMODULE = function() {
	Prefs.unlisten('slimChrome', showSkyLights);
	Prefs.unlisten('includeNavBar', showSkyLights);
	Prefs.unlisten('skyLights', identityBoxState);
	DnDprefs.removeHandler('skyLightsPlacements', identityBoxState);
};
