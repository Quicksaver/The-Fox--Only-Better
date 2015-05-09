Modules.VERSION = '2.0.0';

this.__defineGetter__('slimChromeBroadcaster', function() { return $(objName+'-slimChrome-broadcaster'); });
this.__defineGetter__('gNavToolbox', function() { return window.gNavToolbox; });
this.__defineGetter__('gNavBar', function() { return $('nav-bar'); });
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
			// We get the fullscreen event _before_ the window transitions into or out of FS mode.
			toggleSlimChrome(!fullScreen && !mozFullScreen && fullScreenAutohide);
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
		
		case 'beforecustomization':
			toggleSlimChrome(true);
			break;
		
		case 'aftercustomization':
			toggleSlimChrome(false);
			break;
	}
};

this.onLoad = function() {
	toggleSlimChrome();
};

this.doOpenOptions = function() {
	openOptions();
};

this.toggleSlimChromePref = function() {
	Prefs.slimChrome = !Prefs.slimChrome;
};

this.ensureNotAllDisabled = function() {
	if(Prefs.includeNavBar && !Prefs.skyLights && !Prefs.miniOnChangeLocation) {
		Prefs.skyLights = true;
		Prefs.miniOnChangeLocation = true;
	}
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

Modules.LOADMODULE = function() {
	Prefs.setDefaults({ autohide: true }, 'fullscreen', 'browser');
	
	// for security reasons, we don't let both skyLights and miniOnChangeLocation be disabled at the same time
	ensureNotAllDisabled();
	
	Overlays.overlayWindow(window, 'TheFOB', self);
	
	Modules.load('whatsNew');
	Modules.load('compatibilityFix/windowFixes');
	
	Prefs.listen('slimChrome', self);
	Prefs.listen('autohide', self);
	
	Listeners.add(window, 'fullscreen', self);
	Listeners.add(window, 'beforecustomization', self);
	Listeners.add(window, 'aftercustomization', self);
	
	togglePopups();
	toggleSlimChrome();
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'fullscreen', self);
	Listeners.remove(window, 'beforecustomization', self);
	Listeners.remove(window, 'aftercustomization', self);
	
	Prefs.unlisten('slimChrome', self);
	Prefs.unlisten('autohide', self);
	
	Modules.unload('slimChrome');
	Modules.unload('popups');
	
	Modules.unload('compatibilityFix/windowFixes');
	Modules.unload('whatsNew');
	
	Overlays.removeOverlayWindow(window, 'TheFOB');
};
