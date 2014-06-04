moduleAid.VERSION = '1.1.2';

this.__defineGetter__('BookmarkingUI', function() { return window.BookmarkingUI; });
this.__defineGetter__('StarUI', function() { return window.StarUI; });

moduleAid.LOADMODULE = function() {
	BookmarkingUI.__showBookmarkedNotification = BookmarkingUI._showBookmarkedNotification;
	BookmarkingUI._showBookmarkedNotification = function() {
		// the chrome should already be opened for this (it's a click on the button), so we don't need to delay or pause this notification,
		// we only need to make sure the chrome doesn't hide until the animation is finished
		if(typeof(slimChromeContainer) != 'undefined'
		&& (isAncestor($('bookmarks-menu-button'), slimChromeContainer) || isAncestor($('bookmarks-menu-button'), overflowList))) {
			initialShowChrome(1500);
		}
		this.__showBookmarkedNotification();
	};
	
	// To prevent an issue with the BookarkedItem popup appearing below the browser window, because its anchor is destroyed between the time the popup is opened
	// and the time the chrome expands from mini to full (because the anchor is an anonymous node? I have no idea...), we catch this before the popup is opened, and
	// only continue with the operation after the chrome has expanded.
	// We do the same for when the anchor is the identity box, as in Mac OS X the bookmarked item panel would open outside of the window (no clue why though...)
	StarUI.__doShowEditBookmarkPanel = StarUI._doShowEditBookmarkPanel;
	StarUI._doShowEditBookmarkPanel = function(aItemId, aAnchorElement, aPosition) {
		var identityAnchor = $("page-proxy-favicon");
		
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
			
			return;
		}
		
		this.__doShowEditBookmarkPanel(aItemId, aAnchorElement, aPosition);
	};
};

moduleAid.UNLOADMODULE = function() {
	BookmarkingUI._showBookmarkedNotification = BookmarkingUI.__showBookmarkedNotification;
	delete BookmarkingUI.__showBookmarkedNotification;
	
	StarUI._doShowEditBookmarkPanel = StarUI.__doShowEditBookmarkPanel;
	delete StarUI.__doShowEditBookmarkPanel;
};
