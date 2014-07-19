moduleAid.VERSION = '1.1.3';

this.__defineGetter__('slimChromeBroadcaster', function() { return $(objName+'-slimChrome-broadcaster'); });
this.__defineGetter__('gNavToolbox', function() { return window.gNavToolbox; });
this.__defineGetter__('gNavBar', function() { return $('nav-bar'); });
this.__defineGetter__('overflowList', function() { return $('widget-overflow-list'); });
this.__defineGetter__('gBrowser', function() { return window.gBrowser; });
this.__defineGetter__('CustomizableUI', function() { return window.CustomizableUI; });
this.__defineGetter__('fullScreen', function() { return window.fullScreen; });
this.__defineGetter__('mozFullScreen', function() { return document.mozFullScreen; });
this.__defineGetter__('fullScreenAutohide', function() { return !DARWIN && prefAid.autohide; });
this.__defineGetter__('customizing', function() {
	if(trueAttribute(document.documentElement, 'customizing')) { return true; }
	
	// this means that the window is still opening and the first tab will open customize mode
	if(gBrowser.mCurrentBrowser
	&& gBrowser.mCurrentBrowser.__SS_restore_data
	&& gBrowser.mCurrentBrowser.__SS_restore_data.url == 'about:customizing') {
		return true;
	}
	
	return false;
});

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
	prefAid.slimChrome = !prefAid.slimChrome;
};

this.ensureNotAllDisabled = function() {
	if(prefAid.includeNavBar && !prefAid.skyLights && !prefAid.miniOnTabSelect) {
		prefAid.skyLights = true;
		prefAid.miniOnTabSelect = true;
	}
};

this.toggleSlimChrome = function(noLoad) {
	toggleAttribute(slimChromeBroadcaster, 'checked', prefAid.slimChrome);
	
	if(noLoad === undefined || noLoad == 'slimChrome') {
		// Firefox for OS X doesn't automatically hide the toolbars like it does for other OS's in fullScreen
		noLoad = (fullScreen && !mozFullScreen && fullScreenAutohide) || customizing;
	}
	moduleAid.loadIf('slimChrome', prefAid.slimChrome && !noLoad);
};

this.togglePopups = function() {
	moduleAid.loadIf('popups', prefAid.slimChrome);
};

moduleAid.LOADMODULE = function() {
	prefAid.setDefaults({ autohide: true }, 'fullscreen', 'browser');
	
	// for security reasons, we don't let both skyLights and miniOnTabSelect be disabled at the same time
	ensureNotAllDisabled();
	
	overlayAid.overlayWindow(window, 'TheFOB', null, function() { toggleSlimChrome(); });
	
	moduleAid.load('compatibilityFix/windowFixes');
	
	prefAid.listen('slimChrome', toggleSlimChrome);
	prefAid.listen('slimChrome', togglePopups);
	prefAid.listen('autohide', fullScreenAutohideListener);
	
	listenerAid.add(window, 'fullscreen', fullScreenListener);
	listenerAid.add(window, 'beforecustomization', customizeListener, true);
	listenerAid.add(window, 'aftercustomization', customizeListener, true);
	
	togglePopups();
	toggleSlimChrome();
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(window, 'fullscreen', fullScreenListener);
	listenerAid.remove(window, 'beforecustomization', customizeListener, true);
	listenerAid.remove(window, 'aftercustomization', customizeListener, true);
	
	prefAid.unlisten('slimChrome', toggleSlimChrome);
	prefAid.unlisten('slimChrome', togglePopups);
	prefAid.unlisten('autohide', fullScreenAutohideListener);
	
	moduleAid.unload('slimChrome');
	moduleAid.unload('popups');
	
	moduleAid.unload('compatibilityFix/windowFixes');
	
	overlayAid.removeOverlayWindow(window, 'TheFOB');
};
