Modules.VERSION = '1.5.14';

this.__defineGetter__('slimChromeSlimmer', function() { return $(objName+'-slimChrome-slimmer'); });
this.__defineGetter__('slimChromeContainer', function() { return $(objName+'-slimChrome-container'); });
this.__defineGetter__('slimChromeToolbars', function() { return $(objName+'-slimChrome-toolbars'); });

this._slimAnimation = null;
this.__defineGetter__('slimAnimation', function() { return this._slimAnimation || Prefs.slimAnimation; });
this.__defineSetter__('slimAnimation', function(v) {
	if(v) {
		Timers.init('resetSlimAnimation', function() {
			slimAnimation = null;
		}, 2250);
	}
	this._slimAnimation = v;
	slimChromeAnimation();
});

this.__defineGetter__('browserPanel', function() { return $('browser-panel'); });
this.__defineGetter__('contentArea', function() { return $('browser'); });
this.__defineGetter__('customToolbars', function() { return $('customToolbars'); });
this.__defineGetter__('TabsToolbar', function() { return $('TabsToolbar'); });
this.__defineGetter__('MenuBar', function() { return $('toolbar-menubar'); });
this.__defineGetter__('PlacesToolbarHelper', function() { return window.PlacesToolbarHelper; });
this.__defineGetter__('PlacesToolbar', function() { return PlacesToolbarHelper._viewElt; });
this.__defineGetter__('tabDropIndicator', function() { return $('tabbrowser-tabs')._tabDropIndicator; });
this.__defineGetter__('gURLBar', function() { return window.gURLBar; });
this.__defineGetter__('gSearchBar', function() { return $('searchbar'); });

// until I find a better way of finding out on which side of the browser is the scrollbar, I'm setting equal margins
this.MIN_LEFT = 22;
this.MIN_RIGHT = 22;
this.MIN_WIDTH = 550;

// how much (px) should the active area of the slimmer "extend" on windows with chromehidden~=menubar
// also affects the main window when Tree Style Tabs is enabled
this.EXTEND_SLIM_CHROMEHIDDEN = 21;

this.moveSlimChromeStyle = {};
this.lastSlimChromeStyle = null;

this.delayMoveSlimChrome = function() {
	Timers.init('delayMoveSlimChrome', moveSlimChrome, 0);
};

this.shouldReMoveSlimChrome = function(newStyle) {
	if(!lastSlimChromeStyle) { return true; }
	
	if(!newStyle) {
		return (slimChromeContainer.clientWidth != lastSlimChromeStyle.clientWidth);
	}
	else if(newStyle.right != lastSlimChromeStyle.right
		|| newStyle.left != lastSlimChromeStyle.left
		|| newStyle.width != lastSlimChromeStyle.width
		|| newStyle.clientWidth != lastSlimChromeStyle.clientWidth) {
			return true;
	}
	
	return false;
};

// Handles the position of the top chrome
this.moveSlimChrome = function() {
	moveSlimChromeStyle = {
		width: -MIN_RIGHT -MIN_LEFT,
		clientWidth: slimChromeContainer.clientWidth,
		left: MIN_LEFT,
		right: MIN_RIGHT
	};
	
	var appContentPos = $('content').getBoundingClientRect();
	moveSlimChromeStyle.width += appContentPos.width;
	moveSlimChromeStyle.left += appContentPos.left;
	moveSlimChromeStyle.right += document.documentElement.clientWidth -appContentPos.right;
	
	// Compatibility with TreeStyleTab
	if(TabsToolbar && !TabsToolbar.collapsed && TabsToolbar.getAttribute('treestyletab-tabbar-autohide-state') != 'hidden') {
		// This is also needed when the tabs are on the left, the width of the findbar doesn't follow with the rest of the window for some reason
		if(TabsToolbar.getAttribute('treestyletab-tabbar-position') == 'left' || TabsToolbar.getAttribute('treestyletab-tabbar-position') == 'right') {
			var TabsSplitter = document.getAnonymousElementByAttribute($('content'), 'class', 'treestyletab-splitter');
			moveSlimChromeStyle.width -= TabsToolbar.clientWidth;
			moveSlimChromeStyle.width -= TabsSplitter.clientWidth +(TabsSplitter.clientLeft *2);
			if(TabsToolbar.getAttribute('treestyletab-tabbar-position') == 'left') {
				moveSlimChromeStyle.left += TabsToolbar.clientWidth;
				moveSlimChromeStyle.left += TabsSplitter.clientWidth +(TabsSplitter.clientLeft *2);
			}
			if(TabsToolbar.getAttribute('treestyletab-tabbar-position') == 'right') {
				moveSlimChromeStyle.right += TabsToolbar.clientWidth;
				moveSlimChromeStyle.right += TabsSplitter.clientWidth +(TabsSplitter.clientLeft *2);
			}
		}
	}
	
	moveSlimChromeStyle.fullWidth = Math.max(moveSlimChromeStyle.width +MIN_RIGHT +MIN_LEFT, 100);
	moveSlimChromeStyle.fullLeft = moveSlimChromeStyle.left -MIN_LEFT;
	moveSlimChromeStyle.fullRight =  moveSlimChromeStyle.right -MIN_RIGHT;
	
	moveSlimChromeStyle.width = Math.max(moveSlimChromeStyle.width, 100);
	
	if(!shouldReMoveSlimChrome(moveSlimChromeStyle)) { return; }
	
	lastSlimChromeStyle = moveSlimChromeStyle;
	
	var sscode = '/*The Fox, Only Better CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-container:-moz-locale-dir(ltr) {\n';
	sscode += '		left: ' + moveSlimChromeStyle.left + 'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-container:-moz-locale-dir(rtl) {\n';
	sscode += '		right: ' + moveSlimChromeStyle.right + 'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-container {\n';
	sscode += '		width: ' + moveSlimChromeStyle.width + 'px;\n';
	sscode += '	}\n';
	
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #navigator-toolbox[slimStyle="full"] #'+objName+'-slimChrome-container:-moz-any([hover],:not([onlyURLBar])):-moz-locale-dir(ltr) {\n';
	sscode += '		left: ' + moveSlimChromeStyle.fullLeft + 'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #navigator-toolbox[slimStyle="full"] #'+objName+'-slimChrome-container:-moz-any([hover],:not([onlyURLBar])):-moz-locale-dir(rtl) {\n';
	sscode += '		right: ' + moveSlimChromeStyle.fullRight + 'px;\n';
	sscode += '	}\n';
	
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-container[onlyURLBar]:-moz-locale-dir(ltr):not([miniSideSwitch]),\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-container[onlyURLBar]:-moz-locale-dir(rtl)[miniSideSwitch] {\n';
	sscode += '		left: ' + moveSlimChromeStyle.left + 'px;\n';
	sscode += '		right: auto;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-container[onlyURLBar]:-moz-locale-dir(rtl):not([miniSideSwitch]),\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-container[onlyURLBar]:-moz-locale-dir(ltr)[miniSideSwitch] {\n';
	sscode += '		left: auto;\n';
	sscode += '		right: ' + moveSlimChromeStyle.right + 'px;\n';
	sscode += '	}\n';
	
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #navigator-toolbox[slimStyle="full"] #'+objName+'-slimChrome-container:-moz-any([hover],:not([onlyURLBar])) {\n';
	sscode += '		width: ' + moveSlimChromeStyle.fullWidth + 'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #navigator-toolbox:not([slimAnimation="rollout"]) #'+objName+'-slimChrome-container:not([hover])[onlyURLBar],\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #navigator-toolbox[slimAnimation="rollout"] #'+objName+'-slimChrome-container:not([hover]) {\n';
	sscode += '		width: ' + Math.min(moveSlimChromeStyle.width, MIN_WIDTH) + 'px;\n';
	sscode += '	}\n';
	sscode += '}';
	
	Styles.load('slimChromeMove_'+_UUID, sscode, true);
	
	dispatch(slimChromeContainer, { type: 'MovedSlimChrome', cancelable: false });
};

this.moveOnSidebar = function(aBox, aAttr, oldVal, newVal) {
	if(oldVal != newVal) {
		delayMoveSlimChrome();
	}
};

this.miniSideSwitch = function(v) {
	toggleAttribute(slimChromeContainer, 'miniSideSwitch', v);
};

this.onMouseOver = function(e) {
	setHover(true, e && isAncestor(e.target, slimChromeContainer));
};

this.onMouseOut = function() {
	setHover(false);
};

this.onFocus = function() {
	setHover(true, true);
};

this.onMouseOutBrowser = function(e) {
	// bascially this means that when the mouse left something, it entered "nothing", which is what we want to capture here
	if(e.relatedTarget) { return; }
	
	// also, don't capture this if we're in HTML5 fullscreen mode and in Mac OS X, as it's just weird
	if(DARWIN && mozFullScreen) { return; }
	
	if(document.documentElement.getAttribute('chromehidden').indexOf('menubar') == -1 && dispatch(slimChromeContainer, { type: 'SlimChromeNormalActiveArea' })) {
		// we also only need to show if the mouse is hovering the toolbox, leaving the window doesn't count
		if(e.screenY < gNavToolbox.boxObject.screenY
		|| e.screenY > gNavToolbox.boxObject.screenY +gNavToolbox.boxObject.height
		|| e.screenX < gNavToolbox.boxObject.screenX
		|| e.screenX > gNavToolbox.boxObject.screenX +gNavToolbox.boxObject.width) { return; }
	} else {
		// in popup windows, we "extend the hover area" by pretending the slimmer is taller than it actually is
		if(e.screenY < slimChromeSlimmer.boxObject.screenY -EXTEND_SLIM_CHROMEHIDDEN
		|| e.screenY > slimChromeSlimmer.boxObject.screenY
		|| e.screenX < slimChromeSlimmer.boxObject.screenX
		|| e.screenX > slimChromeSlimmer.boxObject.screenX +slimChromeSlimmer.boxObject.width) { return; }
	}
	
	onMouseOver();
	
	// don't keep listening to mouseout, otherwise the toolbox would get stuck open
	Listeners.remove(browserPanel, 'mouseout', onMouseOutBrowser);
	Listeners.add(browserPanel, 'mouseover', onMouseReEnterBrowser);
};

this.onMouseReEnterBrowser = function(e) {
	// no need to check for target here, if we're entering something, there's always "something" to enter, so the other handlers can take care of it
	onMouseOut();
	
	// stop this listener, or the toolbox would be stuck close otherwise, and start listening for mouseout again
	Listeners.remove(browserPanel, 'mouseover', onMouseReEnterBrowser);
	Listeners.add(browserPanel, 'mouseout', onMouseOutBrowser);
};

this.isMenuBarPopup = function(e) {
	var node = e.originalTarget;
	
	// we don't want the chrome to show or hide when hovering the menu popups from the menu bar
	var toolbars = [MenuBar, TabsToolbar];
	
	// if we're not including the nav-bar in the container, might as well apply the same rule to it
	if(!Prefs.includeNavBar) {
		toolbars.push(gNavBar);
	}
	
	for(var t=0; t<toolbars.length; t++) {
		if(isAncestor(node, toolbars[t])) {
			var parent = node;
			while(parent) {
				if(parent == toolbars[t]) { break; }
				if(parent.localName == 'menupopup') { return true; }
				
				// the searchbar's engine selection popup is a bit of a special case; the mouseover events repeat for the actual searchbar
				if(parent.localName == 'searchbar' && e.type == 'mouseover') {
					var searchPopup = document.getAnonymousElementByAttribute(parent, 'anonid', 'searchbar-popup');
					if(searchPopup.state == 'open') {
						if(e.screenY >= searchPopup.boxObject.screenY
						&& e.screenY <= searchPopup.boxObject.screenY +searchPopup.boxObject.height
						&& e.screenX >= searchPopup.boxObject.screenX
						&& e.screenX <= searchPopup.boxObject.screenX +searchPopup.boxObject.width) { return true; }
					}
				}
				
				parent = parent.parentNode;
			}
		}
	}
	
	return false;
};

this.onMouseOverToolbox = function(e) {
	// don't show chrome when hovering popups in the menu bar as it's unnecessary and will only look weird
	if(isMenuBarPopup(e)) { return; }
	
	// don't show chrome if hovering a widget panel, this will always be a child of nav-bar even if the trigger widget isn't, and the popup code will keep it open in that case;
	// unfortunately I can't actually do this, if the panel opens while the nav-bar is hidden away, it won't be responsive since technically the panel will also be hidden away
	//if(isAncestor(e.target, $('customizationui-widget-panel'))) { return; }
	
	// don't show chrome if something doesn't want it to be shown
	if(!dispatch(slimChromeContainer, { type: 'WillShowSlimChrome', detail: e })) { return; }
	
	if(trueAttribute(slimChromeContainer, 'mini') && !trueAttribute(slimChromeContainer, 'hover') && isAncestor(e.target, slimChromeContainer)) {
		slimChromeContainer.hoversQueued++;
		return;
	}
	onMouseOver(e);
};

this.onMouseOutToolbox = function(e) {
	if(isMenuBarPopup(e)) { return; }
	
	if(trueAttribute(slimChromeContainer, 'mini') && !trueAttribute(slimChromeContainer, 'hover') && isAncestor(e.target, slimChromeContainer)) {
		slimChromeContainer.hoversQueued--;
		return;
	}
	onMouseOut();
};

this.onDragStart = function() {
	Listeners.remove(gNavToolbox, 'dragenter', onDragEnter);
	Listeners.add(gBrowser, "dragenter", onDragExitAll);
	Listeners.add(window, "drop", onDragExitAll);
	Listeners.add(window, "dragend", onDragExitAll);
};

this.onDragEnter = function() {
	setHover(true);
	onDragStart();
};

this.onDragExit = function() {
	setHover(false);
};

this.onDragExitAll = function() {
	Listeners.add(gNavToolbox, 'dragenter', onDragEnter);
	Listeners.remove(gBrowser, "dragenter", onDragExitAll);
	Listeners.remove(window, "drop", onDragExitAll);
	Listeners.remove(window, "dragend", onDragExitAll);
	setHover(false);
};

this.setHover = function(hover, now, force) {
	if(hover) {
		slimChromeContainer.hovers++;
		
		if(!now) {
			Timers.init('setHover', function() {
				hoverTrue();
			}, Prefs.delayIn);
		} else {
			Timers.cancel('setHover');
			hoverTrue();
		}
		
		if(force !== undefined && typeof(force) == 'number') {
			slimChromeContainer.hovers = force;
		}
	}
	else {
		if(force !== undefined && typeof(force) == 'number') {
			slimChromeContainer.hovers = force;
		} else if(slimChromeContainer.hovers > 0) {
			slimChromeContainer.hovers--;
		}
		
		if(slimChromeContainer.hovers == 0) {
			Timers.init('setHover', function() {
				slimChromeOut();
				removeAttribute(slimChromeContainer, 'fullWidth');
				removeAttribute(slimChromeContainer, 'hover');
				ensureSlimChromeFinishedOpacity();
				Listeners.remove(contentArea, 'mousemove', contentAreaOnMouseMove);
				contentAreaMovedReset();
			}, (!now) ? Prefs.delayOut : 0);
		}
	}
};

this.hoverTrue = function() {
	slimChromeIn();
	setAttribute(slimChromeContainer, 'hover', 'true');
	setAttribute(gNavToolbox, 'slimChromeVisible', 'true');
	ensureSlimChromeFinishedWidth();
	
	// safeguard against the chrome getting stuck sometimes when I can't control it
	contentAreaMovedReset();
	Listeners.add(contentArea, 'mousemove', contentAreaOnMouseMove);
};

this.contentAreaMouseMoved = false;
this.contentAreaMovedReset = function() {
	Timers.cancel('contentAreaMouseMoved');
	contentAreaMouseMoved = false;
};

this.contentAreaOnMouseMove = function() {
	// no need to keep doing all the routine on each event and lag the browser, it will happen when it happens
	if(contentAreaMouseMoved) { return; }
	contentAreaMouseMoved = true;
	Timers.init('contentAreaMouseMoved', function() {
		// sometimes a popup can close or hide without triggering a popuphidden, or without being removed from the array. No idea why or exactly what happens...
		// I've seen this with PopupAutoCompleteRichResult.
		for(var p=0; p<holdPopupNodes.length; p++) {
			if(!holdPopupNodes[p].open && holdPopupNodes[p].state != 'open') {
				holdPopupNodes.splice(p, 1);
				p--;
			}
		}
		
		if(slimChromeContainer.hovers > 0 // no point if it's already supposed to hide
		&& initialShowings.length == 0 // don't hide if timers are active
		&& !isAncestor(document.commandDispatcher.focusedElement, slimChromeContainer) // make sure the top chrome isn't focused
		&& holdPopupNodes.length == 0 // a popup could be holding it open
		&& (!Prefs.useMouse || !$$('#navigator-toolbox:hover')[0]) // trick to find out if the mouse is hovering the chrome
		) {
			// if we get here, nothing is holding the chrome open, so it's likely that it should be hidden, but wasn't for some reason
			setHover(false, true, 0);
			return;
		}
		
		contentAreaMouseMoved = false;
	}, 500);
};

this.setMini = function(mini) {
	if(!Prefs.includeNavBar) { return; }
	
	dispatch(slimChromeContainer, { type: 'willSetMiniChrome', cancelable: false, detail: mini });
	
	if(mini) {
		Timers.cancel('onlyURLBar');
		Timers.cancel('setMini');
		slimChromeIn();
		setAttribute(slimChromeContainer, 'mini', 'true');
		setAttribute(slimChromeContainer, 'onlyURLBar', 'true');
		setAttribute(gNavToolbox, 'slimChromeVisible', 'true');
	} else {
		// aSync so the toolbox focus handler knows what it's doing
		Timers.init('setMini', function() {
			slimChromeOut();
			removeAttribute(slimChromeContainer, 'mini');
			
			if(!trueAttribute(slimChromeContainer, 'hover')) {
				// don't hover the chrome if the mini bar is hiding and the mouse happens to be hovering it
				setAttribute(slimChromeContainer, 'noPointerEvents', 'true');
				
				// reset this counter, so the chrome doesn't get stuck the next time it opens
				slimChromeContainer.hoversQueued = 0;
			}
			
			// let chrome hide completely before showing the rest of the UI
			Timers.init('onlyURLBar', function() {
				removeAttribute(slimChromeContainer, 'onlyURLBar');
				toggleAttribute(gNavToolbox, 'slimChromeVisible', trueAttribute(slimChromeContainer, 'hover'));
			}, slimAnimation == 'hinge' ? 500 : 300);
		}, 50);
	}
};

this.contentFocusPasswords = function(m) {
	m.target._showMiniBar = m.data;
	
	if(m.target == gBrowser.mCurrentBrowser) {
		focusPasswords();
	}
};

this.focusPasswords = function() {
	if(Prefs.includeNavBar && (typeof(blockedPopup) == 'undefined' || !blockedPopup)) {
		setMini(gBrowser.mCurrentBrowser._showMiniBar);
		return gBrowser.mCurrentBrowser._showMiniBar;
	}
	return false;
};

this.slimChromeIn = function() {
	setAttribute(slimChromeContainer, 'in', 'true');
	removeAttribute(slimChromeContainer, 'out');
};

this.slimChromeOut = function() {
	setAttribute(slimChromeContainer, 'out', 'true');
	removeAttribute(slimChromeContainer, 'in');
};

this.slimChromeTransitioned = function(e) {
	if(e.target != slimChromeContainer) { return; }
	
	var prop1 = 'width';
	switch(slimAnimation) {
		case 'fadein':
		case 'slidedown':
			if(!trueAttribute(slimChromeContainer, 'mini')) {
				prop1 = 'opacity';
			}
			break;
			
		case 'hinge':
			if(!trueAttribute(slimChromeContainer, 'mini')) {
				prop1 = 'transform';
			}
			break;
			
		default:
			break;
	}
	
	var prop2 = 'opacity';
	if(slimAnimation == 'hinge') {
		prop2 = 'transform';
	}
	
	switch(e.propertyName) {
		case prop1:
			slimChromeFinishedWidth();
		
		case prop2:
			slimChromeFinishedOpacity();
	}
};

this.slimChromeFinishedWidth = function() {
	Timers.cancel('ensureSlimChromeFinishedWidth');
	
	if(trueAttribute(slimChromeContainer, 'hover')) {
		// make sure it doesn't get stuck open
		// also account for any initial timers still running
		setHover(true, false, Math.max(1, initialShowings.length));
		
		// account for queued hovers while in mini mode
		if(slimChromeContainer.hoversQueued) {
			slimChromeContainer.hovers += slimChromeContainer.hoversQueued;
			slimChromeContainer.hoversQueued = 0;
		}
		
		setAttribute(slimChromeContainer, 'fullWidth', 'true');
		
		// update the Places Toolbar, so its items are distributed correclty
		var placesInToolbar = PlacesToolbarHelper._getParentToolbar(PlacesToolbar);
		if(isAncestor(placesInToolbar, slimChromeContainer) && !placesInToolbar.collapsed) {
			// don't block the rest in case this goes wrong
			try { PlacesToolbar._placesView.updateOverflowStatus(); }
			catch(ex) { Cu.reportError(ex); }
		}
		
		// update the NavBar, so its items are distributed correctly
		if(gNavBar.overflowable) {
			gNavBar.overflowable._onResize();
			gNavBar.overflowable._lazyResizeHandler.finalize().then(function() {
				gNavBar.overflowable._lazyResizeHandler = null;
				dispatch(slimChromeContainer, { type: 'FinishedSlimChromeWidth', cancelable: false });
			});
		}
		else {
			dispatch(slimChromeContainer, { type: 'FinishedSlimChromeWidth', cancelable: false });
		}
	}
};

// in case the width doesn't change, we need to make sure transitioning from mini mode to full mode doesn't hide the chrome when mousing out
this.ensureSlimChromeFinishedWidth = function() {
	if(trueAttribute(slimChromeContainer, 'fullWidth')) { return; }
	
	dispatch(slimChromeContainer, { type: 'EnsureSlimChrome', cancelable: false });
	
	if(slimAnimation == 'none' || lastSlimChromeStyle.width <= MIN_WIDTH) {
		slimChromeFinishedWidth();
	} else {
		// for the extremelly rare cases where neither the above condition is true or when the animation doesn't need to take place (e.g. extremelly well placed clicks)
		Timers.init('ensureSlimChromeFinishedWidth', slimChromeFinishedWidth, 400);
	}
};

this.ensureSlimChromeFinishedOpacity = function() {
	if(slimAnimation == 'none') {
		slimChromeFinishedOpacity();
	}
};

this.slimChromeFinishedOpacity = function() {
	var visible = trueAttribute(slimChromeContainer, 'hover') || trueAttribute(slimChromeContainer, 'mini');
	toggleAttribute(slimChromeContainer, 'noPointerEvents', !visible);
	toggleAttribute(gNavToolbox, 'slimChromeVisible', visible);
};

this.slimChromeOnLocationChange = function(m) {
	m.target._currentHost = m.data.host;
	m.target._currentSpec = m.data.spec;
	
	if(m.target == gBrowser.mCurrentBrowser) {
		slimChromeOnTabSelect();
	}
};

this.slimChromeOnTabSelect = function(e) {
	if(Prefs.includeNavBar // if the nav bar isn't in our container, all this is useless
	&& (	(Prefs.miniOnChangeLocation && gBrowser.mCurrentBrowser._lastHost != gBrowser.mCurrentBrowser._currentHost) // only if miniOnChangeLocation and the webhost has changed
		|| (e && Prefs.miniOnTabSelect) ) // or when supposed to show on every tab select (and this is actually a TabSelect event)
	&& !focusPasswords() // focusPasswords will always show mini if a password field is focused
	&& (typeof(blockedPopup) == 'undefined' || !blockedPopup) // mini is already shown if a popup is blocking it open; we shouldn't close it here in a bit either
	&& !trueAttribute(slimChromeContainer, 'hover') // also no point in showing mini if chrome is already shown
	&& !gBrowser.selectedTab.pinned // and if it's not a pinned tab
	&& window.XULBrowserWindow.inContentWhitelist.indexOf(gBrowser.mCurrentBrowser._currentSpec) == -1 // and if the current address is not whitelisted
	) {
		setMini(true);
		Timers.init('setMini', hideMiniInABit, 2000);
		gBrowser.mCurrentBrowser._lastHost = gBrowser.mCurrentBrowser._currentHost;
		return true;
	}
	
	gBrowser.mCurrentBrowser._lastHost = gBrowser.mCurrentBrowser._currentHost;
	return false;
};

this.hideMiniInABit = function() {
	if(!Prefs.includeNavBar) { return; }
	
	// don't hide mini if we're hovering it
	if(slimChromeContainer.hoversQueued > 0 && !trueAttribute(slimChromeContainer, 'hover')) {
		Timers.init('setMini', hideMiniInABit, 1000);
		return;
	};
	
	setMini(false);
};

this.slimChromeKeydown = function(e) {
	if(!e.repeat) { return; } // only trigger this on keydown if user keeps the key pressed down
	slimChromeKeyup(e);
};

this.slimChromeKeyup = function(e) {
	if(e.ctrlKey || e.altKey || e.metaKey // don't trigger for modkeys or any keyboard shortcuts
	|| slimChromeContainer.hovers == 0 // don't bother of course...
	|| initialShowings.length > 0 // the chrome is showing automatically, so make sure it finishes first
	|| (typeof(holdPopupNodes) != 'undefined' && holdPopupNodes.length > 0) // don't trigger from keystrokes when there's a popup open
	|| isAncestor(document.commandDispatcher.focusedElement, slimChromeContainer) // make sure the top chrome isn't focused
	) {
		return;
	}
	
	setHover(false, true);
	
	// don't let it keep re-showing if the mouse is over it
	toggleAttribute(slimChromeContainer, 'noPointerEvents', !trueAttribute(slimChromeContainer, 'mini') && slimChromeContainer.hovers == 0);
};

this.slimChromeEsc = function(e) {
	// we're only interested in the esc key in the location bar and the search bar when in our chrome container
	if(!e.target
	|| e.keyCode != e.DOM_VK_ESCAPE
	|| (e.target.nodeName != 'textbox' && e.target.nodeName != 'searchbar')
	|| !isAncestor(e.target, slimChromeContainer)
	|| e.defaultPrevented) {
		return;
	}
	
	// if esc will do something in the urlbar, let it do its thing
	if(e.target == gURLBar) {
		if(gURLBar.valueIsTyped || (gURLBar.popup && gURLBar.popup.state == 'open')) { return; }
		
		// we need the "original" value so we can compare with the current value,
		// we can only do this by mimicking what happens in URLBarSetURI()
		var uri = gBrowser.currentURI;
		// Strip off "wyciwyg://" and passwords for the location bar
		try { uri = Services.uriFixup.createExposableURI(uri); }
		catch(ex) {}
		
		// Replace initial page URIs with an empty string
		// only if there's no opener (bug 370555).
		// Bug 863515 - Make content.opener checks work in electrolysis.
		if(window.gInitialPages.indexOf(uri.spec) != -1) {
			var value = !window.gMultiProcessBrowser && window.content.opener ? uri.spec : "";
		} else {
			var value = window.losslessDecodeURI(uri);
		}
		
		// we need to check ._value, as .value goes through a whole lot more processing which is unnecessary to check for here
		if(gURLBar._value != value || gURLBar.mController.handleEscape()) { return; }
	}
	
	// let it also close the search bar's suggestions popup before we hide the chrome
	if(e.target == gSearchBar && $('PopupAutoComplete').state == 'open') { return; }
	
	// .blur() doesn't work so...
	if(window.focusNextFrame) {
		window.focusNextFrame(e);
	} else if(window.content) {
		window.content.focus();
	} else {
		gBrowser.mCurrentBrowser.focus();
	}
	
	setHover(false, true);
	e.preventDefault();
	e.stopPropagation();
	
	// don't let it keep re-showing if the mouse is over it
	toggleAttribute(slimChromeContainer, 'noPointerEvents', !trueAttribute(slimChromeContainer, 'mini') && slimChromeContainer.hovers == 0);
};

this.initialShowings = [];
this.initialShowChrome = function(delay) {
	setHover(true);
	
	// Taking this from TPP, making the same assumptions.
	// don't use Timers, because if we use multiple initialShowChrome()'s it could get stuck open
	// we keep a reference to the timer, because otherwise sometimes it would not trigger (go figure...), hopefully this helps with that
	var thisShowing = aSync(function() {
		if(typeof(setHover) != 'undefined') {
			for(var i=0; i<initialShowings.length; i++) {
				if(initialShowings[i] == thisShowing) {
					initialShowings.splice(i, 1);
					break;
				}
			}
			
			setHover(false);
		}
	}, delay || 3000);
	initialShowings.push(thisShowing);
};

this.initialLoading = true;
this.slimChromeCUIListener = {
	onWidgetAfterDOMChange: function(aNode, aNextNode, aContainer, aWasRemoval) {
		if(!initialLoading && isAncestor(aContainer, slimChromeToolbars) && !trueAttribute(slimChromeContainer, 'hover')) {
			var toolbar = aContainer;
			while(toolbar.nodeName != 'toolbar' && toolbar.parentNode) {
				toolbar = toolbar.parentNode;
			}
			if(!toolbar.collapsed) {
				initialShowChrome();
			}
		}
	}
};

this.slimChromeChildListener = {
	observer: null,
		
	handler: function(mutations) {
		for(var m of mutations) {
			if(m.addedNodes) {
				for(var n of m.addedNodes) {
					if(slimChromeExceptions.indexOf(n.id) > -1) { continue; }
					if(n.nodeName != 'toolbar') { continue; }
					
					var prevSibling = n.previousSibling;
					while(prevSibling) {
						if(prevSibling == customToolbars) {
							slimChromeToolbars.appendChild(n);
							if(gNavToolbox.externalToolbars.indexOf(n) == -1) {
								gNavToolbox.externalToolbars.push(n);
							}
							break;
						}
						prevSibling = prevSibling.previousSibling;
					}
				}
			}
		}
	}
};

this.setSlimChromeTabDropIndicatorWatcher = function() {
	Watchers.addAttributeWatcher(tabDropIndicator, 'collapsed', slimChromeTabDropIndicatorWatcher, false, false);
};

this.slimChromeTabDropIndicatorWatcher = function() {
	toggleAttribute(gNavToolbox, 'dropIndicatorFix', !tabDropIndicator.collapsed);
};

this.getParentWithId = function(node) {
	while(node && !node.id) {
		node = node.parentNode;
	}
	return node;
};

this.slimChromeUseMouse = function() {
	if(Prefs.useMouse) {
		// keep the toolbox when hovering it
		Listeners.add(gNavToolbox, 'dragstart', onDragStart);
		Listeners.add(gNavToolbox, 'dragenter', onDragEnter);
		Listeners.add(gNavToolbox, 'mouseover', onMouseOverToolbox);
		Listeners.add(gNavToolbox, 'mouseout', onMouseOutToolbox);
		
		// the empty area of the tabs toolbar doesn't respond to mouse events, so we need to use mouseout from the browser-panel instead
		Listeners.add(browserPanel, 'mouseout', onMouseOutBrowser);
	} else {
		Listeners.remove(gNavToolbox, 'dragstart', onDragStart);
		Listeners.remove(gNavToolbox, 'dragenter', onDragEnter);
		Listeners.remove(gNavToolbox, 'mouseover', onMouseOverToolbox);
		Listeners.remove(gNavToolbox, 'mouseout', onMouseOutToolbox);
		Listeners.remove(browserPanel, 'mouseout', onMouseOutBrowser);
	}
};

this.slimChromeIncludeNavBar = function(unload) {
	if(unload !== true) { unload = false; }
	
	if(!unload && Prefs.includeNavBar && !isAncestor(gNavBar, slimChromeContainer)) {
		slimChromeToolbars.insertBefore(gNavBar, slimChromeToolbars.firstChild);
		
		// the nav-bar really shouldn't over- or underflow when it's hidden, as it doesn't have its real width
		slimChromeInitOverflowable(gNavBar);
	}
	else if((unload || !Prefs.includeNavBar) && isAncestor(gNavBar, slimChromeContainer)) {
		slimChromeDeinitOverflowable(gNavBar);
		
		// don't trigger a re-register of this toolbar node with CUI when it's not needed
		if(window.closed || window.willClose) {
			Overlays.safeMoveToolbar(gNavBar, gNavToolbox, slimChromeSlimmer || customToolbars);
		} else {
			gNavToolbox.insertBefore(gNavBar, slimChromeSlimmer || customToolbars);
		}
	}
	
	hideIt(slimChromeSlimmer, Prefs.includeNavBar);
};

this.slimChromeInitOverflowable = function(toolbar) {
	if(!toolbar.overflowable) { return; }
	
	Piggyback.add('slimChrome', toolbar.overflowable, '_onLazyResize', function() {
		return trueAttribute(slimChromeContainer, 'fullWidth');
	}, Piggyback.MODE_BEFORE);
	Piggyback.add('slimChrome', toolbar.overflowable, 'onOverflow', function() {
		return trueAttribute(slimChromeContainer, 'fullWidth');
	}, Piggyback.MODE_BEFORE);
	Piggyback.add('slimChrome', toolbar.overflowable, '_moveItemsBackToTheirOrigin', function() {
		return trueAttribute(slimChromeContainer, 'fullWidth');
	}, Piggyback.MODE_BEFORE);
	
	if(toolbar.overflowable._lazyResizeHandler) {
		toolbar.overflowable._lazyResizeHandler.disarm();
		toolbar.overflowable._lazyResizeHandler = null;
	}
};

this.slimChromeDeinitOverflowable = function(toolbar) {
	if(!toolbar.overflowable) { return; }
	
	Piggyback.revert('slimChrome', toolbar.overflowable, '_onLazyResize');
	Piggyback.revert('slimChrome', toolbar.overflowable, 'onOverflow');
	Piggyback.revert('slimChrome', toolbar.overflowable, '_moveItemsBackToTheirOrigin');
	
	if(toolbar.overflowable._lazyResizeHandler) {
		toolbar.overflowable._lazyResizeHandler.disarm();
		toolbar.overflowable._lazyResizeHandler = null;
	}
};

this.slimChromeAnimation = function() {
	setAttribute(gNavToolbox, 'slimAnimation', slimAnimation);
};

// make sure the currently focused element stays focused after initializing
this._focusedElement = null;
this.refocusElement = function() {
	// do async because sometimes it wouldn't resize the chrome properly, so let it animate everything as it normally would
	aSync(function() {
		if(_focusedElement && !isAncestor(document.commandDispatcher.focusedElement, _focusedElement) && isAncestor(_focusedElement, slimChromeContainer)) {
			_focusedElement.focus();
			
			// sometimes it won't focus the location bar during startup, so just keep trying until it does
			if(!isAncestor(document.commandDispatcher.focusedElement, _focusedElement)) {
				refocusElement();
				return;
			}
			
			_focusedElement = null;
		}
	}, 50);
};

this.loadSlimChrome = function() {
	// we get only a node with an id so that for example if the location bar is focused (most common case), we don't get its anonymous nodes that get destroyed in this process.
	_focusedElement = getParentWithId(document.commandDispatcher.focusedElement);
	
	slimChromeContainer.hovers = 0;
	slimChromeContainer.hoversQueued = 0;
	
	// prepare PlacesToolbar methods to work in our chrome in case it's there,
	// we don't want it to over/underflow while the bar isn't maximized because that's not its real width.
	// Can't use Piggyback here, it won't work (for some reason...): https://github.com/Quicksaver/The-Fox--Only-Better/issues/83
	window.PlacesToolbar.prototype.__onOverflow = window.PlacesToolbar.prototype._onOverflow;
	window.PlacesToolbar.prototype.__onUnderflow = window.PlacesToolbar.prototype._onUnderflow;
	window.PlacesToolbar.prototype._onOverflow = function() {
		if(typeof(slimChromeContainer) != 'undefined' && isAncestor(PlacesToolbar, slimChromeContainer) && !trueAttribute(slimChromeContainer, 'fullWidth')) { return; }
		this.__onOverflow();
	};
	window.PlacesToolbar.prototype._onUnderflow = function() {
		if(typeof(slimChromeContainer) != 'undefined' && isAncestor(PlacesToolbar, slimChromeContainer) && !trueAttribute(slimChromeContainer, 'fullWidth')) { return; }
		this.__onUnderflow();
	};
	
	if(PlacesToolbar && PlacesToolbar._placesView) {
		PlacesToolbar._placesView.uninit();
	}
	
	// should we append the nav-bar?
	Prefs.listen('includeNavBar', slimChromeIncludeNavBar);
	slimChromeIncludeNavBar();
	
	// also append all other custom toolbars
	var toolbar = customToolbars;
	while(toolbar.nextSibling) {
		toolbar = toolbar.nextSibling;
		if(slimChromeExceptions.indexOf(toolbar.id) > -1) { continue; }
		if(toolbar.nodeName != 'toolbar') { continue; }
		
		var toMove = toolbar;
		toolbar = toolbar.previousSibling;
		slimChromeToolbars.appendChild(toMove);
		
		slimChromeInitOverflowable(toMove);
		
		if(gNavToolbox.externalToolbars.indexOf(toMove) == -1) {
			gNavToolbox.externalToolbars.push(toMove);
		}
	}
	
	// re-initialized the Places Toolbar
	PlacesToolbarHelper.init();
	
	// make sure the urlbar keeps its value
	window.URLBarSetURI();
	
	// should the toolbars react to mouse events
	Prefs.listen('useMouse', slimChromeUseMouse);
	slimChromeUseMouse();
	
	// position the top chrome correctly when the window is resized or a toolbar is shown/hidden
	Listeners.add(window, 'resize', delayMoveSlimChrome);
	
	// make sure the chrome position is updated when toggling the sidebar
	Watchers.addAttributeWatcher($('sidebar-box'), 'hidden', moveOnSidebar, false, false);
	Watchers.addAttributeWatcher($('sidebar-box'), 'collapsed', moveOnSidebar, false, false);
	
	// also keep the toolbox visible if it has focus of course
	Listeners.add(gNavToolbox, 'focus', onFocus, true);
	Listeners.add(gNavToolbox, 'blur', onMouseOut, true);
	
	// show mini when the current tab changes host
	Messenger.listenWindow(window, 'locationChange', slimChromeOnLocationChange);
	
	// show mini chrome when focusing password fields
	Messenger.listenWindow(window, 'focusPasswords', contentFocusPasswords);
	Listeners.add(gBrowser.tabContainer, 'TabSelect', slimChromeOnTabSelect);
	
	// hide chrome when typing in content
	Listeners.add(gBrowser, 'keydown', slimChromeKeydown, true);
	Listeners.add(gBrowser, 'keyup', slimChromeKeyup, true);
	
	// hide chrome when hitting esc key in the location bar or search bar,
	// can't set the listener directly on the target node because the search bar may not exist yet when the document is created (depends on its placement),
	// also other add-ons can add textboxes, and in theory we want the same behavior with them as well.
	Listeners.add(window, 'keydown', slimChromeEsc, true);
	
	// re-do widgets positions after resizing
	Listeners.add(slimChromeContainer, 'transitionend', slimChromeTransitioned);
	
	// make the drop indicator visible on windows with aero enabled;
	// the indicator comes from the binding, and if for some reason it's removed/re-applied, we would lose this watcher, so we need to make sure it stays
	if(WINNT) {
		Listeners.add(TabsToolbar, 'dragenter', setSlimChromeTabDropIndicatorWatcher);
	}
	
	// follow changes to chrome toolbars, in case they're in our box and it should be shown
	CustomizableUI.addListener(slimChromeCUIListener);
	
	// make sure we move any toolbars are added after slimChrome is enabled
	slimChromeChildListener.observer = new window.MutationObserver(slimChromeChildListener.handler);
	slimChromeChildListener.observer.observe(gNavToolbox, { childList: true });
	
	// set the animation style
	Prefs.listen('slimAnimation', slimChromeAnimation);
	slimChromeAnimation();
	
	// no point in showing on customization changes if it's still finishing initializing, there's a lot of these events here
	// 5 second should be enough
	Timers.init('waitCUI', function() {
		initialLoading = false;
	}, 5000);
	
	refocusElement();
	
	dispatch(slimChromeContainer, { type: 'LoadedSlimChrome', cancelable: false });
	
	moveSlimChrome();
};

this.unloadSlimChrome = function() {
	// kill all the timers first, so they don't cause any (harmless) messages in the console
	Timers.cancel('waitCUI');
	Timers.cancel('setHover');
	Timers.cancel('setMini');
	Timers.cancel('onlyURLBar');
	Timers.cancel('contentAreaMouseMoved');
	Timers.cancel('delayMoveSlimChrome');
	Timers.cancel('ensureSlimChromeFinishedWidth');
	
	dispatch(slimChromeContainer, { type: 'UnloadingSlimChrome', cancelable: false });
	
	var focused = isAncestor(document.commandDispatcher.focusedElement, slimChromeContainer) && getParentWithId(document.commandDispatcher.focusedElement);
	
	Listeners.remove(window, 'resize', delayMoveSlimChrome);
	Watchers.removeAttributeWatcher($('sidebar-box'), 'hidden', moveOnSidebar, false, false);
	Watchers.removeAttributeWatcher($('sidebar-box'), 'collapsed', moveOnSidebar, false, false);
	Listeners.remove(browserPanel, 'mouseout', onMouseOutBrowser);
	Listeners.remove(browserPanel, 'mouseover', onMouseReEnterBrowser);
	Listeners.remove(gNavToolbox, 'dragstart', onDragStart);
	Listeners.remove(gNavToolbox, 'dragenter', onDragEnter);
	Listeners.remove(gNavToolbox, 'mouseover', onMouseOverToolbox);
	Listeners.remove(gNavToolbox, 'mouseout', onMouseOutToolbox);
	Listeners.remove(gBrowser, "dragenter", onDragExitAll);
	Listeners.remove(window, "drop", onDragExitAll);
	Listeners.remove(window, "dragend", onDragExitAll);
	Listeners.remove(gNavToolbox, 'focus', onFocus, true);
	Listeners.remove(gNavToolbox, 'blur', onMouseOut, true);
	Listeners.remove(gBrowser, 'keydown', slimChromeKeydown, true);
	Listeners.remove(gBrowser, 'keyup', slimChromeKeyup, true);
	Listeners.remove(window, 'keydown', slimChromeEsc, true);
	Listeners.remove(slimChromeContainer, 'transitionend', slimChromeTransitioned);
	Listeners.remove(TabsToolbar, 'dragenter', setSlimChromeTabDropIndicatorWatcher);
	Listeners.remove(contentArea, 'mousemove', contentAreaOnMouseMove);
	Listeners.remove(gBrowser.tabContainer, 'TabSelect', slimChromeOnTabSelect);
	Messenger.unlistenWindow(window, 'locationChange', slimChromeOnLocationChange);
	Messenger.unlistenWindow(window, 'focusPasswords', contentFocusPasswords);
	CustomizableUI.removeListener(slimChromeCUIListener);
	slimChromeChildListener.observer.disconnect();
	
	Prefs.unlisten('useMouse', slimChromeUseMouse);
	Prefs.unlisten('slimAnimation', slimChromeAnimation);
	
	initialLoading = true;
	
	removeAttribute(gNavToolbox, 'slimAnimation');
	removeAttribute(gNavToolbox, 'dropIndicatorFix');
	Watchers.removeAttributeWatcher(tabDropIndicator, 'collapsed', slimChromeTabDropIndicatorWatcher, false, false);
	
	// reset this before we move the toolbar
	window.PlacesToolbar.prototype._onOverflow = window.PlacesToolbar.prototype.__onOverflow;
	window.PlacesToolbar.prototype._onUnderflow = window.PlacesToolbar.prototype.__onUnderflow;
	delete window.PlacesToolbar.prototype.__onOverflow;
	delete window.PlacesToolbar.prototype.__onUnderflow;
	
	if(PlacesToolbar && PlacesToolbar._placesView) {
		PlacesToolbar._placesView.uninit();
	}
	
	Prefs.unlisten('includeNavBar', slimChromeIncludeNavBar);
	slimChromeIncludeNavBar(true);
	
	while(slimChromeToolbars.firstChild) {
		var e = gNavToolbox.externalToolbars.indexOf(slimChromeToolbars.firstChild);
		if(e != -1) {
			gNavToolbox.externalToolbars.splice(e, 1);
		}
		
		slimChromeDeinitOverflowable(slimChromeToolbars.firstChild);
		
		// don't trigger a re-register of this toolbar node with CUI when it's not needed
		if(window.closed || window.willClose) {
			Overlays.safeMoveToolbar(slimChromeToolbars.firstChild, gNavToolbox);
		} else {
			gNavToolbox.appendChild(slimChromeToolbars.firstChild);
		}
	}
	
	PlacesToolbarHelper.init();
	window.URLBarSetURI();
	
	if(focused && !isAncestor(document.commandDispatcher.focusedElement, focused)) {
		focused.focus();
	}
};

this.toggleSkyLights = function() {
	Modules.loadIf('skyLights', Prefs.skyLights && Prefs.includeNavBar);
};

Modules.LOADMODULE = function() {
	Messenger.loadInWindow(window, 'slimChrome');
	
	Overlays.overlayWindow(window, 'slimChrome', null, loadSlimChrome, unloadSlimChrome);
	
	Prefs.listen('skyLights', toggleSkyLights);
	Prefs.listen('includeNavBar', toggleSkyLights);
	
	Modules.load('slimStyle');
	toggleSkyLights();
};

Modules.UNLOADMODULE = function() {
	Prefs.unlisten('skyLights', toggleSkyLights);
	Prefs.unlisten('includeNavBar', toggleSkyLights);
	
	Modules.unload('skyLights');
	Modules.unload('slimStyle');
	
	Styles.unload('personaSlimChrome_'+_UUID);
	Overlays.removeOverlayWindow(window, 'slimChrome');
	
	// send this here so the nodes don't exist anymore when handling the event
	dispatch(gNavToolbox, { type: 'UnloadedSlimChrome', cancelable: false });
	
	for(var b=0; b<gBrowser.browsers.length; b++) {
		var aBrowser = gBrowser.getBrowserAtIndex(b);
		delete aBrowser._showMiniBar;
		delete aBrowser._currentHost;
		delete aBrowser._currentSpec;
		delete aBrowser._lastHost;
	}
	
	Messenger.unloadFromWindow(window, 'slimChrome');
};
