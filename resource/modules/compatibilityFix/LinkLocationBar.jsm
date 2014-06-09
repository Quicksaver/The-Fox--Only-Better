moduleAid.VERSION = '1.1.4';

this.__defineGetter__('LinkLocationBar', function() { return window.LinkLocationBar; });

this.LLBlistener = function() {
	if(!prefAid.includeNavBar) { return; }
	if(typeof(setMini) == 'undefined') { return; }
	if(typeof(blockedPopup) != 'undefined' && blockedPopup) { return; }
	
	// show the link hover state immediately
	if(window.gURLBar.getAttribute('overlinkstate') == 'showing') {
		timerAid.cancel('LBBlistener');
		setAttribute(slimChromeContainer, 'overlinkstate', 'true');
		setMini(true);
	// see if a password field is focused, if yes remove the attr immediately so the url is shown
	} else if(focusPasswords()) {
		removeAttribute(slimChromeContainer, 'overlinkstate');
	// if not remove the overlinkstate attr only after the mini bar is hidden
	} else {
		timerAid.init('LBBlistener', function() {
			removeAttribute(slimChromeContainer, 'overlinkstate');
		}, 400);
	}
};

// its preferences are lost when slimChrome un/loads
this.LLBreapply = function() {
	LinkLocationBar.startup();
};

this.LLBresize = function() {
	// Unload current stylesheet if it's been loaded
	styleAid.unload('LLBresize_'+_UUID);
	
	var sscode = '/*The Fox, Only Better CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-container[onlyURLBar][overlinkstate]:not([hover]) {\n';
	sscode += '		max-width: ' + lastSlimChromeStyle.width + 'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-container[onlyURLBar][overlinkstate]:not([hover]) [anonid="over-link-box"] {\n';
	sscode += '		max-width: ' + (lastSlimChromeStyle.width -16) + 'px !important;\n';
	sscode += '	}\n';
	sscode += '}';
	
	styleAid.load('LLBresize_'+_UUID, sscode, true);
};

moduleAid.LOADMODULE = function() {
	styleAid.load('LinkLocationBar', 'LinkLocationBar');
	
	listenerAid.add(window, 'LoadedSlimChrome', LLBreapply);
	listenerAid.add(window, 'UnloadedSlimChrome', LLBreapply);
	listenerAid.add(window, 'MovedSlimChrome', LLBresize);
	
	objectWatcher.addAttributeWatcher(window.gURLBar, 'overlinkstate', LLBlistener, false, false);
	
	if(typeof(lastSlimChromeStyle) != 'undefined' && lastSlimChromeStyle) {
		LLBresize();
	}
	
	LLBreapply();
};

moduleAid.UNLOADMODULE = function() {
	objectWatcher.removeAttributeWatcher(window.gURLBar, 'overlinkstate', LLBlistener, false, false);
	
	listenerAid.remove(window, 'LoadedSlimChrome', LLBreapply);
	listenerAid.remove(window, 'UnloadedSlimChrome', LLBreapply);
	listenerAid.remove(window, 'MovedSlimChrome', LLBresize);
	
	styleAid.unload('LLBresize_'+_UUID);
	
	LLBreapply();
	
	if(UNLOADED) {
		styleAid.unload('LinkLocationBar');
	}
};
