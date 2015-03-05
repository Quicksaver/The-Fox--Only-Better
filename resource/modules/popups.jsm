Modules.VERSION = '2.0.24';

// this module catches the popup event and tells which nodes (triggers) the slimChrome script should check for

this.holdPanelUI = function(e) {
	// make sure we only trigger the chrome when the popup is opened through its button
	// https://github.com/Quicksaver/The-Fox--Only-Better/issues/93
	if(e.target.anchorNode) {
		e.detail = 'PanelUI-button';
		e.stopPropagation();
	}
};

this.holdNavBarOverflow = function(e) {
	e.detail = 'nav-bar-overflow-button';
	e.stopPropagation();
};

this.holdPopupAutoComplete = function(e) {
	if(isAncestor(document.commandDispatcher.focusedElement, $('searchbar'))) {
		e.detail = 'searchbar';
		e.stopPropagation();
	}
};

this.holdPopupAutoCompleteRichResult = function(e) {
	e.detail = 'urlbar';
	e.stopPropagation();
};

this.holdNotificationPopup = function(e) {
	if(typeof(slimChromeContainer) != 'undefined' && isAncestor(e.target.anchorNode, slimChromeContainer)) {
		e.detail = 'notification-popup-box';
		e.stopPropagation();
	}
};

// Keep chrome visible when opening menus within it
this.blockPopups = ['identity-popup', 'notification-popup'];
this.blockedPopup = false;
this.holdPopupNodes = [];
this.holdPopupMenu = function(e) {
	// don't do anything on tooltips! the UI might collapse altogether
	if(!e.target || e.target.nodeName == 'window' || e.target.nodeName == 'tooltip') { return; }
	
	var trigger = e.originalTarget.triggerNode;
	var target = e.target;
	
	// don't bother with any of this if the opened popup is a child of any currently opened panel
	for(p of holdPopupNodes) {
		if(target != p && isAncestor(target, p)) { return; }
	}
	
	// check if the trigger node is present in our toolbars;
	// there's no need to check the overflow panel here, as it will likely be open already in these cases
	var hold = isAncestor(trigger, slimChromeContainer);
	
	// try to use the anchor specified when opening the popup, if any; ditto from above for overflow panel nodes
	if(!hold && target.anchorNode) {
		hold = isAncestor(target.anchorNode, slimChromeContainer);
	}
	
	if(!hold && !trigger) {
		// CUI panel doesn't carry a triggerNode, we have to find it ourselves
		if(target.id == 'customizationui-widget-panel') {
			hold_loop:
			for(var child of slimChromeToolbars.childNodes) {
				if(child.localName != 'toolbar' || !CustomizableUI.getAreaType(child.id)) { continue; }
				
				var widgets = CustomizableUI.getWidgetsInArea(child.id);
				for(var w=0; w<widgets.length; w++) {
					var widget = widgets[w] && widgets[w].forWindow(window);
					if(!widget || !widget.node || !widget.node.open) { continue; }
					
					hold = true;
					break hold_loop;
				}
			}
		}
		
		// let's just assume all panels that are children from these toolbars are opening from them
		else if(isAncestor(target, slimChromeContainer)) {
			hold = true;
			
			// the search engine selection menu is an anonymous child of the searchbar; e.target == $('searchbar'), so we need to explicitely get the actual menu to use
			if(target.id == 'searchbar') {
				target = document.getAnonymousElementByAttribute(target, 'anonid', 'searchbar-popup');
			}
		}
	}
	
	// nothing "native" is opening this popup, so let's see if someone claims it
	if(!hold) {
		trigger = dispatch(target, { type: 'AskingForNodeOwner', asking: true });
		if(trigger && typeof(trigger) == 'string') {
			trigger = $(trigger);
			// trigger could be either in the toolbars themselves or in the overflow panel
			hold = isAncestor(trigger, slimChromeContainer) || isAncestor(trigger, overflowList);
		}
	}
	
	// some menus, like NoScript's button menu, like to open multiple times (I think), or at least they don't actually open the first time... or something...
	if(hold && e.target.state == 'open') {
		// if we're opening the chrome now, the anchor may move, so we need to reposition the popup when it does
		holdPopupNodes.push(target);
		
		// sometimes when opening the menu panel, it will be nearly collapsed, I have no idea what is setting these values
		if(target.id == 'PanelUI-popup') {
			removeAttribute(target, 'width');
			removeAttribute(target, 'height');
		}
		
		// if opening a panel from the urlbar, we should keep the mini state, instead of expanding to full chrome
		if(Prefs.includeNavBar && trueAttribute(slimChromeContainer, 'mini') && slimChromeContainer.hovers == 0 && blockPopups.indexOf(target.id) > -1) {
			setMini(true);
			blockedPopup = true;
		} else {
			if(!trueAttribute(slimChromeContainer, 'fullWidth')) {
				hideIt(target);
				Timers.init('ensureHoldPopupShows', popupsFinishedWidth, 200);
			}
			
			setHover(true, true);
		}
		
		var selfRemover = function(ee) {
			if(ee.originalTarget != e.originalTarget) { return; } //submenus
			Listeners.remove(target, 'popuphidden', selfRemover);
			
			// making sure we don't collapse it permanently
			hideIt(target, true);
			
			if(typeof(setHover) != 'undefined') {
				if(trueAttribute(slimChromeContainer, 'mini') && blockPopups.indexOf(target.id) > -1) {
					if(blockedPopup) {
						hideMiniInABit();
						blockedPopup = false;
					}
				} else {
					setHover(false);
				}
			}
			
			aSync(function() {
				if(typeof(holdPopupNodes) != 'undefined' && holdPopupNodes.indexOf(target) > -1) {
					holdPopupNodes.splice(holdPopupNodes.indexOf(target), 1);
				}
			}, 150);
		}
		Listeners.add(target, 'popuphidden', selfRemover);
	}
};

this.popupsWillSetMini = function(e) {
	// e.detail is if setting or unsetting mini state
	if(e.detail) { blockedPopup = false; }
};

this.popupsFinishedWidth = function() {
	Timers.cancel('ensureHoldPopupShows');
	if(holdPopupNodes.length > 0) {
		for(var popup of holdPopupNodes) {
			// don't bother if the popup was never hidden to begin with,
			// it's not needed (the chrome was already expanded when it opened), so the popup is already properly placed,
			// also this prevents some issues, for example the context menu jumping to the top left corner
			if(!popup.collapsed) { continue; }
			
			// obviously we won't need to move it if it isn't open
			if(popup.open || popup.state == 'open') {
				popup.moveTo(-1,-1);
				hideIt(popup, true);
			}
		}
		
		// in case opening the popup triggered the chrome to show, and the mouse just so happens to be in that area, we need to make sure the mouse leaving
		// won't hide the chrome with the popup still shown
		if(slimChromeContainer.hovers === 1 && Prefs.useMouse && $$('#'+objName+'-slimChrome-container:hover')[0]) {
			setHover(true);
		}
	}
};

this.loadSlimChromePopups = function() {
	// if a menu or a panel is opened from the toolbox, keep it shown
	Listeners.add(window, 'popupshown', holdPopupMenu);
	Listeners.add(slimChromeContainer, 'willSetMiniChrome', popupsWillSetMini);
	Listeners.add(slimChromeContainer, 'FinishedSlimChromeWidth', popupsFinishedWidth);
};

this.unloadSlimChromePopups = function() {
	Timers.cancel('ensureHoldPopupShows');
	
	Listeners.remove(window, 'popupshown', holdPopupMenu);
	Listeners.remove(slimChromeContainer, 'willSetMiniChrome', popupsWillSetMini);
	Listeners.remove(slimChromeContainer, 'FinishedSlimChromeWidth', popupsFinishedWidth);
};

Modules.LOADMODULE = function() {
	Listeners.add(window, 'LoadedSlimChrome', loadSlimChromePopups);
	Listeners.add(window, 'UnloadingSlimChrome', unloadSlimChromePopups);
	
	// in case slimChrome loads before popups
	if(typeof(slimChromeContainer) != 'undefined' && slimChromeContainer) {
		loadSlimChromePopups();
	}
	
	// make sure we know about all these panels so we can hold the chrome open with them
	Listeners.add($('PanelUI-popup'), 'AskingForNodeOwner', holdPanelUI);
	Listeners.add($('widget-overflow'), 'AskingForNodeOwner', holdNavBarOverflow);
	Listeners.add($('PopupAutoComplete'), 'AskingForNodeOwner', holdPopupAutoComplete);
	Listeners.add($('PopupAutoCompleteRichResult'), 'AskingForNodeOwner', holdPopupAutoCompleteRichResult);
	Listeners.add($('notification-popup'), 'AskingForNodeOwner', holdNotificationPopup);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove($('PanelUI-popup'), 'AskingForNodeOwner', holdPanelUI);
	Listeners.remove($('widget-overflow'), 'AskingForNodeOwner', holdNavBarOverflow);
	Listeners.remove($('PopupAutoComplete'), 'AskingForNodeOwner', holdPopupAutoComplete);
	Listeners.remove($('PopupAutoCompleteRichResult'), 'AskingForNodeOwner', holdPopupAutoCompleteRichResult);
	Listeners.remove($('notification-popup'), 'AskingForNodeOwner', holdNotificationPopup);
	
	Listeners.remove(window, 'LoadedSlimChrome', loadSlimChromePopups);
	Listeners.remove(window, 'UnloadingSlimChrome', unloadSlimChromePopups);
	
	if(typeof(slimChromeContainer) != 'undefined' && slimChromeContainer) {
		unloadSlimChromePopups();
	}
};
