moduleAid.VERSION = '2.0.15';

// this module catches the popup event and tells which nodes (triggers) the slimChrome script should check for

this.holdPanelUI = function(e) {
	e.detail = 'PanelUI-button';
	e.stopPropagation();
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

this.holdIdentityPopup = function(e) {
	e.detail = 'identity-box';
	e.stopPropagation();
};

this.holdNotificationPopup = function(e) {
	e.detail = 'notification-popup-box';
	e.stopPropagation();
};

this.setupHoldDownloadsPanel = function(e) {
	if(e.target.id == 'downloadsPanel') {
		listenerAid.remove(window, 'popupshowing', setupHoldDownloadsPanel);
		listenerAid.add(e.target, 'AskingForNodeOwner', holdDownloadsPanel);
	}
};

this.holdDownloadsPanel = function(e) {
	e.detail = 'downloads-button';
	e.stopPropagation();
};

this.setupHoldBookmarkPanel = function(e) {
	if(e.target.id == 'editBookmarkPanel') {
		listenerAid.remove(window, 'popupshowing', setupHoldBookmarkPanel);
		listenerAid.add(e.target, 'AskingForNodeOwner', holdBookmarkPanel);
	}
};

this.holdBookmarkPanel = function(e) {
	e.detail = 'bookmarks-menu-button';
	e.stopPropagation();
};

// Keep chrome visible when opening menus within it
this.blockPopups = ['identity-popup', 'notification-popup'];
this.blockedPopup = false;
this.holdPopupNodes = [];
this.holdPopupMenu = function(e) {
	// don't do anything on tooltips! the UI might collapse altogether
	if(!e.target || e.target.nodeName == 'window' || e.target.nodeName == 'tooltip') { return; }
	
	var trigger = e.originalTarget.triggerNode;
	
	// check if the trigger node is present in our toolbars;
	// there's no need to check the overflow panel here, as it will likely be open already in these cases
	var hold = isAncestor(trigger, slimChromeContainer);
	
	// try to use the anchor specified when opening the popup, if any; ditto from above for overflow panel nodes
	if(!hold && e.target.anchorNode) {
		hold = isAncestor(e.target.anchorNode, slimChromeContainer);
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
			// trigger could be either in the toolbars themselves or in the overflow panel
			hold = isAncestor(trigger, slimChromeContainer) || isAncestor(trigger, overflowList);
		}
	}
	
	if(hold) {
		// if we're opening the chrome now, the anchor may move, so we need to reposition the popup when it does
		holdPopupNodes.push(e.target);
		
		// sometimes when opening the menu panel, it will be nearly collapsed, I have no idea what is setting these values
		if(e.target.id == 'PanelUI-popup') {
			removeAttribute(e.target, 'width');
			removeAttribute(e.target, 'height');
		}
		
		// if opening a panel from the urlbar, we should keep the mini state, instead of expanding to full chrome
		if(trueAttribute(slimChromeContainer, 'mini') && slimChromeContainer.hovers == 0 && blockPopups.indexOf(e.target.id) > -1) {
			setMini(true);
			blockedPopup = true;
		} else {
			if(!trueAttribute(slimChromeContainer, 'fullWidth')) {
				hideIt(e.target);
				timerAid.init('ensureHoldPopupShows', popupsFinishedWidth, 200);
			}
			
			setHover(true, true);
		}
		
		var selfRemover = function(ee) {
			if(ee.originalTarget != e.originalTarget) { return; } //submenus
			listenerAid.remove(e.target, 'popuphidden', selfRemover);
			
			// making sure we don't collapse it permanently
			hideIt(e.target, true);
			
			if(typeof(setHover) != 'undefined') {
				if(trueAttribute(slimChromeContainer, 'mini') && blockPopups.indexOf(e.target.id) > -1) {
					if(blockedPopup) {
						hideMiniInABit();
						blockedPopup = false;
					}
				} else {
					setHover(false);
				}
			}
			
			aSync(function() {
				if(typeof(holdPopupNodes) != 'undefined' && holdPopupNodes.indexOf(e.target) > -1) {
					holdPopupNodes.splice(holdPopupNodes.indexOf(e.target), 1);
				}
			}, 150);
		}
		listenerAid.add(e.target, 'popuphidden', selfRemover);
	}
};

this.popupsWillSetMini = function(e) {
	// e.detail is if setting or unsetting mini state
	if(e.detail) { blockedPopup = false; }
};

this.popupsFinishedWidth = function() {
	timerAid.cancel('ensureHoldPopupShows');
	if(holdPopupNodes.length > 0) {
		for(var i=0; i<holdPopupNodes.length; i++) {
			// don't bother if the popup was never hidden to begin with,
			// it's not needed (the chrome was already expanded when it opened), so the popup is already properly placed,
			// also this prevents some issues, for example the context menu jumping to the top left corner
			if(!holdPopupNodes[i].collapsed) { continue; }
			
			// obviously we won't need to move it if it isn't open
			if(holdPopupNodes[i].open || holdPopupNodes[i].state == 'open') {
				holdPopupNodes[i].moveTo(-1,-1);
				hideIt(holdPopupNodes[i], true);
			}
		}
		
		// in case opening the popup triggered the chrome to show, and the mouse just so happens to be in that area, we need to make sure the mouse leaving
		// won't hide the chrome with the popup still shown
		if(slimChromeContainer.hovers === 1 && $$('#'+objName+'-slimChrome-container:hover')[0]) {
			setHover(true);
		}
	}
};

this.loadSlimChromePopups = function() {
	// if a menu or a panel is opened from the toolbox, keep it shown
	listenerAid.add(window, 'popupshown', holdPopupMenu);
	listenerAid.add(slimChromeContainer, 'willSetMiniChrome', popupsWillSetMini);
	listenerAid.add(slimChromeContainer, 'FinishedSlimChromeWidth', popupsFinishedWidth);
};

this.unloadSlimChromePopups = function() {
	timerAid.cancel('ensureHoldPopupShows');
	
	listenerAid.remove(window, 'popupshown', holdPopupMenu);
	listenerAid.remove(slimChromeContainer, 'willSetMiniChrome', popupsWillSetMini);
	listenerAid.remove(slimChromeContainer, 'FinishedSlimChromeWidth', popupsFinishedWidth);
};

moduleAid.LOADMODULE = function() {
	listenerAid.add(window, 'LoadedSlimChrome', loadSlimChromePopups);
	listenerAid.add(window, 'UnloadingSlimChrome', unloadSlimChromePopups);
	
	// in case slimChrome loads before popups
	if(typeof(slimChromeContainer) != 'undefined' && slimChromeContainer) {
		loadSlimChromePopups();
	}
	
	// make sure we know about all these panels so we can hold the chrome open with them
	listenerAid.add($('PanelUI-popup'), 'AskingForNodeOwner', holdPanelUI);
	listenerAid.add($('widget-overflow'), 'AskingForNodeOwner', holdNavBarOverflow);
	listenerAid.add($('PopupAutoComplete'), 'AskingForNodeOwner', holdPopupAutoComplete);
	listenerAid.add($('PopupAutoCompleteRichResult'), 'AskingForNodeOwner', holdPopupAutoCompleteRichResult);
	listenerAid.add($('identity-popup'), 'AskingForNodeOwner', holdIdentityPopup);
	listenerAid.add($('notification-popup'), 'AskingForNodeOwner', holdNotificationPopup);
	
	// the downloadsPanel is only created when first called
	if($('downloadsPanel')) {
		listenerAid.add($('downloadsPanel'), 'AskingForNodeOwner', holdDownloadsPanel);
	} else {
		listenerAid.add(window, 'popupshowing', setupHoldDownloadsPanel);
	}
	
	// ditto for the editBookmarkPanel
	if($('editBookmarkPanel')) {
		listenerAid.add($('editBookmarkPanel'), 'AskingForNodeOwner', holdBookmarkPanel);
	} else {
		listenerAid.add(window, 'popupshowing', setupHoldBookmarkPanel);
	}
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove($('PanelUI-popup'), 'AskingForNodeOwner', holdPanelUI);
	listenerAid.remove($('widget-overflow'), 'AskingForNodeOwner', holdNavBarOverflow);
	listenerAid.remove($('PopupAutoComplete'), 'AskingForNodeOwner', holdPopupAutoComplete);
	listenerAid.remove($('PopupAutoCompleteRichResult'), 'AskingForNodeOwner', holdPopupAutoCompleteRichResult);
	listenerAid.remove($('identity-popup'), 'AskingForNodeOwner', holdIdentityPopup);
	listenerAid.remove($('notification-popup'), 'AskingForNodeOwner', holdNotificationPopup);
	listenerAid.remove($('downloadsPanel'), 'AskingForNodeOwner', holdDownloadsPanel);
	listenerAid.remove($('editBookmarkPanel'), 'AskingForNodeOwner', holdBookmarkPanel);
	listenerAid.remove(window, 'popupshowing', setupHoldDownloadsPanel);
	listenerAid.remove(window, 'popupshowing', setupHoldBookmarkPanel);
	
	listenerAid.remove(window, 'LoadedSlimChrome', loadSlimChromePopups);
	listenerAid.remove(window, 'UnloadingSlimChrome', unloadSlimChromePopups);
	
	if(typeof(slimChromeContainer) != 'undefined' && slimChromeContainer) {
		unloadSlimChromePopups();
	}
};
