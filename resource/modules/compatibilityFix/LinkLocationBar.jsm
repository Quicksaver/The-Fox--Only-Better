moduleAid.VERSION = '1.0.0';

this.__defineGetter__('LinkLocationBar', function() { return window.LinkLocationBar; });

this.LLBlistener = function() {
	if(typeof(setMini) == 'undefined') { return; }
	if(typeof(blockedPopup) != 'undefined' && blockedPopup) { return; }
	
	if(window.gURLBar.getAttribute('overlinkstate') == 'showing') {
		setMini(true);
	} else if(!focusPasswords({ type: 'focus', target: document.commandDispatcher.focusedElement })) {
		setMini(false);
	}
};

// its preferences are lost when slimChrome un/loads
this.LBBreapply = function() {
	LinkLocationBar.startup();
};

// some times the attribute isn't removed and stays as "fade-out", so the mini bar won't render neither the hover link or the current location
this.LBBclear = function() {
	if(window.gURLBar.getAttribute('overlinkstate') != 'showing') {
		removeAttribute(window.gURLBar, 'overlinkstate');
	}
};

moduleAid.LOADMODULE = function() {
	listenerAid.add(window, 'LoadedSlimChrome', LBBreapply);
	listenerAid.add(window, 'UnloadedSlimChrome', LBBreapply);
	listenerAid.add(window, 'RemovedOnlyURLBar', LBBclear);
	
	objectWatcher.addAttributeWatcher(window.gURLBar, 'overlinkstate', LLBlistener, false, false);
	
	LBBreapply();
};

moduleAid.UNLOADMODULE = function() {
	objectWatcher.removeAttributeWatcher(window.gURLBar, 'overlinkstate', LLBlistener, false, false);
	
	listenerAid.remove(window, 'LoadedSlimChrome', LBBreapply);
	listenerAid.remove(window, 'UnloadedSlimChrome', LBBreapply);
	listenerAid.remove(window, 'RemovedOnlyURLBar', LBBclear);
	
	LBBreapply();
};
