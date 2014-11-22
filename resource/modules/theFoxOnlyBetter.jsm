Modules.VERSION = '1.1.7';

this.__defineGetter__('slimChromeBroadcaster', function() { return $(objName+'-slimChrome-broadcaster'); });
this.__defineGetter__('gNavToolbox', function() { return window.gNavToolbox; });
this.__defineGetter__('gNavBar', function() { return $('nav-bar'); });
this.__defineGetter__('overflowList', function() { return $('widget-overflow-list'); });
this.__defineGetter__('gBrowser', function() { return window.gBrowser; });
this.__defineGetter__('fullScreen', function() { return window.fullScreen; });
this.__defineGetter__('mozFullScreen', function() { return document.mozFullScreen; });
this.__defineGetter__('fullScreenAutohide', function() { return !DARWIN && Prefs.autohide; });

// set this here, so I can modify it through other modules without reseting it when slimChrome un/loads
this.slimChromeExceptions = ['addon-bar'];

this.fullScreenListener = function() {
	// We get the fullscreen event _before_ the window transitions into or out of FS mode.
	toggleSlimChrome(!fullScreen && !mozFullScreen && fullScreenAutohide);
};

this.fullScreenAutohideListener = function() {
	toggleSlimChrome(fullScreen && !mozFullScreen && fullScreenAutohide);
};

this.customizeListener = function(e) {
	toggleSlimChrome(e.type == 'beforecustomization');
};

this.doOpenOptions = function() {
	openOptions();
};

this.toggleSlimChromePref = function() {
	Prefs.slimChrome = !Prefs.slimChrome;
};

this.ensureNotAllDisabled = function() {
	if(Prefs.includeNavBar && !Prefs.skyLights && !Prefs.miniOnTabSelect) {
		Prefs.skyLights = true;
		Prefs.miniOnTabSelect = true;
	}
};

this.toggleSlimChrome = function(noLoad) {
	toggleAttribute(slimChromeBroadcaster, 'checked', Prefs.slimChrome);
	
	if(noLoad === undefined || noLoad == 'slimChrome') {
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
	
	// for security reasons, we don't let both skyLights and miniOnTabSelect be disabled at the same time
	ensureNotAllDisabled();
	
	Overlays.overlayWindow(window, 'TheFOB', null, function() { toggleSlimChrome(); });
	
	Modules.load('whatsNew');
	Modules.load('compatibilityFix/windowFixes');
	
	Prefs.listen('slimChrome', toggleSlimChrome);
	Prefs.listen('slimChrome', togglePopups);
	Prefs.listen('autohide', fullScreenAutohideListener);
	
	Listeners.add(window, 'fullscreen', fullScreenListener);
	Listeners.add(window, 'beforecustomization', customizeListener);
	Listeners.add(window, 'aftercustomization', customizeListener);
	
	togglePopups();
	toggleSlimChrome();
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'fullscreen', fullScreenListener);
	Listeners.remove(window, 'beforecustomization', customizeListener);
	Listeners.remove(window, 'aftercustomization', customizeListener);
	
	Prefs.unlisten('slimChrome', toggleSlimChrome);
	Prefs.unlisten('slimChrome', togglePopups);
	Prefs.unlisten('autohide', fullScreenAutohideListener);
	
	Modules.unload('slimChrome');
	Modules.unload('popups');
	
	Modules.unload('compatibilityFix/windowFixes');
	Modules.unload('whatsNew');
	
	Overlays.removeOverlayWindow(window, 'TheFOB');
};
