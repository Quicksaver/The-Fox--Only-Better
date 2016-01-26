// VERSION 2.0.9

this.__defineGetter__('slimChromeBroadcaster', function() { return $(objName+'-slimChrome-broadcaster'); });
this.__defineGetter__('gNavToolbox', function() { return window.gNavToolbox; });
this.__defineGetter__('gNavBar', function() { return $('nav-bar'); });
this.__defineGetter__('gURLBar', function() { return window.gURLBar; });
this.__defineGetter__('overflowList', function() { return $('widget-overflow-list'); });
this.__defineGetter__('gBrowser', function() { return window.gBrowser; });
this.__defineGetter__('fullScreen', function() { return window.fullScreen; });
this.__defineGetter__('mozFullScreen', function() { return document.mozFullScreen; });
this.__defineGetter__('fullScreenAutohide', function() { return !DARWIN && Prefs.autohide; });

// set this here, so I can modify it through other modules without reseting it when slimChrome un/loads
this.slimChromeExceptions = new Set(['addon-bar']);

this.handleEvent = function(e) {
	switch(e.type) {
		case 'fullscreen':
			toggleSlimChrome(fullScreen && !mozFullScreen && fullScreenAutohide);
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
			toggleSlimChrome(fullScreen && !mozFullScreen && fullScreenAutohide);
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

this.toggleSlimChrome = function(noLoad) {
	toggleAttribute(slimChromeBroadcaster, 'checked', Prefs.slimChrome);

	if(noLoad === undefined) {
		// Firefox for OS X doesn't automatically hide the toolbars like it does for other OS's in fullScreen
		noLoad = (fullScreen && !mozFullScreen && fullScreenAutohide) || customizing;
	}
	Modules.loadIf('slimChrome', Prefs.slimChrome && !noLoad);
};

this.togglePopups = function() {
	Modules.loadIf('popups', Prefs.slimChrome);
};

this.toggleAwesomerUnifiedComplete = function() {
	Modules.loadIf('AwesomerUnifiedComplete', Prefs.awesomerURLBar);
};

Modules.LOADMODULE = function() {
	Prefs.setDefaults({ autohide: true }, 'fullscreen', 'browser');

	Overlays.overlayWindow(window, 'TheFOB', self);

	Modules.load('compatibilityFix/windowFixes');

	Prefs.listen('slimChrome', self);
	Prefs.listen('autohide', self);
	Prefs.listen('awesomerURLBar', self);

	Listeners.add(window, 'fullscreen', self);
	Listeners.add(window, 'beforecustomization', self);
	Listeners.add(window, 'aftercustomization', self);

	togglePopups();
	toggleSlimChrome();
	toggleAwesomerUnifiedComplete();
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'fullscreen', self);
	Listeners.remove(window, 'beforecustomization', self);
	Listeners.remove(window, 'aftercustomization', self);

	Prefs.unlisten('slimChrome', self);
	Prefs.unlisten('autohide', self);
	Prefs.unlisten('awesomerURLBar', self);

	Modules.unload('AwesomerUnifiedComplete');
	Modules.unload('slimChrome');
	Modules.unload('popups');

	Modules.unload('compatibilityFix/windowFixes');

	Overlays.removeOverlayWindow(window, 'TheFOB');
};
