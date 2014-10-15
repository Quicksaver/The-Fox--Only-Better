moduleAid.VERSION = '1.1.3';

this.__defineGetter__('BookmarkingUI', function() { return window.BookmarkingUI; });
this.__defineGetter__('StarUI', function() { return window.StarUI; });

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

moduleAid.LOADMODULE = function() {
	// the editBookmarkPanel is only created when first called
	if($('editBookmarkPanel')) {
		listenerAid.add($('editBookmarkPanel'), 'AskingForNodeOwner', holdBookmarkPanel);
	} else {
		listenerAid.add(window, 'popupshowing', setupHoldBookmarkPanel);
	}
	
	piggyback.add('bookmarkedItem', BookmarkingUI, '_showBookmarkedNotification', function() {
		// the chrome should already be opened for this (it's a click on the button), so we don't need to delay or pause this notification,
		// we only need to make sure the chrome doesn't hide until the animation is finished
		if(typeof(slimChromeContainer) != 'undefined'
		&& (isAncestor($('bookmarks-menu-button'), slimChromeContainer) || isAncestor($('bookmarks-menu-button'), overflowList))) {
			initialShowChrome(1500);
		}
		return true;
	}, piggyback.MODE_BEFORE);
	
	// To prevent an issue with the BookarkedItem popup appearing below the browser window, because its anchor is destroyed between the time the popup is opened
	// and the time the chrome expands from mini to full (because the anchor is an anonymous node? I have no idea...), we catch this before the popup is opened, and
	// only continue with the operation after the chrome has expanded.
	// We do the same for when the anchor is the identity box, as in Mac OS X the bookmarked item panel would open outside of the window (no clue why though...)
	piggyback.add('bookmarkedItem', StarUI, '_doShowEditBookmarkPanel', function(aItemId, aAnchorElement, aPosition) {
		// in case the panel will be attached to the star button, check to see if it's placed in our toolbars
		if(typeof(slimChromeContainer) != 'undefined'
		&& isAncestor(aAnchorElement, slimChromeContainer)
		&& !trueAttribute(slimChromeContainer, 'fullWidth')) {
			var anchor = $("page-proxy-favicon");
			if(aAnchorElement != anchor) { anchor = null; }
			
			// re-command the panel to open when the chrome finishes expanding
			listenerAid.add(slimChromeContainer, 'FinishedSlimChromeWidth', function() {
				// unfortunately this won't happen inside popupFinishedWidth in this case
				if(slimChromeContainer.hovers === 1 && prefAid.useMouse && $$('#'+objName+'-slimChrome-container:hover')[0]) {
					setHover(true);
				}
				
				// get the anchor reference again, in case the previous node was lost
				StarUI._doShowEditBookmarkPanel(aItemId, anchor || BookmarkingUI.anchor, aPosition);
			}, false, true);
			
			// expand the chrome
			initialShowChrome(750);
			
			return false;
		}
		
		return true;
	}, piggyback.MODE_BEFORE);
};

moduleAid.UNLOADMODULE = function() {
	piggyback.revert('bookmarkedItem', BookmarkingUI, '_showBookmarkedNotification');
	piggyback.revert('bookmarkedItem', StarUI, '_doShowEditBookmarkPanel');
	
	listenerAid.remove($('editBookmarkPanel'), 'AskingForNodeOwner', holdBookmarkPanel);
	listenerAid.remove(window, 'popupshowing', setupHoldBookmarkPanel);
};
