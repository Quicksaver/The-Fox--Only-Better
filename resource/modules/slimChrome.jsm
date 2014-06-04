moduleAid.VERSION = '1.4.5';

this.__defineGetter__('slimChromeSlimmer', function() { return $(objName+'-slimChrome-slimmer'); });
this.__defineGetter__('slimChromeContainer', function() { return $(objName+'-slimChrome-container'); });
this.__defineGetter__('slimChromeToolbars', function() { return $(objName+'-slimChrome-toolbars'); });

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
this.getComputedStyle = function(el) { return window.getComputedStyle(el); };

// until I find a better way of finding out on which side of the browser is the scrollbar, I'm setting equal margins
this.MIN_LEFT = 22;
this.MIN_RIGHT = 22;
this.MIN_WIDTH = 550;

this.moveSlimChromeStyle = {};
this.lastSlimChromeStyle = null;

this.delayMoveSlimChrome = function() {
	timerAid.init('delayMoveSlimChrome', moveSlimChrome, 0);
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
	if($('TabsToolbar') && !$('TabsToolbar').collapsed) {
		// This is also needed when the tabs are on the left, the width of the findbar doesn't follow with the rest of the window for some reason
		if($('TabsToolbar').getAttribute('treestyletab-tabbar-position') == 'left' || $('TabsToolbar').getAttribute('treestyletab-tabbar-position') == 'right') {
			var TabsToolbar = $('TabsToolbar');
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
	
	moveSlimChromeStyle.width = Math.max(moveSlimChromeStyle.width, 100);
	
	if(!shouldReMoveSlimChrome(moveSlimChromeStyle)) { return; }
	
	lastSlimChromeStyle = moveSlimChromeStyle;
	
	// Unload current stylesheet if it's been loaded
	styleAid.unload('slimChromeMove_'+_UUID);
	
	var sscode = '/*The Fox, Only Better CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #theFoxOnlyBetter-slimChrome-container {\n';
	sscode += '		left: ' + moveSlimChromeStyle.left + 'px;\n';
	sscode += '		width: ' + moveSlimChromeStyle.width + 'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #theFoxOnlyBetter-slimChrome-container:not([hover]) {\n';
	sscode += '		width: ' + Math.min(moveSlimChromeStyle.width, MIN_WIDTH) + 'px;\n';
	sscode += '	}\n';
	sscode += '}';
	
	styleAid.load('slimChromeMove_'+_UUID, sscode, true);
	
	findPersonaPosition();
	
	dispatch(slimChromeContainer, { type: 'MovedSlimChrome', cancelable: false });
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
	
	// we also only need to show if the mouse is hovering the toolbox, leaving the window doesn't count
	if(e.screenY < gNavToolbox.boxObject.screenY
	|| e.screenY > (gNavToolbox.boxObject.screenY +gNavToolbox.boxObject.height)
	|| e.screenX < gNavToolbox.boxObject.screenX
	|| e.screenY > (gNavToolbox.boxObject.screenX +gNavToolbox.boxObject.width)) { return; }
	
	onMouseOver();
	
	// don't keep listening to mouseout, otherwise the toolbox would get stuck open
	listenerAid.remove(browserPanel, 'mouseout', onMouseOutBrowser);
	listenerAid.add(browserPanel, 'mouseover', onMouseReEnterBrowser);
};

this.onMouseReEnterBrowser = function(e) {
	// no need to check for target here, if we're entering something, there's always "something" to enter, so the other handlers can take care of it
	onMouseOut();
	
	// stop this listener, or the toolbox would be stuck close otherwise, and start listening for mouseout again
	listenerAid.remove(browserPanel, 'mouseover', onMouseReEnterBrowser);
	listenerAid.add(browserPanel, 'mouseout', onMouseOutBrowser);
};

this.isMenuBarPopup = function(node) {
	// we don't want the chrome to show or hide when hovering the menu popups from the menu bar
	var toolbars = [MenuBar, TabsToolbar];
	for(var t=0; t<toolbars.length; t++) {
		if(isAncestor(node, toolbars[t])) {
			var parent = node;
			while(parent) {
				if(parent == toolbars[t]) { break; }
				if(parent.nodeName == 'menupopup') { return true; }
				parent = parent.parentNode;
			}
		}
	}
	
	return false;
};

this.onMouseOverToolbox = function(e) {
	if(isMenuBarPopup(e.target)) { return; }
	
	if(trueAttribute(slimChromeContainer, 'mini') && !trueAttribute(slimChromeContainer, 'hover') && isAncestor(e.target, slimChromeContainer)) {
		slimChromeContainer.hoversQueued++;
		return;
	}
	onMouseOver(e);
};

this.onMouseOutToolbox = function(e) {
	if(isMenuBarPopup(e.target)) { return; }
	
	if(trueAttribute(slimChromeContainer, 'mini') && !trueAttribute(slimChromeContainer, 'hover') && isAncestor(e.target, slimChromeContainer)) {
		slimChromeContainer.hoversQueued--;
		return;
	}
	onMouseOut();
};

this.onDragStart = function() {
	listenerAid.remove(gNavToolbox, 'dragenter', onDragEnter);
	listenerAid.add(gBrowser, "dragenter", onDragExitAll);
	listenerAid.add(window, "drop", onDragExitAll);
	listenerAid.add(window, "dragend", onDragExitAll);
};

this.onDragEnter = function() {
	setHover(true);
	onDragStart();
};

this.onDragExit = function() {
	setHover(false);
};

this.onDragExitAll = function() {
	listenerAid.add(gNavToolbox, 'dragenter', onDragEnter);
	listenerAid.remove(gBrowser, "dragenter", onDragExitAll);
	listenerAid.remove(window, "drop", onDragExitAll);
	listenerAid.remove(window, "dragend", onDragExitAll);
	setHover(false);
};

this.setHover = function(hover, now, force) {
	if(hover) {
		slimChromeContainer.hovers++;
		
		if(!now) {
			timerAid.init('setHover', function() {
				hoverTrue();
			}, 75);
		} else {
			timerAid.cancel('setHover');
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
			timerAid.init('setHover', function() {
				removeAttribute(slimChromeContainer, 'fullWidth');
				removeAttribute(slimChromeContainer, 'hover');
				listenerAid.remove(contentArea, 'mousemove', contentAreaOnMouseMove);
				contentAreaMovedReset();
			}, (!now) ? 250 : 0);
		}
	}
};

this.hoverTrue = function() {
	setAttribute(slimChromeContainer, 'hover', 'true');
	ensureSlimChromeFinishedWidth();
	
	// safeguard against the chrome getting stuck sometimes when I can't control it
	contentAreaMovedReset();
	listenerAid.add(contentArea, 'mousemove', contentAreaOnMouseMove);
};

this.contentAreaMouseMoved = false;
this.contentAreaMovedReset = function() {
	timerAid.cancel('contentAreaMouseMoved');
	contentAreaMouseMoved = false;
};

this.contentAreaOnMouseMove = function() {
	// no need to keep doing all the routine on each event and lag the browser, it will happen when it happens
	if(contentAreaMouseMoved) { return; }
	contentAreaMouseMoved = true;
	timerAid.init('contentAreaMouseMoved', function() {
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
		&& (!prefAid.useMouse || !$$('#navigator-toolbox:hover')[0]) // trick to find out if the mouse is hovering the chrome
		) {
			// if we get here, nothing is holding the chrome open, so it's likely that it should be hidden, but wasn't for some reason
			setHover(false, true, 0);
			return;
		}
		
		contentAreaMouseMoved = false;
	}, 500);
};

this.setMini = function(mini) {
	dispatch(slimChromeContainer, { type: 'willSetMiniChrome', cancelable: false, detail: mini });
	
	if(mini) {
		timerAid.cancel('onlyURLBar');
		timerAid.cancel('setMini');
		setAttribute(slimChromeContainer, 'mini', 'true');
		setAttribute(slimChromeContainer, 'onlyURLBar', 'true');
	} else {
		// aSync so the toolbox focus handler knows what it's doing
		timerAid.init('setMini', function() {
			removeAttribute(slimChromeContainer, 'mini');
			
			if(!trueAttribute(slimChromeContainer, 'hover')) {
				// don't hover the chrome if the mini bar is hiding and the mouse happens to be hovering it
				setAttribute(slimChromeContainer, 'noPointerEvents', 'true');
				
				// reset this counter, so the chrome doesn't get stuck the next time it opens
				slimChromeContainer.hoversQueued = 0;
			}
			
			// let chrome hide completely before showing the rest of the UI
			timerAid.init('onlyURLBar', function() {
				removeAttribute(slimChromeContainer, 'onlyURLBar');
			}, 300);
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
	if(typeof(blockedPopup) == 'undefined' || !blockedPopup) {
		setMini(gBrowser.mCurrentBrowser._showMiniBar);
		return gBrowser.mCurrentBrowser._showMiniBar;
	}
	return false;
};

this.findPersonaPosition = function() {
	if(!trueAttribute(document.documentElement, 'lwtheme')) {
		prefAid.lwthemebgImage = '';
		prefAid.lwthemebgWidth = 0;
		prefAid.lwthemecolor = '';
		prefAid.lwthemebgColor = '';
		stylePersonaSlimChrome();
		return;
	}
	
	var windowStyle = getComputedStyle(document.documentElement);
	if(prefAid.lwthemebgImage != windowStyle.getPropertyValue('background-image') && windowStyle.getPropertyValue('background-image') != 'none') {
		prefAid.lwthemebgImage = windowStyle.getPropertyValue('background-image');
		prefAid.lwthemecolor = windowStyle.getPropertyValue('color');
		prefAid.lwthemebgColor = windowStyle.getPropertyValue('background-color');
		prefAid.lwthemebgWidth = 0;
		
		lwthemeImage = new window.Image();
		lwthemeImage.onload = function() { findPersonaWidth(); };
		lwthemeImage.src = prefAid.lwthemebgImage.substr(5, prefAid.lwthemebgImage.length - 8);
		return;
	}
	
	stylePersonaSlimChrome();
};

this.findPersonaWidth = function() {
	if(prefAid.lwthemebgWidth == 0 && lwthemeImage.naturalWidth != 0) {
		prefAid.lwthemebgWidth = lwthemeImage.naturalWidth;
	}
	
	if(prefAid.lwthemebgWidth != 0) {
		stylePersonaSlimChrome();
	}
};

this.stylePersonaSlimChrome = function() {
	// Unload current stylesheet if it's been loaded
	styleAid.unload('personaSlimChrome_'+_UUID);
	
	if(prefAid.lwthemebgImage != '') {
		var windowStyle = getComputedStyle(document.documentElement);
		var containerBox = slimChromeContainer.getBoundingClientRect();
		var containerStyle = getComputedStyle(slimChromeContainer);
		
		// Another personas in OSX tweak
		var offsetWindowPadding = windowStyle.getPropertyValue('background-position');
		var offsetPersonaY = -containerBox.top;
		offsetPersonaY += parseInt(containerStyle.getPropertyValue('margin-top'));
		if(offsetWindowPadding.indexOf(' ') > -1 && offsetWindowPadding.indexOf('px', offsetWindowPadding.indexOf(' ') +1) > -1) {
			var offset = parseInt(offsetWindowPadding.substr(offsetWindowPadding.indexOf(' ') +1, offsetWindowPadding.indexOf('px', offsetWindowPadding.indexOf(' ') +1)));
			offsetPersonaY += offset;
		}
		
		if(containerStyle.getPropertyValue('direction') == 'ltr') {
			var borderStart = parseInt(containerStyle.getPropertyValue('border-left-width'));
		} else {
			var borderStart = parseInt(containerStyle.getPropertyValue('border-right-width'));
		}
		
		var offsetPersonaX = -lastSlimChromeStyle.left -(prefAid.lwthemebgWidth - document.documentElement.clientWidth) -borderStart;
		
		var sscode = '/*The Fox, only better CSS declarations of variable values*/\n';
		sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
		sscode += '@-moz-document url("'+document.baseURI+'") {\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #theFoxOnlyBetter-slimChrome-container {\n';
		sscode += '	  background-image: ' + prefAid.lwthemebgImage + ' !important;\n';
		sscode += '	  background-color: ' + prefAid.lwthemebgColor + ' !important;\n';
		sscode += '	  color: ' + prefAid.lwthemecolor + ' !important;\n';
		sscode += '	  background-position: left '+offsetPersonaX+'px top '+offsetPersonaY+'px !important;\n';
		sscode += '	  background-repeat: repeat !important;\n';
		sscode += '	  background-size: auto auto !important;\n';
		sscode += '	}\n';
		sscode += '}';
		
		styleAid.load('personaSlimChrome_'+_UUID, sscode, true);
	}
};

this.slimChromeTransitioned = function(e) {
	if(e.target != slimChromeContainer) { return; }
	
	switch(e.propertyName) {
		case 'width':
			slimChromeFinishedWidth();
			break;
		
		case 'opacity':
			toggleAttribute(slimChromeContainer, 'noPointerEvents', !trueAttribute(slimChromeContainer, 'mini') && !trueAttribute(slimChromeContainer, 'hover'));
			break;
		
		default: break;
	}
};

this.slimChromeFinishedWidth = function() {
	timerAid.cancel('ensureSlimChromeFinishedWidth');
	
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
		
		// update the NavBar, so its items are distributed correclty
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
	
	if(lastSlimChromeStyle.width <= MIN_WIDTH) {
		slimChromeFinishedWidth();
	} else {
		// for the extremelly rare cases where neither the above condition is true or when the animation doesn't need to take place (e.g. extremelly well placed clicks)
		timerAid.init('ensureSlimChromeFinishedWidth', slimChromeFinishedWidth, 400);
	}
};

this.slimChromeOnLocationChange = function(m) {
	m.target._currentHost = m.data.host;
	m.target._currentSpec = m.data.spec;
	
	if(m.target == gBrowser.mCurrentBrowser) {
		slimChromeOnTabSelect.handler();
	}
};

this.slimChromeOnTabSelect = {
	last: null,
	
	handler: function() {
		if(!focusPasswords() // focusPasswords will always show mini if a password field is focused
		&& (typeof(blockedPopup) == 'undefined' || !blockedPopup) // mini is already shown if a popup is blocking it open; we shouldn't close it here in a bit either
		&& !trueAttribute(slimChromeContainer, 'hover') // also no point in showing mini if chrome is already shown
		&& slimChromeOnTabSelect.last != gBrowser.mCurrentBrowser._currentHost // only show mini when the webhost has changed
		&& !gBrowser.selectedTab.pinned // and if it's not a pinned tab
		&& window.XULBrowserWindow.inContentWhitelist.indexOf(gBrowser.mCurrentBrowser._currentSpec) == -1 // and if the current address is not whitelisted
		) {
			setMini(true);
			timerAid.init('setMini', hideMiniInABit, 2000);
			slimChromeOnTabSelect.last = gBrowser.mCurrentBrowser._currentHost;
			return true;
		}
		
		slimChromeOnTabSelect.last = gBrowser.mCurrentBrowser._currentHost;
		return false;
	}
};

this.hideMiniInABit = function() {
	// don't hide mini if we're hovering it
	if(slimChromeContainer.hoversQueued > 0 && !trueAttribute(slimChromeContainer, 'hover')) {
		timerAid.init('setMini', hideMiniInABit, 1000);
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
	// don't use timerAid, because if we use multiple initialShowChrome()'s it could get stuck open
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
	objectWatcher.addAttributeWatcher(tabDropIndicator, 'collapsed', slimChromeTabDropIndicatorWatcher, false, false);
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
	if(prefAid.useMouse) {
		// keep the toolbox when hovering it
		listenerAid.add(gNavToolbox, 'dragstart', onDragStart);
		listenerAid.add(gNavToolbox, 'dragenter', onDragEnter);
		listenerAid.add(gNavToolbox, 'mouseover', onMouseOverToolbox);
		listenerAid.add(gNavToolbox, 'mouseout', onMouseOutToolbox);
		
		// the empty area of the tabs toolbar doesn't respond to mouse events, so we need to use mouseout from the browser-panel instead
		listenerAid.add(browserPanel, 'mouseout', onMouseOutBrowser);
	} else {
		listenerAid.remove(gNavToolbox, 'dragstart', onDragStart);
		listenerAid.remove(gNavToolbox, 'dragenter', onDragEnter);
		listenerAid.remove(gNavToolbox, 'mouseover', onMouseOverToolbox);
		listenerAid.remove(gNavToolbox, 'mouseout', onMouseOutToolbox);
		listenerAid.remove(browserPanel, 'mouseout', onMouseOutBrowser);
	}
};

this.loadSlimChrome = function() {
	// make sure the currently focused element stays focused after this.
	// we get only a node with an id so that for example if the location bar is focused (most common case), we don't get its anonymous nodes that get destroyed in this process.
	var focused = getParentWithId(document.commandDispatcher.focusedElement);
	
	slimChromeContainer.hovers = 0;
	slimChromeContainer.hoversQueued = 0;
	
	// prepare PlacesToolbar methods to work in our chrome in case it's there,
	// we don't want it to over/underflow while the bar isn't maximized because that's not its real width
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
	
	slimChromeToolbars.appendChild(gNavBar);
	
	// the nav-bar really shouldn't over- or underflow when it's hidden, as it doesn't have its real width
	gNavBar.overflowable.__onLazyResize = gNavBar.overflowable._onLazyResize;
	gNavBar.overflowable._onLazyResize = function() {
		if(!trueAttribute(slimChromeContainer, 'hover')) { return; }
		this.__onLazyResize();
	};
	gNavBar.overflowable._onOverflow = gNavBar.overflowable.onOverflow;
	gNavBar.overflowable.onOverflow = function(e) {
		if(!trueAttribute(slimChromeContainer, 'hover')) { return; }
		this._onOverflow(e);
	};
	gNavBar.overflowable.__moveItemsBackToTheirOrigin = gNavBar.overflowable._moveItemsBackToTheirOrigin;
	gNavBar.overflowable._moveItemsBackToTheirOrigin = function(shouldMoveAllItems) {
		if(!trueAttribute(slimChromeContainer, 'hover')) { return; }
		this.__moveItemsBackToTheirOrigin(shouldMoveAllItems);
	};
	if(gNavBar.overflowable._lazyResizeHandler) {
		gNavBar.overflowable._lazyResizeHandler.disarm();
		gNavBar.overflowable._lazyResizeHandler = null;
	}
	
	// also append all other custom toolbars
	var toolbar = customToolbars;
	while(toolbar.nextSibling) {
		toolbar = toolbar.nextSibling;
		if(slimChromeExceptions.indexOf(toolbar.id) > -1) { continue; }
		
		var toMove = toolbar;
		toolbar = toolbar.previousSibling;
		slimChromeToolbars.appendChild(toMove);
		
		if(gNavToolbox.externalToolbars.indexOf(toMove) == -1) {
			gNavToolbox.externalToolbars.push(toMove);
		}
	}
	
	// re-initialized the Places Toolbar
	PlacesToolbarHelper.init();
	
	// make sure the urlbar keeps its value
	window.URLBarSetURI();
	
	// should the toolbars react to mouse events
	prefAid.listen('useMouse', slimChromeUseMouse);
	slimChromeUseMouse();
	
	// position the top chrome correctly when the window is resized or a toolbar is shown/hidden
	listenerAid.add(browserPanel, 'resize', delayMoveSlimChrome);
	
	// also keep the toolbox visible if it has focus of course
	listenerAid.add(gNavToolbox, 'focus', onFocus, true);
	listenerAid.add(gNavToolbox, 'blur', onMouseOut, true);
	
	// show mini when the current tab changes host
	messenger.listenWindow(window, 'locationChange', slimChromeOnLocationChange);
	
	// show mini chrome when focusing password fields
	messenger.listenWindow(window, 'focusPasswords', contentFocusPasswords);
	listenerAid.add(gBrowser.tabContainer, 'TabSelect', slimChromeOnTabSelect.handler);
	
	// hide chrome when typing in content
	listenerAid.add(gBrowser, 'keydown', slimChromeKeydown, true);
	listenerAid.add(gBrowser, 'keyup', slimChromeKeyup, true);
	
	// hide chrome when hitting esc key in the location bar or search bar,
	// can't set the listener directly on the target node because the search bar may not exist yet when the document is created (depends on its placement),
	// also other add-ons can add textboxes, and in theory we want the same behavior with them as well.
	listenerAid.add(window, 'keydown', slimChromeEsc, true);
	
	// re-do widgets positions after resizing
	listenerAid.add(slimChromeContainer, 'transitionend', slimChromeTransitioned);
	
	// support personas in hovering toolbox
	observerAid.add(findPersonaPosition, "lightweight-theme-changed");
	
	// make the drop indicator visible on windows with aero enabled;
	// the indicator comes from the binding, and if for some reason it's removed/re-applied, we would lose this watcher, so we need to make sure it stays
	if(WINNT) {
		listenerAid.add($('TabsToolbar'), 'dragenter', setSlimChromeTabDropIndicatorWatcher);
	}
	
	// follow changes to chrome toolbars, in case they're in our box and it should be shown
	CustomizableUI.addListener(slimChromeCUIListener);
	
	// make sure we move any toolbars are added after slimChrome is enabled
	slimChromeChildListener.observer = new window.MutationObserver(slimChromeChildListener.handler);
	slimChromeChildListener.observer.observe(gNavToolbox, { childList: true });
	
	// no point in showing on customization changes if it's still finishing initializing, there's a lot of these events here
	// 5 second should be enough
	timerAid.init('waitCUI', function() {
		initialLoading = false;
	}, 5000);
	
	// do async because sometimes it wouldn't resize the chrome properly, so let it animate everything as it normally would
	aSync(function() {
		if(focused && !isAncestor(document.commandDispatcher.focusedElement, focused) && isAncestor(focused, slimChromeContainer)) {
			focused.focus();
		}
	});
	
	dispatch(slimChromeContainer, { type: 'LoadedSlimChrome', cancelable: false });
	
	moveSlimChrome();
};

this.unloadSlimChrome = function() {
	// kill all the timers first, so they don't cause any (harmless) messages in the console
	timerAid.cancel('waitCUI');
	timerAid.cancel('setHover');
	timerAid.cancel('setMini');
	timerAid.cancel('onlyURLBar');
	timerAid.cancel('contentAreaMouseMoved');
	timerAid.cancel('delayMoveSlimChrome');
	timerAid.cancel('ensureSlimChromeFinishedWidth');
	
	dispatch(slimChromeContainer, { type: 'UnloadingSlimChrome', cancelable: false });
	
	var focused = isAncestor(document.commandDispatcher.focusedElement, slimChromeContainer) && getParentWithId(document.commandDispatcher.focusedElement);
	
	listenerAid.remove(browserPanel, 'resize', delayMoveSlimChrome);
	listenerAid.remove(browserPanel, 'mouseout', onMouseOutBrowser);
	listenerAid.remove(browserPanel, 'mouseover', onMouseReEnterBrowser);
	listenerAid.remove(gNavToolbox, 'dragstart', onDragStart);
	listenerAid.remove(gNavToolbox, 'dragenter', onDragEnter);
	listenerAid.remove(gNavToolbox, 'mouseover', onMouseOverToolbox);
	listenerAid.remove(gNavToolbox, 'mouseout', onMouseOutToolbox);
	listenerAid.remove(gBrowser, "dragenter", onDragExitAll);
	listenerAid.remove(window, "drop", onDragExitAll);
	listenerAid.remove(window, "dragend", onDragExitAll);
	listenerAid.remove(gNavToolbox, 'focus', onFocus, true);
	listenerAid.remove(gNavToolbox, 'blur', onMouseOut, true);
	listenerAid.remove(gBrowser, 'keydown', slimChromeKeydown, true);
	listenerAid.remove(gBrowser, 'keyup', slimChromeKeyup, true);
	listenerAid.remove(window, 'keydown', slimChromeEsc, true);
	listenerAid.remove(slimChromeContainer, 'transitionend', slimChromeTransitioned);
	listenerAid.remove($('TabsToolbar'), 'dragenter', setSlimChromeTabDropIndicatorWatcher);
	listenerAid.remove(contentArea, 'mousemove', contentAreaOnMouseMove);
	listenerAid.remove(gBrowser.tabContainer, 'TabSelect', slimChromeOnTabSelect.handler);
	messenger.unlistenWindow(window, 'locationChange', slimChromeOnLocationChange);
	messenger.unlistenWindow(window, 'focusPasswords', contentFocusPasswords);
	observerAid.remove(findPersonaPosition, "lightweight-theme-changed");
	CustomizableUI.removeListener(slimChromeCUIListener);
	slimChromeChildListener.observer.disconnect();
	
	prefAid.unlisten('useMouse', slimChromeUseMouse);
	
	initialLoading = true;
	
	removeAttribute(gNavToolbox, 'dropIndicatorFix');
	objectWatcher.removeAttributeWatcher(tabDropIndicator, 'collapsed', slimChromeTabDropIndicatorWatcher, false, false);
	
	// reset this before we move the toolbar
	window.PlacesToolbar.prototype._onOverflow = window.PlacesToolbar.prototype.__onOverflow;
	window.PlacesToolbar.prototype._onUnderflow = window.PlacesToolbar.prototype.__onUnderflow;
	delete window.PlacesToolbar.prototype.__onOverflow;
	delete window.PlacesToolbar.prototype.__onUnderflow;
	
	if(PlacesToolbar && PlacesToolbar._placesView) {
		PlacesToolbar._placesView.uninit();
	}
	
	if(gNavBar.overflowable && gNavBar.overflowable.__onLazyResize) { // when closing windows?
		gNavBar.overflowable._onLazyResize = gNavBar.overflowable.__onLazyResize;
		gNavBar.overflowable.onOverflow = gNavBar.overflowable._onOverflow;
		gNavBar.overflowable._moveItemsBackToTheirOrigin = gNavBar.overflowable.__moveItemsBackToTheirOrigin;
		delete gNavBar.overflowable.__onLazyResize;
		delete gNavBar.overflowable._onOverflow;
		delete gNavBar.overflowable.__moveItemsBackToTheirOrigin;
		if(gNavBar.overflowable._lazyResizeHandler) {
			gNavBar.overflowable._lazyResizeHandler.disarm();
			gNavBar.overflowable._lazyResizeHandler = null;
		}
	}
	
	gNavToolbox.insertBefore(gNavBar, customToolbars);
	
	while(slimChromeToolbars.firstChild) {
		var e = gNavToolbox.externalToolbars.indexOf(slimChromeToolbars.firstChild);
		if(e != -1) {
			gNavToolbox.externalToolbars.splice(e, 1);
		}
		
		gNavToolbox.appendChild(slimChromeToolbars.firstChild);
	}
	
	PlacesToolbarHelper.init();
	window.URLBarSetURI();
	
	if(focused && !isAncestor(document.commandDispatcher.focusedElement, focused)) {
		focused.focus();
	}
};

moduleAid.LOADMODULE = function() {
	messenger.messageWindow(window, 'load', 'slimChrome');
	
	overlayAid.overlayWindow(window, 'slimChrome', null, loadSlimChrome, unloadSlimChrome);
};

moduleAid.UNLOADMODULE = function() {
	styleAid.unload('personaSlimChrome_'+_UUID);
	overlayAid.removeOverlayWindow(window, 'slimChrome');
	
	// send this here so the nodes don't exist anymore when handling the event
	dispatch(gNavToolbox, { type: 'UnloadedSlimChrome', cancelable: false });
	
	for(var b=0; b<gBrowser.browsers.length; b++) {
		var aBrowser = gBrowser.getBrowserAtIndex(b);
		delete aBrowser._showMiniBar;
		delete aBrowser._currentHost;
		delete aBrowser._currentSpec;
	}
	
	messenger.messageWindow(window, 'unload', 'slimChrome');
};
