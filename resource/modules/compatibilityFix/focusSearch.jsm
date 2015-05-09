Modules.VERSION = '1.0.4';

this.__defineGetter__('BrowserSearch', function() { return window.BrowserSearch; });

this.focusOmnibar = false; // will be set in omnibar.jsm if loaded
this.focusSearchWhenFinished = false;

this.focusSearchOnWidthFinished = function() {
	if(focusSearchWhenFinished) {
		focusSearchWhenFinished = false;
		BrowserSearch.webSearch();
	}
};

Modules.LOADMODULE = function() {
	// Omnibar nukes this method and replaces it with its own, which is flawed in Australis.
	// So, I have to replace it myself as well, to make sure it works, rather than call _webSearch().
	Piggyback.add('focusSearch', BrowserSearch, 'webSearch', function() {
		// For Mac, opens a new window or focuses an existing window, if necessary.
		if(DARWIN) {
			if(window.location.href != window.getBrowserURL()) {
				var win = window.getTopWin();
				if(win) {
					// If there's an open browser window, it should handle this command
					win.focus();
					win.BrowserSearch.webSearch();
				} else {
					// If there are no open browser windows, open a new one
					var observer = function observer(subject, topic, data) {
						if(subject == win) {
							BrowserSearch.webSearch();
							Services.obs.removeObserver(observer, "browser-delayed-startup-finished");
						}
					};
					win = window.openDialog(window.getBrowserURL(), "_blank", "chrome,all,dialog=no", "about:blank");
					Services.obs.addObserver(observer, "browser-delayed-startup-finished", false);
				}
				return;
			}
		}
		
		let openSearchPageIfFieldIsNotActive = function(aSearchBar) {
			if(!aSearchBar || document.activeElement != aSearchBar.textbox.inputField) {
				if(!focusOmnibar) {
					window.openUILinkIn("about:home", "current");
				} else {
					window.openLocation();
				}
			}
		};
		
		let searchBar = this.searchBar;
		let placement = CustomizableUI.getPlacementOfWidget("search-container");
		
		if(placement) {
			// show the chrome if the search bar is somewhere in there, before we do anything else
			if(typeof(slimChrome) != 'undefined'
			&& !trueAttribute(slimChrome.container, 'hover')
			&& (placement.area == CustomizableUI.AREA_PANEL || placement.area == CustomizableUI.AREA_NAVBAR || isAncestor(searchBar, slimChrome.container))) {
				focusSearchWhenFinished = true;
				slimChrome.initialShow(1500);
				return;
			}
			
			let focusSearchBar = () => {
				searchBar = this.searchBar;
				searchBar.select();
				openSearchPageIfFieldIsNotActive(searchBar);
			};
			
			if(placement.area == CustomizableUI.AREA_PANEL) {
				// The panel is not constructed until the first time it is shown.
				window.PanelUI.show().then(focusSearchBar);
				return;
			}
			
			if(placement.area == CustomizableUI.AREA_NAVBAR && searchBar && searchBar.parentNode.getAttribute("overflowedItem") == "true") {
				let navBar = document.getElementById(CustomizableUI.AREA_NAVBAR);
				navBar.overflowable.show().then(() => {
					focusSearchBar();
				});
				return;
			}
		}
		
		if(searchBar) {
			// we unload when fullScreen, so this isn't needed
			//if(window.fullScreen)
			//	window.FullScreen.mouseoverToggle(true);
			searchBar.select();
		}
		openSearchPageIfFieldIsNotActive(searchBar);
	});
	
	Listeners.add(window, 'FinishedSlimChromeWidth', focusSearchOnWidthFinished);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'FinishedSlimChromeWidth', focusSearchOnWidthFinished);
	
	Piggyback.revert('focusSearch', BrowserSearch, 'webSearch');
};
