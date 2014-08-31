moduleAid.VERSION = '2.3.1';
moduleAid.UTILS = true;
moduleAid.CLEAN = false;

// window - Similarly to windowMediator.callOnMostRecent, the window property returns the most recent navigator:browser window object
this.__defineGetter__('window', function() { return Services.wm.getMostRecentWindow('navigator:browser'); });

// document - Returns the document object associated with the most recent window object
this.__defineGetter__('document', function() { return window.document; });

// prefAid - Object to contain and manage all preferences related to the add-on (and others if necessary)
this.__defineGetter__('prefAid', function() { delete this.prefAid; moduleAid.load('utils/prefAid'); return prefAid; });

// styleAid - handle loading and unloading of stylesheets in a quick and easy way
this.__defineGetter__('styleAid', function() { delete this.styleAid; moduleAid.load('utils/styleAid'); return styleAid; });

// windowMediator - Aid object to help with window tasks involving window-mediator and window-watcher
this.__defineGetter__('windowMediator', function() { delete this.windowMediator; moduleAid.load('utils/windowMediator'); return windowMediator; });

// browserMediator - Aid object to track and perform tasks on all document browsers across the windows
this.__defineGetter__('browserMediator', function() { windowMediator; delete this.browserMediator; moduleAid.load('utils/browserMediator'); return browserMediator; });

// messenger - Aid object to communicate with browser content scripts (e10s).
this.__defineGetter__('messenger', function() { delete this.messenger; moduleAid.load('utils/messenger'); return messenger; });

// observerAid - Helper for adding and removing observers
this.__defineGetter__('observerAid', function() { delete this.observerAid; moduleAid.load('utils/observerAid'); return observerAid; });

// overlayAid - to use overlays in my bootstraped add-ons
this.__defineGetter__('overlayAid', function() { browserMediator; observerAid; delete this.overlayAid; moduleAid.load('utils/overlayAid'); return overlayAid; });

// objectWatcher - This acts as a replacement for the event DOM Attribute Modified, works for both attributes and object properties
this.__defineGetter__('objectWatcher', function() { delete this.objectWatcher; moduleAid.load('utils/objectWatcher'); return objectWatcher; });

this.__defineGetter__('keysetAid', function() { windowMediator; delete this.keysetAid; moduleAid.load('utils/keysetAid'); return keysetAid; });

// closeCustomize() - useful for when you want to close the customize tabs for whatever reason
this.closeCustomize = function() {
	windowMediator.callOnAll(function(aWindow) {
		if(aWindow.gCustomizeMode) {
			aWindow.gCustomizeMode.exit();
		}
	}, 'navigator:browser');
};

// openOptions() and closeOptions() - to open/close the extension's options dialog or focus it if already opened in case optionsURL is set
// I'm not adding these to sandboxTools because closeOptions is always called when shutting down the add-on,
// so this way it won't load the module when disabling the add-on if it hand't been loaded yet.
this.openOptions = function() {
	if(UNLOADED || !Addon.optionsURL) { return; }
	if(!windowMediator.callOnMostRecent(function(aWindow) { aWindow.focus(); return true; }, null, Addon.optionsURL)) {
		window.openDialog(Addon.optionsURL, '', 'chrome,toolbar,resizable=false');
	}
};
this.closeOptions = function() {
	if(!Addon.optionsURL) { return; }
	windowMediator.callOnAll(function(aWindow) { try { aWindow.close(); } catch(ex) {} }, null, Addon.optionsURL);
};

// fillVersion() - to automatically fill in the version information in the about tab of the preferences dialog
// 	box - (xul element) where the version number is supposed to appear
this.fillVersion = function(box) {
	if(!box || !Addon || !Addon.version) { return; }
	
	box.textContent = Addon.version;
	box.hidden = false;
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.clean();
};
