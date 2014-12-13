Modules.VERSION = '1.0.0';

this.__defineGetter__('DevEdition', function() { return window.DevEdition; });

this.devThemeToggled = function() {
	if(DevEdition.styleSheet) {
		Overlays.overlayWindow(window, 'devEdition');
	} else {
		Overlays.removeOverlayWindow(window, 'devEdition');
	}
};

Modules.LOADMODULE = function() {
	if(DevEdition) {
		Observers.add(devThemeToggled, 'devedition-theme-state-changed');
		devThemeToggled();
	}
};

Modules.UNLOADMODULE = function() {
	if(DevEdition) {
		Observers.remove(devThemeToggled, 'devedition-theme-state-changed');
		Overlays.removeOverlayWindow(window, 'devEdition');
	}
};
