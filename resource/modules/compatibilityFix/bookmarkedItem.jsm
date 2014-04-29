moduleAid.VERSION = '1.0.1';

this.__defineGetter__('BookmarkingUI', function() { return window.BookmarkingUI; });

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
};

moduleAid.UNLOADMODULE = function() {
	BookmarkingUI._showBookmarkedNotification = BookmarkingUI.__showBookmarkedNotification;
	delete BookmarkingUI.__showBookmarkedNotification;
};
