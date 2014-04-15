moduleAid.VERSION = '1.1.4';

this.__defineGetter__('slimChromeSlimmer', function() { return $(objName+'-slimChrome-slimmer'); });
this.__defineGetter__('slimChromeContainer', function() { return $(objName+'-slimChrome-container'); });
this.__defineGetter__('slimChromeToolbars', function() { return $(objName+'-slimChrome-toolbars'); });

this.__defineGetter__('browserPanel', function() { return $('browser-panel'); });
this.__defineGetter__('customToolbars', function() { return $('customToolbars'); });
this.getComputedStyle = function(el) { return window.getComputedStyle(el); };

// until I find a better way of finding out on which side of the browser is the scrollbar, I'm setting equal margins
this.__defineGetter__('MIN_LEFT', function() { return 22; });
this.__defineGetter__('MIN_RIGHT', function() { return 22; });

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
	
	if(!shouldReMoveSlimChrome(moveSlimChromeStyle)) { return; }
	
	lastSlimChromeStyle = moveSlimChromeStyle;
	
	// Unload current stylesheet if it's been loaded
	styleAid.unload('slimChromeMove_'+_UUID);
	
	var sscode = '/*Navigator Supercharger CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #navigatorSupercharger-slimChrome-container {\n';
	sscode += '		left: ' + moveSlimChromeStyle.left + 'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #navigatorSupercharger-slimChrome-container[hover] {\n';
	sscode += '		width: ' + Math.max(moveSlimChromeStyle.width, 100) + 'px;\n';
	sscode += '	}\n';
	sscode += '}';
	
	styleAid.load('slimChromeMove_'+_UUID, sscode, true);
	
	findPersonaPosition();
};

this.onMouseOver = function() {
	setHover(true);
};

this.onMouseOut = function() {
	setHover(false);
};

this.onMouseOutBrowser = function(e) {
	// bascially this means that when the mouse left something, it entered "nothing", which is what we want to capture here
	if(e.relatedTarget) { return; }
	
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

this.onDragEnter = function() {
	setHover(true, 1);
	listenerAid.remove(slimChromeContainer, 'dragenter', onDragEnter);
	listenerAid.add(gBrowser, "dragenter", onDragExitAll);
	listenerAid.add(window, "drop", onDragExitAll);
	listenerAid.add(window, "dragend", onDragExitAll);
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

this.setHover = function(hover, force) {
	if(hover) {
		slimChromeContainer.hovers++;
		timerAid.init('setHover', function() {
			setAttribute(slimChromeContainer, 'hover', 'true');
		}, 75);
		if(force != undefined && typeof(force) == 'number') {
			slimChromeContainer.hovers = force;
		}
	}
	else {
		if(force != undefined && typeof(force) == 'number') {
			slimChromeContainer.hovers = force;
		} else if(slimChromeContainer.hovers > 0) {
			slimChromeContainer.hovers--;
		}
		if(slimChromeContainer.hovers == 0) {
			removeAttribute(slimChromeContainer, 'fullWidth');
			timerAid.init('setHover', function() {
				removeAttribute(slimChromeContainer, 'hover');
			}, 250);
		}
	}
};

this.setMini = function(mini) {
	if(mini) {
		timerAid.cancel('onlyURLBar');
		setAttribute(slimChromeContainer, 'mini', 'true');
		setAttribute(slimChromeContainer, 'onlyURLBar', 'true');
	} else {
		removeAttribute(slimChromeContainer, 'mini');
		timerAid.init('onlyURLBar', function() {
			removeAttribute(slimChromeContainer, 'onlyURLBar');
		}, 300);
	}
};

this.focusPasswords = function(e) {
	if(e.target
	&& e.target.nodeName
	&& e.target.nodeName.toLowerCase() == 'input'
	&& !e.target.disabled
	&& (prefAid.miniOnAllInput || e.target.type == 'password')) {
		setMini(e.type == 'focus');
	}
};

// Keep chrome visible when opening menus within it
this.holdPopupNode = null;
this.holdPopupMenu = function(e) {
	var trigger = e.originalTarget.triggerNode;
	var hold = false;
	
	// check if the trigger node is present in the addonBar
	if(!hold) {
		hold = isAncestor(trigger, slimChromeContainer);
	}
	
	if(!hold && !trigger) {
		// CUI panel doesn't carry a triggerNode, we have to find it ourselves
		if(e.target.id == 'customizationui-widget-panel') {
			hold_loop: for(var t=0; t<slimChromeToolbars.childNodes.length; t++) {
				if(slimChromeToolbars.childNodes[t].localName != 'toolbar' || !CustomizableUI.getAreaType(slimChromeToolbars.childNodes[t].id)) { continue; }
				
				var widgets = CustomizableUI.getWidgetsInArea(slimChromeToolbars.childNodes[t].id);
				for(var w=0; w<widgets.length; w++) {
					var widget = widgets[w].forWindow(window);
					if(!widget || !widget.node || !widget.node.open) { continue; }
					
					hold = true;
					break hold_loop;
				}
			}
		}
		
		// let's just assume all panels that are children from these toolbars are opening from them
		else if(isAncestor(e.target, slimChromeContainer)) {
			hold = true;
		}
	}
	
	// nothing "native" is opening this popup, so let's see if someone claims it
	if(!hold) {
		trigger = askForOwner(e.target);
		if(trigger && typeof(trigger) == 'string') {
			trigger = $(trigger);
			hold = isAncestor(trigger, slimChromeContainer);
		}
	}
	
	if(hold) {
		// if we're opening the chrome now, the anchor may move, so we need to reposition the popup when it does
		holdPopupNode = e.target;
		if(!trueAttribute(slimChromeContainer, 'hover')) {
			e.target.collapsed = true;
		}
		
		setHover(true);
		var selfRemover = function(ee) {
			if(ee.originalTarget != e.originalTarget) { return; } //submenus
			if(typeof(setHover) != 'undefined') { setHover(false); }
			listenerAid.remove(e.target, 'popuphidden', selfRemover);
			holdPopupNode = null;
		}
		listenerAid.add(e.target, 'popuphidden', selfRemover);
	}
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
		
		var sscode = '/*Navigator Supercharger CSS declarations of variable values*/\n';
		sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
		sscode += '@-moz-document url("'+document.baseURI+'") {\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #navigatorSupercharger-slimChrome-container {\n';
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
	
	if(e.propertyName == 'width') {
		if(gNavBar.overflowable && slimChromeContainer.hovers > 0) {
			// make sure it doesn't get stuck open
			setHover(true, 1);
			setAttribute(slimChromeContainer, 'fullWidth', 'true');
			
			gNavBar.overflowable._onResize();
			gNavBar.overflowable._lazyResizeHandler.finalize().then(function() {
				gNavBar.overflowable._lazyResizeHandler = null;
				if(holdPopupNode) {
					holdPopupNode.moveTo(-1,-1);
					holdPopupNode.collapsed = false;
				}
			});	
		}
	}
};

this.loadSlimChrome = function() {
	slimChromeContainer.hovers = 0;
	
	slimChromeToolbars.appendChild(gNavBar);
	
	// also append all other custom toolbars
	var toolbar = customToolbars;
	while(toolbar.nextSibling) {
		toolbar = toolbar.nextSibling;
		if(toolbar.id == 'addon-bar') { continue; }
		
		var toMove = toolbar;
		toolbar = toolbar.previousSibling;
		slimChromeToolbars.appendChild(toMove);
		
		if(gNavToolbox.externalToolbars.indexOf(toMove) == -1) {
			gNavToolbox.externalToolbars.push(toMove);
		}
	}
	
	// position the top chrome correctly when the window is resized or a toolbar is shown/hidden
	listenerAid.add(browserPanel, 'resize', delayMoveSlimChrome);
	
	// keep the toolbox when hovering it
	listenerAid.add(gNavToolbox, 'dragenter', onDragEnter);
	listenerAid.add(gNavToolbox, 'mouseover', onMouseOver);
	listenerAid.add(gNavToolbox, 'mouseout', onMouseOut);
	
	// the empty area of the tabs toolbar doesn't respond to mouse events, so we need to use mouseout from the browser-panel instead
	listenerAid.add(browserPanel, 'mouseout', onMouseOutBrowser);
	
	// if a menu or a panel is opened from the toolbox, keep it shown
	listenerAid.add(window, 'popupshown', holdPopupMenu);
	
	// also keep the toolbox visible if it has focus of course
	listenerAid.add(gNavToolbox, 'focus', onMouseOver, true);
	listenerAid.add(gNavToolbox, 'blur', onMouseOut, true);
	
	// show mini chrome when focusing password fields
	listenerAid.add(gBrowser, 'focus', focusPasswords, true);
	listenerAid.add(gBrowser, 'blur', focusPasswords, true);
	
	// re-do widgets positions after resizing
	listenerAid.add(slimChromeContainer, 'transitionend', slimChromeTransitioned);
	
	// support personas in hovering toolbox
	observerAid.add(findPersonaPosition, "lightweight-theme-changed");
	
	moveSlimChrome();
};

this.unloadSlimChrome = function() {
	listenerAid.remove(browserPanel, 'resize', delayMoveSlimChrome);
	listenerAid.remove(browserPanel, 'mouseout', onMouseOutBrowser);
	listenerAid.remove(browserPanel, 'mouseover', onMouseReEnterBrowser);
	listenerAid.remove(gNavToolbox, 'dragenter', onDragEnter);
	listenerAid.remove(gNavToolbox, 'mouseover', onMouseOver);
	listenerAid.remove(gNavToolbox, 'mouseout', onMouseOut);
	listenerAid.remove(gBrowser, "dragenter", onDragExitAll);
	listenerAid.remove(window, "drop", onDragExitAll);
	listenerAid.remove(window, "dragend", onDragExitAll);
	listenerAid.remove(window, 'popupshown', holdPopupMenu);
	listenerAid.remove(gNavToolbox, 'focus', onMouseOver, true);
	listenerAid.remove(gNavToolbox, 'blur', onMouseOut, true);
	listenerAid.remove(gBrowser, 'focus', focusPasswords, true);
	listenerAid.remove(gBrowser, 'blur', focusPasswords, true);
	listenerAid.remove(slimChromeContainer, 'transitionend', slimChromeTransitioned);
	observerAid.remove(findPersonaPosition, "lightweight-theme-changed");
	
	gNavToolbox.insertBefore(gNavBar, customToolbars);
	
	while(slimChromeToolbars.firstChild) {
		var e = gNavToolbox.externalToolbars.indexOf(slimChromeToolbars.firstChild);
		if(e != -1) {
			gNavToolbox.externalToolbars.splice(e, 1);
		}
		
		gNavToolbox.appendChild(slimChromeToolbars.firstChild);
	}
};
	
moduleAid.LOADMODULE = function() {
	overlayAid.overlayWindow(window, 'slimChrome', null, loadSlimChrome, unloadSlimChrome);
};

moduleAid.UNLOADMODULE = function() {
	styleAid.unload('personaSlimChrome_'+_UUID);
	overlayAid.removeOverlayWindow(window, 'slimChrome');
};
