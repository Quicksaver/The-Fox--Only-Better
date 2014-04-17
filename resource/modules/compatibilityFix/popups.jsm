moduleAid.VERSION = '1.0.5';

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

moduleAid.LOADMODULE = function() {
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
};
