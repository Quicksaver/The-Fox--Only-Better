moduleAid.VERSION = '1.1.0';

this.__defineGetter__('lessChromeContainer', function() { return $(objName+'-lessChrome-container'); });
this.__defineGetter__('lessChromeToolbars', function() { return $(objName+'-lessChrome-toolbars'); });

this.__defineGetter__('browserPanel', function() { return $('browser-panel'); });
this.__defineGetter__('customToolbars', function() { return $('customToolbars'); });
this.getComputedStyle = function(el) { return window.getComputedStyle(el); };

// until I find a better way of finding out on which side of the browser is the scrollbar, I'm setting equal margins
this.__defineGetter__('MIN_LEFT', function() { return 22; });
this.__defineGetter__('MIN_RIGHT', function() { return 22; });

this.moveLessChromeStyle = {};
this.lastLessChromeStyle = null;

this.delayMoveLessChrome = function() {
	timerAid.init('delayMoveLessChrome', moveLessChrome, 0);
};

this.shouldReMoveLessChrome = function(newStyle) {
	if(!lastLessChromeStyle) { return true; }
	
	if(!newStyle) {
		return (lessChromeContainer.clientWidth != lastLessChromeStyle.clientWidth);
	}
	else if(newStyle.right != lastLessChromeStyle.right
		|| newStyle.left != lastLessChromeStyle.left
		|| newStyle.width != lastLessChromeStyle.width
		|| newStyle.clientWidth != lastLessChromeStyle.clientWidth) {
			return true;
	}
	
	return false;
};

// Handles the position of the top chrome
this.moveLessChrome = function() {
	moveLessChromeStyle = {
		width: -MIN_RIGHT -MIN_LEFT,
		clientWidth: lessChromeContainer.clientWidth,
		left: MIN_LEFT,
		right: MIN_RIGHT
	};
	
	var appContentPos = $('content').getBoundingClientRect();
	moveLessChromeStyle.width += appContentPos.width;
	moveLessChromeStyle.left += appContentPos.left;
	moveLessChromeStyle.right += document.documentElement.clientWidth -appContentPos.right;
	
	// Compatibility with TreeStyleTab
	if($('TabsToolbar') && !$('TabsToolbar').collapsed) {
		// This is also needed when the tabs are on the left, the width of the findbar doesn't follow with the rest of the window for some reason
		if($('TabsToolbar').getAttribute('treestyletab-tabbar-position') == 'left' || $('TabsToolbar').getAttribute('treestyletab-tabbar-position') == 'right') {
			var TabsToolbar = $('TabsToolbar');
			var TabsSplitter = document.getAnonymousElementByAttribute($('content'), 'class', 'treestyletab-splitter');
			moveLessChromeStyle.width -= TabsToolbar.clientWidth;
			moveLessChromeStyle.width -= TabsSplitter.clientWidth +(TabsSplitter.clientLeft *2);
			if(TabsToolbar.getAttribute('treestyletab-tabbar-position') == 'left') {
				moveLessChromeStyle.left += TabsToolbar.clientWidth;
				moveLessChromeStyle.left += TabsSplitter.clientWidth +(TabsSplitter.clientLeft *2);
			}
			if(TabsToolbar.getAttribute('treestyletab-tabbar-position') == 'right') {
				moveLessChromeStyle.right += TabsToolbar.clientWidth;
				moveLessChromeStyle.right += TabsSplitter.clientWidth +(TabsSplitter.clientLeft *2);
			}
		}
	}
	
	if(!shouldReMoveLessChrome(moveLessChromeStyle)) { return; }
	
	lastLessChromeStyle = moveLessChromeStyle;
	
	// Unload current stylesheet if it's been loaded
	styleAid.unload('lessChromeMove_'+_UUID);
	
	var sscode = '/*Navigator Supercharger CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #navigatorSupercharger-lessChrome-container {\n';
	sscode += '		width: ' + Math.max(moveLessChromeStyle.width, 100) + 'px;\n';
	sscode += '		left: ' + moveLessChromeStyle.left + 'px;\n';
	sscode += '	}\n';
	sscode += '}';
	
	styleAid.load('lessChromeMove_'+_UUID, sscode, true);
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
	listenerAid.remove(lessChromeContainer, 'dragenter', onDragEnter);
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
		lessChromeContainer.hovers++;
		setAttribute(lessChromeContainer, 'hover', 'true');
		if(force != undefined && typeof(force) == 'number') {
			lessChromeContainer.hovers = force;
		}
	}
	else {
		if(force != undefined && typeof(force) == 'number') {
			lessChromeContainer.hovers = force;
		} else if(lessChromeContainer.hovers > 0) {
			lessChromeContainer.hovers--;
		}
		if(lessChromeContainer.hovers == 0) {
			removeAttribute(lessChromeContainer, 'hover');
		}
	}
};

this.setMini = function(mini, force) {
	if(mini) {
		lessChromeContainer.minis++;
		setAttribute(lessChromeContainer, 'mini', 'true');
		if(force != undefined && typeof(force) == 'number') {
			lessChromeContainer.minis = force;
		}
	}
	else {
		if(force != undefined && typeof(force) == 'number') {
			lessChromeContainer.minis = force;
		} else if(lessChromeContainer.minis > 0) {
			lessChromeContainer.minis--;
		}
		if(lessChromeContainer.minis == 0) {
			removeAttribute(lessChromeContainer, 'mini');
		}
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
this.holdPopupMenu = function(e) {
	var trigger = e.originalTarget.triggerNode;
	var hold = false;
	
	// check if the trigger node is present in the addonBar
	if(!hold) {
		hold = isAncestor(trigger, lessChromeContainer);
	}
	
	if(!hold && !trigger) {
		// CUI panel doesn't carry a triggerNode, we have to find it ourselves
		if(e.target.id == 'customizationui-widget-panel') {
			hold_loop: for(var t=0; t<lessChromeToolbars.childNodes.length; t++) {
				if(lessChromeToolbars.childNodes[t].localName != 'toolbar' || !CustomizableUI.getAreaType(lessChromeToolbars.childNodes[t].id)) { continue; }
				
				var widgets = CustomizableUI.getWidgetsInArea(lessChromeToolbars.childNodes[t].id);
				for(var w=0; w<widgets.length; w++) {
					var widget = widgets[w].forWindow(window);
					if(!widget || !widget.node || !widget.node.open) { continue; }
					
					hold = true;
					break hold_loop;
				}
			}
		}
		
		// let's just assume all panels that are children from these toolbars are opening from them
		else if(isAncestor(e.target, lessChromeContainer)) {
			hold = true;
		}
	}
	
	// nothing "native" is opening this popup, so let's see if someone claims it
	if(!hold) {
		trigger = askForOwner(e.target);
		if(trigger && typeof(trigger) == 'string') {
			trigger = $(trigger);
			hold = isAncestor(trigger, lessChromeContainer);
		}
	}
	
	if(hold) {
		setHover(true);
		var selfRemover = function(ee) {
			if(ee.originalTarget != e.originalTarget) { return; } //submenus
			if(typeof(setHover) != 'undefined') { setHover(false); }
			listenerAid.remove(e.target, 'popuphidden', selfRemover);
		}
		listenerAid.add(e.target, 'popuphidden', selfRemover);
	}
};

this.loadLessChrome = function() {
	lessChromeContainer.hovers = 0;
	lessChromeContainer.minis = 0;
	
	lessChromeToolbars.appendChild(gNavBar);
	
	// also append all other custom toolbars
	var toolbar = customToolbars;
	while(toolbar.nextSibling) {
		toolbar = toolbar.nextSibling;
		if(toolbar.id == 'addon-bar') { continue; }
		
		var toMove = toolbar;
		toolbar = toolbar.previousSibling;
		lessChromeToolbars.appendChild(toMove);
		
		if(gNavToolbox.externalToolbars.indexOf(toMove) == -1) {
			gNavToolbox.externalToolbars.push(toMove);
		}
	}
	
	// position the top chrome correctly when the window is resized or a toolbar is shown/hidden
	listenerAid.add(browserPanel, 'resize', delayMoveLessChrome);
	
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
	
	moveLessChrome();
};

this.unloadLessChrome = function() {
	listenerAid.remove(browserPanel, 'resize', delayMoveLessChrome);
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
	
	gNavToolbox.insertBefore(gNavBar, customToolbars);
	
	while(lessChromeToolbars.firstChild) {
		var e = gNavToolbox.externalToolbars.indexOf(lessChromeToolbars.firstChild);
		if(e != -1) {
			gNavToolbox.externalToolbars.splice(e, 1);
		}
		
		gNavToolbox.appendChild(lessChromeToolbars.firstChild);
	}
};
	
moduleAid.LOADMODULE = function() {
	overlayAid.overlayWindow(window, 'lessChrome', null, loadLessChrome, unloadLessChrome);
};

moduleAid.UNLOADMODULE = function() {
	overlayAid.removeOverlayWindow(window, 'lessChrome');
};
