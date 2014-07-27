moduleAid.VERSION = '1.0.0';

// this is only a half fix, as I can't access the loadQSB method in the binding's observer;
// this fix is much better done inside QSB itself, so I may remove this entirely in the future if QSB's developer does it

this.fixQuickSearchBar = function() {
	var quickSearchBarMain = window.quickSearchBarMain;
	Cc["@mozilla.org/browser/search-service;1"].getService(Ci.nsIBrowserSearchService).init(function() { quickSearchBarMain.load(); });
};

moduleAid.LOADMODULE = function() {
	listenerAid.add(window, 'SlimChromeMovedNavBar', fixQuickSearchBar);
	
	// make sure the fix is loaded in case this comes after the overlay for some reason
	fixQuickSearchBar();
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(window, 'SlimChromeMovedNavBar', fixQuickSearchBar);
	
	// make sure the fix is loaded in case this comes after the overlay for some reason
	fixQuickSearchBar();
};
