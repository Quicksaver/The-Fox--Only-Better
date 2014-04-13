moduleAid.VERSION = '1.0.0';

this.__defineGetter__('gNavToolbox', function() { return window.gNavToolbox; });
this.__defineGetter__('gNavBar', function() { return $('nav-bar'); });
this.__defineGetter__('CustomizableUI', function() { return window.CustomizableUI; });

this.toggleLessChrome = function() {
	moduleAid.loadIf('lessChrome', prefAid.lessChrome);
};

moduleAid.LOADMODULE = function() {
	moduleAid.load('compatibilityFix/windowFixes');
	
	prefAid.listen('lessChrome', toggleLessChrome);
	
	toggleLessChrome();
};

moduleAid.UNLOADMODULE = function() {
	prefAid.unlisten('lessChrome', toggleLessChrome);
	
	moduleAid.unload('lessChrome');
	
	moduleAid.unload('compatibilityFix/windowFixes');
};
