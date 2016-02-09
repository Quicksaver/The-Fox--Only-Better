// VERSION 1.0.0

this.__defineGetter__('BrowserSearch', function() { return window.BrowserSearch; });

Modules.LOADMODULE = function() {
	Piggyback.add(objName, BrowserSearch, 'webSearch', function() {
		// This should only happen for existing windows of course (Mac is special, see the original method at
		// http://mxr.mozilla.org/mozilla-central/source/browser/base/content/browser.js#3447)
		if(window.location.href == window.getBrowserURL()) {
			let placement = CustomizableUI.getPlacementOfWidget("search-container");

			// show the chrome if the search bar is somewhere in there, before we do anything else
			if(self.slimChrome
			&& !trueAttribute(slimChrome.container, 'hover')
			&& (placement.area == CustomizableUI.AREA_PANEL || placement.area == CustomizableUI.AREA_NAVBAR || isAncestor(this.searchBar, slimChrome.container))) {
				Listeners.add(window, 'FinishedSlimChromeWidth', () => { this.webSearch(); }, false, true);
				slimChrome.initialShow(1500);
				return false;
			}

			// When trying to focus the search bar and it's hidden, focus the location bar instead.
			if(self.adaptSearchBar && adaptSearchBar.nonEmptyMode) {
				let searchContainer = $("search-container");
				if(searchContainer && searchContainer.parentNode == gNavBar._customizationTarget) {
					adaptSearchBar.focusURLBar();
					return false;
				}
			}
		}
		return true;
	}, Piggyback.MODE_BEFORE);
};

Modules.UNLOADMODULE = function() {
	Piggyback.revert(objName, BrowserSearch, 'webSearch');
};
