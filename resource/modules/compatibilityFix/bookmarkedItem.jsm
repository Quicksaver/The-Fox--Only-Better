Modules.VERSION = '1.3.0';

this.__defineGetter__('BookmarkingUI', function() { return window.BookmarkingUI; });
this.__defineGetter__('StarUI', function() { return window.StarUI; });
this.__defineGetter__('PlacesCommandHook', function() { return window.PlacesCommandHook; });

this.bookmarkedItem = {
	initialized: false,
	_anchor: false,
	
	get broadcaster() { return $('bookmarkThisPageBroadcaster'); },
	get editPanel() { return $('editBookmarkPanel'); },
	get key() { return $('addBookmarkAsKb'); },
	get button() { return CustomizableUI.getWidget('bookmarks-menu-button').forWindow(window).node; },
	get light() { return skyLights.get('bookmarkedItem'); },
	
	handleEvent: function(e) {
		switch(e.type) {
			case 'popupshowing':
				if(e.target == this.editPanel) {
					Listeners.remove(window, 'popupshowing', this);
					Listeners.add(e.target, 'AskingForNodeOwner', this);
					Listeners.add(e.target, 'ShouldPanelOpenFullChrome', this, true);
				}
				break;
			
			case 'AskingForNodeOwner':
				if(e.target.anchorNode != this.light) {
					e.detail = 'bookmarks-menu-button';
					e.stopPropagation();
				}
				break;
			
			// make sure slimChrome knows it's supposed to keep the mini open for this panel
			case 'ShouldPanelOpenFullChrome':
				Listeners.remove(slimChrome.container, 'willSetMiniChrome', this);
				e.preventDefault();
				e.stopPropagation();
				break;
			
			case 'willSetMiniChrome':
				if(!e.detail) {
					Timers.init('bookmarkedItemWillSetMiniChrome', function() {
						slimChrome.setMini(true);
					}, 0);
				}
				break;
			
			case 'LoadedSkyLights':
				this.init();
				break;
			
			case 'UnloadingSkyLights':
				this.deinit();
				break;
			
			// this is the Ctrl+D handler, we need to choose the best place where to open the panel in this case
			case 'command':
				// if the bookmarked item sky light is active, there's no need to show any of the chrome,
				// we can simply attach the editPanel to the light as if it was clicked
				if(this.light.parentNode
				&& !trueAttribute(slimChrome.container, 'hover')
				&& !trueAttribute(slimChrome.container, 'mini')) {
					this._anchor = this.light;
				}
				
				// follow through with the original command to open the editPanel
				let command = $(this.key.getAttribute('originalcommand'));
				if(!trueAttribute(command, 'disabled')) {
					command.doCommand();
				}
				break;
		}
	},
	
	attrWatcher: function() {
		// no point in over-calling this if more than just one attribute changes,
		// which is often the case as both "starred" and "buttontooltiptext" usually (always?) change together
		Timers.init('bookmarkedItemAttrWatcher', () => { this.update(); }, 0);
	},
	
	init: function() {
		if(this.initialized) { return; }
		this.initialized = true;
		
		setAttribute(this.button, 'showInMiniBar', 'true');
		
		setAttribute(this.key, 'originalcommand', this.key.getAttribute('command'));
		removeAttribute(this.key, 'command');
		setAttribute(this.key, 'oncommand', ';'); // the command event won't fire if there isn't "something" to "command"
		Listeners.add(this.key, 'command', this);
		
		Watchers.addAttributeWatcher(this.broadcaster, 'starred', this, false, false);
		Watchers.addAttributeWatcher(this.broadcaster, 'buttontooltiptext', this, false, false);
		
		this.update(true);
	},
	
	deinit: function() {
		if(!this.initialized) { return; }
		this.initialized = false;
		
		Timers.cancel('bookmarkedItemAttrWatcher');
		
		setAttribute(this.key, 'command', this.key.getAttribute('originalcommand'));
		removeAttribute(this.key, 'originalcommand');
		removeAttribute(this.key, 'oncommand');
		Listeners.remove(this.key, 'command', this);
		
		removeAttribute(this.button, 'showInMiniBar');
		
		this.remove();
		
		Watchers.removeAttributeWatcher(this.broadcaster, 'starred', this, false, false);
		Watchers.removeAttributeWatcher(this.broadcaster, 'buttontooltiptext', this, false, false);
	},
	
	update: function(initialize) {
		let starred = trueAttribute(this.broadcaster, 'starred');
		let tooltip = this.broadcaster.getAttribute('buttontooltiptext');
		
		let props = {
			state: starred ? 'starred' : 'unstarred',
			tooltip: tooltip,
			color: starred ? 'rgb(20,103,220)' : 'transparent'
		};
		
		if(initialize) {
			props.label = Strings.get('skyLights', 'bookmarkedItemLabel');
			props.description = Strings.get('skyLights', 'bookmarkedItemDescription');
			
			// adapted from BookmarkingUI.onCommand() - http://mxr.mozilla.org/mozilla-central/source/browser/base/content/browser-places.js#1630
			props.action = (e) => {
				let isBookmarked = BookmarkingUI._itemIds.length > 0;
				
				// Ignore clicks on the star if we are updating its state.
				if(!BookmarkingUI._pendingStmt) {
					if(isBookmarked) {
						this._anchor = bookmarkedItem.light;
					}
					PlacesCommandHook.bookmarkCurrentPage(isBookmarked);
				}
			};
		}
		
		skyLights.update('bookmarkedItem', props);
	},
	
	remove: function() {
		skyLights.remove('bookmarkedItem');
	}
};

Modules.LOADMODULE = function() {
	// the editBookmarkPanel is only created when first called
	if(bookmarkedItem.editPanel) {
		Listeners.add(bookmarkedItem.editPanel, 'AskingForNodeOwner', bookmarkedItem);
		Listeners.add(bookmarkedItem.editPanel, 'ShouldPanelOpenFullChrome', bookmarkedItem, true);
	} else {
		Listeners.add(window, 'popupshowing', bookmarkedItem);
	}
	
	Piggyback.add('bookmarkedItem', BookmarkingUI, '_showBookmarkedNotification', function() {
		// the chrome should already be opened for this (it's a click on the button), so we don't need to delay or pause this notification,
		// we only need to make sure the chrome doesn't hide until the animation is finished
		if(typeof(slimChrome) != 'undefined'
		&& (isAncestor($('bookmarks-menu-button'), slimChrome.container) || isAncestor($('bookmarks-menu-button'), overflowList))) {
			// we don't want to show the notification when the button is in the mini bar, since in that case the dropmarker will be hidden
			if(trueAttribute(slimChrome.container, 'onlyURLBar') && !trueAttribute(slimChrome.container, 'hover')) {
				return false;
			}
			
			slimChrome.initialShow(1500);
		}
		return true;
	}, Piggyback.MODE_BEFORE);
	
	// To prevent an issue with the BookarkedItem popup appearing below the browser window, because its anchor is destroyed between the time the popup is opened
	// and the time the chrome expands from mini to full (because the anchor is an anonymous node? I have no idea...), we catch this before the popup is opened, and
	// only continue with the operation after the chrome has expanded.
	// We do the same for when the anchor is the identity box, as in Mac OS X the bookmarked item panel would open outside of the window (no clue why though...)
	Piggyback.add('bookmarkedItem', StarUI, '_doShowEditBookmarkPanel', function(aItemId, aAnchorElement, aPosition) {
		if(typeof(slimChrome) == 'undefined') { return true; }
		
		// We also need to make sure that clicking the bookmarkedItem sky light opens the panel anchored to it as well.
		if(bookmarkedItem._anchor) {
			let anchor = bookmarkedItem._anchor;
			bookmarkedItem._anchor = false;
			
			if(anchor != aAnchorElement) {
				this._doShowEditBookmarkPanel(aItemId, anchor, aPosition);
				return false;
			}
		}
		
		// when the anchor is the sky light, just go right ahead and show the panel
		if(bookmarkedItem.initialized && aAnchorElement == bookmarkedItem.light) {
			return true;
		}
		
		let button = bookmarkedItem.button;
		let anchor = $("page-proxy-favicon");
		if(aAnchorElement != anchor) { anchor = null; }
		
		// in case the panel will be attached to the star button, check to see if it's placed in our toolbars
		if(isAncestor(aAnchorElement, slimChrome.container)) {
			// if we're anchoring to the button, see if we should show the mini bar instead of the full chrome
			if(!anchor
			&& Prefs.includeNavBar && isAncestor(button, gNavBar)
			&& !trueAttribute(slimChrome.container, 'hover') && !slimChrome.container.hovers) {
				// when the mini bar is already shown, just go ahead and open the panel
				if(trueAttribute(slimChrome.container, 'mini')) {
					// sometimes focusPasswords() is called between this step and the actual popupshowing, which hides the mini bar before the panel can block it,
					// so we make sure the mini bar stays open in this case
					Listeners.add(slimChrome.container, 'willSetMiniChrome', bookmarkedItem);
					
					return true;
				}
				
				// it's not open yet, so open it now
				slimChrome.setMini(true);
				
				// wait for the mini bar to be fully shown before opening the panel
				Timers.init('_doShowEditBookmarkPanel', () => {
					// get the anchor reference again, in case the previous node was lost
					this._doShowEditBookmarkPanel(aItemId, anchor || BookmarkingUI.anchor, aPosition);
				}, Prefs.slimAnimation == 'hinge' ? 300 : 200);
				
				return false;
			}
		
			if(!trueAttribute(slimChrome.container, 'fullWidth')) {
				// re-command the panel to open when the chrome finishes expanding
				Listeners.add(slimChrome.container, 'FinishedSlimChromeWidth', () => {
					// unfortunately this won't happen inside popupFinishedWidth in this case
					if(slimChrome.container.hovers === 1 && Prefs.useMouse && $$('#'+objName+'-slimChrome-container:hover')[0]) {
						slimChrome.setHover(true);
					}
					
					// get the anchor reference again, in case the previous node was lost
					this._doShowEditBookmarkPanel(aItemId, anchor || BookmarkingUI.anchor, aPosition);
				}, false, true);
				
				// expand the chrome
				slimChrome.initialShow(750);
				
				return false;
			}
		}
		
		return true;
	}, Piggyback.MODE_BEFORE);
	
	Listeners.add(window, 'LoadedSkyLights', bookmarkedItem);
	Listeners.add(window, 'UnloadingSkyLights', bookmarkedItem);
	
	if(self.skyLights) {
		bookmarkedItem.init();
	}
};

Modules.UNLOADMODULE = function() {
	Timers.cancel('_doShowEditBookmarkPanel');
	Timers.cancel('bookmarkedItemWillSetMiniChrome');
	
	Piggyback.revert('bookmarkedItem', BookmarkingUI, '_showBookmarkedNotification');
	Piggyback.revert('bookmarkedItem', StarUI, '_doShowEditBookmarkPanel');
	
	Listeners.remove(bookmarkedItem.editPanel, 'AskingForNodeOwner', bookmarkedItem);
	Listeners.remove(bookmarkedItem.editPanel, 'ShouldPanelOpenFullChrome', bookmarkedItem, true);
	Listeners.remove(self.slimChrome && slimChrome.container, 'willSetMiniChrome', bookmarkedItem);
	Listeners.remove(window, 'popupshowing', bookmarkedItem);
	Listeners.remove(window, 'LoadedSkyLights', bookmarkedItem);
	Listeners.remove(window, 'UnloadingSkyLights', bookmarkedItem);
	
	bookmarkedItem.deinit();
};
