Modules.VERSION = '2.3.2';
Modules.UTILS = true;
Modules.CLEAN = false;

// PrivateBrowsing - Private browsing mode aid
this.__defineGetter__('PrivateBrowsing', function() { Observers; delete this.PrivateBrowsing; Modules.load('utils/PrivateBrowsing'); return PrivateBrowsing; });

// toCode - allows me to modify a function quickly and safely from within my scripts
this.__defineGetter__('toCode', function() { delete this.toCode; Modules.load('utils/toCode'); return toCode; });

// keydownPanel - Panel elements don't support keyboard navigation by default; this object fixes that.
this.__defineGetter__('keydownPanel', function() { delete this.keydownPanel; Modules.load('utils/keydownPanel'); return keydownPanel; });

// alwaysRunOnClose[] - array of methods to be called when a window is unloaded. Each entry expects function(aWindow) where
// 	aWindow - (object) the window that has been unloaded
this.alwaysRunOnClose = [];

Modules.LOADMODULE = function() {
	// Overlays stuff, no need to load the whole module if it's not needed.
	// This will be run after removeObject(), so this is just to prevent any leftovers
	alwaysRunOnClose.push(function(aWindow) {
		delete aWindow['_OVERLAYS_'+objName];
		
		try {
			var attr = aWindow.document.documentElement.getAttribute('Bootstrapped_Overlays').split(' ');
			if(attr.indexOf(objName) == -1) { return; }
			
			attr.splice(attr.indexOf(objName), 1);
			if(attr.length > 0) {
				aWindow.document.documentElement.setAttribute('Bootstrapped_Overlays', attr.join(' '));
			} else {
				aWindow.document.documentElement.removeAttribute('Bootstrapped_Overlays');
			}
		}
		catch(ex) {} // Prevent some unforeseen error here
	});
	alwaysRunOnClose.push(removeObject);
	
	// This will not happen when quitting the application (on a restart for example), it's not needed in this case
	Listeners.add(window, 'unload', function(e) {
		window.willClose = true; // window.closed is not reliable in some cases
		
		// We don't use alwaysRunOnClose directly because removeObject() destroys it
		var tempArr = [];
		for(var i=0; i<alwaysRunOnClose.length; i++) {
			tempArr.push(alwaysRunOnClose[i]);
		}
		
		while(tempArr.length > 0) {
			tempArr.pop()(window);
		}
		
		delete window.willClose;
	}, false, true);
};

Modules.UNLOADMODULE = function() {
	Modules.clean();
};
