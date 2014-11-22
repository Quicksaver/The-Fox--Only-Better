Modules.VERSION = '1.1.7';

this.__defineGetter__('LinkLocationBar', function() { return window.LinkLocationBar; });

this.LLBlistener = function() {
	if(!Prefs.includeNavBar) { return; }
	if(typeof(setMini) == 'undefined') { return; }
	if(typeof(blockedPopup) != 'undefined' && blockedPopup) { return; }
	
	// show the link hover state immediately
	if(window.gURLBar.getAttribute('overlinkstate') == 'showing') {
		Timers.cancel('LBBlistener');
		setAttribute(slimChromeContainer, 'overlinkstate', 'true');
		setMini(true);
	// see if a password field is focused, if yes remove the attr immediately so the url is shown
	} else if(focusPasswords()) {
		removeAttribute(slimChromeContainer, 'overlinkstate');
		miniSideSwitch(false);
	// if not remove the overlinkstate attr only after the mini bar is hidden
	} else {
		Timers.init('LBBlistener', function() {
			removeAttribute(slimChromeContainer, 'overlinkstate');
			miniSideSwitch(false);
		}, 400);
	}
};

// its preferences are lost when slimChrome un/loads
this.LLBreapply = function() {
	LinkLocationBar.startup();
	LLBapply(); // will only actually apply when slimChromeContainer exists, so it's safe to call always here
};

this.LLBapply = function() {
	Listeners.add(slimChromeContainer, 'mouseover', LLBonMouseOver, true);
};

this.LLBunapply = function() {
	Listeners.remove(slimChromeContainer, 'mouseover', LLBonMouseOver, true);
};

this.LLBresize = function() {
	var sscode = '/*The Fox, Only Better CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-container[onlyURLBar][overlinkstate]:not([hover]) {\n';
	sscode += '		max-width: ' + Math.floor(lastSlimChromeStyle.width /2) + 'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-container[onlyURLBar][overlinkstate]:not([hover]) [anonid="over-link-box"] {\n';
	sscode += '		max-width: ' + (Math.floor(lastSlimChromeStyle.width /2) -16) + 'px !important;\n';
	sscode += '	}\n';
	sscode += '}';
	
	Styles.load('LLBresize_'+_UUID, sscode, true);
};

this.LLBonMouseOver = function(e) {
	if(!trueAttribute(slimChromeContainer, 'overlinkstate')
	|| !trueAttribute(slimChromeContainer, 'onlyURLBar')
	|| trueAttribute(slimChromeContainer, 'hover')) {
		return;
	}
	
	e.preventDefault();
	e.stopPropagation();
	miniSideSwitch(!trueAttribute(slimChromeContainer, 'miniSideSwitch'));
};

Modules.LOADMODULE = function() {
	Styles.load('LinkLocationBar', 'LinkLocationBar');
	
	Listeners.add(window, 'LoadedSlimChrome', LLBreapply);
	Listeners.add(window, 'UnloadingSlimChrome', LLBunapply);
	Listeners.add(window, 'UnloadedSlimChrome', LLBreapply);
	Listeners.add(window, 'MovedSlimChrome', LLBresize);
	
	Watchers.addAttributeWatcher(window.gURLBar, 'overlinkstate', LLBlistener, false, false);
	
	if(typeof(lastSlimChromeStyle) != 'undefined' && lastSlimChromeStyle) {
		LLBresize();
	}
	
	LLBreapply();
};

Modules.UNLOADMODULE = function() {
	Watchers.removeAttributeWatcher(window.gURLBar, 'overlinkstate', LLBlistener, false, false);
	
	Listeners.remove(window, 'LoadedSlimChrome', LLBreapply);
	Listeners.remove(window, 'UnloadingSlimChrome', LLBunapply);
	Listeners.remove(window, 'UnloadedSlimChrome', LLBreapply);
	Listeners.remove(window, 'MovedSlimChrome', LLBresize);
	
	Styles.unload('LLBresize_'+_UUID);
	
	LLBreapply();
	
	if(UNLOADED) {
		Styles.unload('LinkLocationBar');
	}
};
