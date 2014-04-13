moduleAid.VERSION = '1.0.1';

this.__defineGetter__('gNavToolbox', function() { return window.gNavToolbox; });
this.__defineGetter__('gNavBar', function() { return $('nav-bar'); });
this.__defineGetter__('gBrowser', function() { return window.gBrowser; });
this.__defineGetter__('CustomizableUI', function() { return window.CustomizableUI; });
this.__defineGetter__('fullScreen', function() { return window.fullScreen; });
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

this.fullScreenListener = function() {
	// We get the fullscreen event _before_ the window transitions into or out of FS mode.
	toggleLessChrome(!fullScreen);
};

this.customizeListener = function(e) {
	toggleLessChrome(e.type == 'beforecustomization');
};

this.toggleLessChrome = function(noLoad) {
	if(noLoad === undefined) {
		noLoad = fullScreen || customizing;
	}
	moduleAid.loadIf('lessChrome', prefAid.lessChrome && !noLoad);
};

moduleAid.LOADMODULE = function() {
	moduleAid.load('compatibilityFix/windowFixes');
	
	prefAid.listen('lessChrome', toggleLessChrome);
	
	listenerAid.add(window, 'fullscreen', fullScreenListener);
	listenerAid.add(window, 'beforecustomization', customizeListener, true);
	listenerAid.add(window, 'aftercustomization', customizeListener, true);
	
	toggleLessChrome();
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(window, 'fullscreen', fullScreenListener);
	listenerAid.remove(window, 'beforecustomization', customizeListener, true);
	listenerAid.remove(window, 'aftercustomization', customizeListener, true);
	
	prefAid.unlisten('lessChrome', toggleLessChrome);
	
	moduleAid.unload('lessChrome');
	
	moduleAid.unload('compatibilityFix/windowFixes');
};
