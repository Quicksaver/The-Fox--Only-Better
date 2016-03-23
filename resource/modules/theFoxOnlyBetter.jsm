// VERSION 2.0.13

this.__defineGetter__('slimChromeBroadcaster', function() { return $(objName+'-slimChrome-broadcaster'); });
this.__defineGetter__('gNavToolbox', function() { return window.gNavToolbox; });
this.__defineGetter__('gNavBar', function() { return $('nav-bar'); });
this.__defineGetter__('gURLBar', function() { return window.gURLBar; });
this.__defineGetter__('overflowList', function() { return $('widget-overflow-list'); });
this.__defineGetter__('gBrowser', function() { return window.gBrowser; });

this.__defineGetter__('FullScreen', function() { return window.FullScreen; });
this.__defineGetter__('fullScreen', function() { return window.fullScreen; });
this.__defineGetter__('fullscreenElement', function() {
	if(Services.vc.compare(Services.appinfo.version, "47.0a1") < 0) {
		return document.mozFullScreen;
	}
	return document.fullscreenElement;
});
// Firefox for OS X doesn't automatically hide the toolbars like it does for other OS's in fullScreen
this.__defineGetter__('fullScreenAutohide', function() { return !FullScreen.useLionFullScreen && Prefs.autohide; });
this.__defineGetter__('inFullScreen', function() { return fullScreen && !fullscreenElement && fullScreenAutohide; });

// set this here, so I can modify it through other modules without reseting it when slimChrome un/loads
this.slimChromeExceptions = new Set(['addon-bar']);

this.handleEvent = function(e) {
	switch(e.type) {
		case 'fullscreen':
			toggleSlimChrome();
			break;

		case 'beforecustomization':
			toggleSlimChrome(true);
			break;

		case 'aftercustomization':
			toggleSlimChrome(false);
			break;
	}
};

this.observe = function(aSubject, aTopic, aData) {
	switch(aSubject) {
		case 'slimChrome':
			toggleSlimChrome();
			togglePopups();
			break;

		case 'autohide':
			toggleSlimChrome();
			break;

		case 'adaptSearchBar':
			toggleAdaptSearchBar();
			break;

		case 'awesomerURLBar':
			toggleAwesomerUnifiedComplete();
			break;
	}
};

this.onLoad = function() {
	toggleSlimChrome();
};

this.openOptions = function(options) {
	PrefPanes.open(window, options);
};

this.toggleSlimChromePref = function() {
	Prefs.slimChrome = !Prefs.slimChrome;
};

this.toggleSlimChrome = function(isCustomizing = customizing) {
	toggleAttribute(slimChromeBroadcaster, 'checked', Prefs.slimChrome);

	let wasEnabled = !!self.slimChrome;
	Modules.loadIf('slimChrome', Prefs.slimChrome && !inFullScreen && !isCustomizing);

	// Sometimes entering fullscreen wouldn't fully hide the toolbars at first because
	// their height wouldn't be correctly calc'ed to apply to the toolbox's negative margin.
	if(wasEnabled && inFullScreen && FullScreen._isChromeCollapsed) {
		gNavToolbox.style.marginTop = -gNavToolbox.getBoundingClientRect().height + "px";
	}
};

this.togglePopups = function() {
	Modules.loadIf('popups', Prefs.slimChrome);
};

this.toggleAwesomerUnifiedComplete = function() {
	Modules.loadIf('AwesomerUnifiedComplete', Prefs.awesomerURLBar);
};

this.toggleAdaptSearchBar = function() {
	Modules.loadIf('adaptSearchBar', Prefs.adaptSearchBar);
};

Modules.LOADMODULE = function() {
	Prefs.setDefaults({ autohide: true }, 'fullscreen', 'browser');

	Overlays.overlayWindow(window, 'TheFOB', self);

	Modules.load('compatibilityFix/windowFixes');

	Prefs.listen('slimChrome', self);
	Prefs.listen('autohide', self);
	Prefs.listen('awesomerURLBar', self);
	Prefs.listen('adaptSearchBar', self);

	Listeners.add(window, 'fullscreen', self);
	Listeners.add(window, 'beforecustomization', self);
	Listeners.add(window, 'aftercustomization', self);

	togglePopups();
	toggleSlimChrome();
	toggleAwesomerUnifiedComplete();
	toggleAdaptSearchBar();
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'fullscreen', self);
	Listeners.remove(window, 'beforecustomization', self);
	Listeners.remove(window, 'aftercustomization', self);

	Prefs.unlisten('slimChrome', self);
	Prefs.unlisten('autohide', self);
	Prefs.unlisten('awesomerURLBar', self);
	Prefs.unlisten('adaptSearchBar', self);

	Modules.unload('adaptSearchBar');
	Modules.unload('AwesomerUnifiedComplete');
	Modules.unload('slimChrome');
	Modules.unload('popups');

	Modules.unload('compatibilityFix/windowFixes');

	Overlays.removeOverlayWindow(window, 'TheFOB');
};
