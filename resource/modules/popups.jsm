Modules.VERSION = '3.0.5';

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

// Keep chrome visible when opening menus within it
this.popups = {
	// set of popup ids that are ok to be shown with only the mini bar
	mini: new Set(),
	
	blocked: false,
	held: new Set(),
	
	handleEvent: function(e) {
		switch(e.type) {
			case 'popupshown':
				// don't do anything on tooltips! the UI might collapse altogether
				if(!e.target || e.target.nodeName == 'window' || e.target.nodeName == 'tooltip') { return; }
				
				var trigger = e.originalTarget.triggerNode;
				var target = e.target;
				
				// don't bother with any of this if the opened popup is a child of any currently opened panel
				for(let p of this.held) {
					if(target != p && isAncestor(target, p)) { return; }
				}
				
				// check if the trigger node is present in our toolbars;
				// there's no need to check the overflow panel here, as it will likely be open already in these cases
				var hold = isAncestor(trigger, slimChrome.container);
				
				// try to use the anchor specified when opening the popup, if any; ditto from above for overflow panel nodes
				if(!hold && target.anchorNode) {
					hold = isAncestor(target.anchorNode, slimChrome.container);
				}
				
				if(!hold && !trigger) {
					// CUI panel doesn't carry a triggerNode, we have to find it ourselves
					if(target.id == 'customizationui-widget-panel') {
						hold_loop: for(let child of slimChrome.toolbars.childNodes) {
							if(child.localName != 'toolbar' || !CustomizableUI.getAreaType(child.id)) { continue; }
							
							var widgets = CustomizableUI.getWidgetsInArea(child.id);
							for(let w of widgets) {
								var widget = w && w.forWindow(window);
								if(!widget || !widget.node || !widget.node.open) { continue; }
								
								hold = true;
								break hold_loop;
							}
						}
					}
					
					// let's just assume all panels that are children from these toolbars are opening from them
					else if(isAncestor(target, slimChrome.container)) {
						hold = true;
						
						// the search engine selection menu is an anonymous child of the searchbar; e.target == $('searchbar'),
						// so we need to explicitely get the actual menu to use
						if(target.id == 'searchbar') {
							target = $ª(target, 'searchbar-popup');
						}
					}
				}
				
				// nothing "native" is opening this popup, so let's see if someone claims it,
				// this should be unnecessary when there's a valid anchorNode reference
				if(!hold && !e.target.anchorNode) {
					trigger = dispatch(target, { type: 'AskingForNodeOwner', asking: true });
					if(trigger && typeof(trigger) == 'string') {
						trigger = $(trigger);
						// trigger could be either in the toolbars themselves or in the overflow panel
						hold = isAncestor(trigger, slimChrome.container) || isAncestor(trigger, overflowList);
					}
				}
				
				// some menus, like NoScript's button menu, like to open multiple times (I think), or at least they don't actually open the first time... or something...
				if(hold && e.target.state == 'open') {
					// if we're opening the chrome now, the anchor may move, so we need to reposition the popup when it does
					this.held.add(target);
					
					// sometimes when opening the menu panel, it will be nearly collapsed, I have no idea what is setting these values
					if(target.id == 'PanelUI-popup') {
						removeAttribute(target, 'width');
						removeAttribute(target, 'height');
					}
					
					// if opening a panel from the urlbar, we should keep the mini state, instead of expanding to full chrome
					if(Prefs.includeNavBar
					&& !slimChrome.container.hovers
					&& 	(this.mini.has(target.id) // this popup is whitelisted to block the mini bar
						|| (!e.target.anchorNode && trigger && trueAttribute(slimChrome.container, 'mini'))) // context menu likely called from the mini bar
					) {
						// if the mini bar isn't show yet, we need to show it immediately, so popups anchored to it don't move around with it,
						// otherwise it would look weird and the panels would always end up a bit off from their supposed anchor;
						// this still causes the panel to sort of jump a bit most times, the only alternative is to try to open the panel only after the
						// mini bar has actually been shown
						slimChrome.quickShowMini();
						this.blocked = true;
					}
					else {
						if(!trueAttribute(slimChrome.container, 'fullWidth')) {
							target.collapsed = true;
							Timers.init('ensureHoldPopupShows', () => { this.finishedWidth(); }, 200);
						}
						
						slimChrome.setHover(true, true);
					}
					
					let selfRemover = (ee) => {
						// don't trigger for submenus
						if(ee.originalTarget == e.originalTarget) {
							Listeners.remove(target, 'popuphidden', selfRemover);
							
							// making sure we don't collapse it permanently
							target.collapsed = false;
							
							if(typeof(slimChrome) != 'undefined') {
								if(this.blocked) {
									slimChrome.hideMiniInABit();
									this.blocked = false;
								}
								slimChrome.setHover(false);
							}
							
							aSync(() => {
								if(this.held.has(target)) {
									this.held.delete(target);
								}
							}, 150);
						}
					}
					Listeners.add(target, 'popuphidden', selfRemover);
				}
				break;
			
			case 'willSetMiniChrome':
				// e.detail is if setting or unsetting mini state
				if(e.detail) { this.blocked = false; }
				break;
			
			case 'FinishedSlimChromeWidth':
				this.finishedWidth();
				break;
			
			case 'LoadedSlimChrome':
				this.init();
				break;
			
			case 'UnloadingSlimChrome':
				this.deinit();
				break;
		}
	},
	
	finishedWidth: function() {
		Timers.cancel('ensureHoldPopupShows');
		if(this.held.size > 0) {
			for(let popup of this.held) {
				// don't bother if the popup was never hidden to begin with,
				// it's not needed (the chrome was already expanded when it opened), so the popup is already properly placed,
				// also this prevents some issues, for example the context menu jumping to the top left corner
				if(!popup.collapsed) { continue; }
				
				// obviously we won't need to move it if it isn't open
				if(popup.open || popup.state == 'open') {
					popup.moveTo(-1,-1);
					popup.collapsed = false;
				}
			}
			
			// in case opening the popup triggered the chrome to show, and the mouse just so happens to be in that area, we need to make sure the mouse leaving
			// won't hide the chrome with the popup still shown
			if(slimChrome.container.hovers === 1 && Prefs.useMouse && $$('#'+objName+'-slimChrome-container:hover')[0]) {
				slimChrome.setHover(true);
			}
		}
	},
	
	init: function() {
		// if a menu or a panel is opened from the toolbox, keep it shown
		Listeners.add(window, 'popupshown', this);
		Listeners.add(slimChrome.container, 'willSetMiniChrome', this);
		Listeners.add(slimChrome.container, 'FinishedSlimChromeWidth', this);
		
		dispatch(slimChrome.container, { type: 'LoadedSlimChromePopups', cancelable: false });
	},
	
	deinit: function() {
		Timers.cancel('ensureHoldPopupShows');
		
		dispatch(slimChrome.container, { type: 'UnloadingSlimChromePopups', cancelable: false });
		
		Listeners.remove(window, 'popupshown', this);
		Listeners.remove(slimChrome.container, 'willSetMiniChrome', this);
		Listeners.remove(slimChrome.container, 'FinishedSlimChromeWidth', this);
	}
};

Modules.LOADMODULE = function() {
	Listeners.add(window, 'LoadedSlimChrome', popups);
	Listeners.add(window, 'UnloadingSlimChrome', popups);
	
	// in case slimChrome loads before popups
	if(self.slimChrome && slimChrome.container) {
		popups.init();
	}
	
	// make sure we know about all these panels so we can hold the chrome open with them
	Listeners.add($('PanelUI-popup'), 'AskingForNodeOwner', holdPanelUI);
	Listeners.add($('widget-overflow'), 'AskingForNodeOwner', holdNavBarOverflow);
	Listeners.add($('PopupAutoComplete'), 'AskingForNodeOwner', holdPopupAutoComplete);
	Listeners.add($('PopupAutoCompleteRichResult'), 'AskingForNodeOwner', holdPopupAutoCompleteRichResult);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove($('PanelUI-popup'), 'AskingForNodeOwner', holdPanelUI);
	Listeners.remove($('widget-overflow'), 'AskingForNodeOwner', holdNavBarOverflow);
	Listeners.remove($('PopupAutoComplete'), 'AskingForNodeOwner', holdPopupAutoComplete);
	Listeners.remove($('PopupAutoCompleteRichResult'), 'AskingForNodeOwner', holdPopupAutoCompleteRichResult);
	
	Listeners.remove(window, 'LoadedSlimChrome', popups);
	Listeners.remove(window, 'UnloadingSlimChrome', popups);
	
	if(self.slimChrome && slimChrome.container) {
		popups.deinit();
	}
};
