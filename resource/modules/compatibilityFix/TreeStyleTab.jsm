Modules.VERSION = '1.1.1';

this.listenForTreeStyleTab = function() {
	if(Prefs.slimChrome && typeof(moveSlimChrome) != 'undefined') {
		moveSlimChrome();
	}
};

// only show the chrome if the tabs are on top
this.noShowOnTreeStyleTab = function(e) {
	if(isAncestor(e.detail.target, TabsToolbar) && TabsToolbar.getAttribute('treestyletab-tabbar-position') != "top") {
		e.preventDefault();
		e.stopPropagation();
	}
};

this.extendActiveAreaOnTreeStyleTab = function(e) {
	if(TabsToolbar.getAttribute('treestyletab-tabbar-position') != 'top') {
		e.preventDefault();
		e.stopPropagation();
	}
};

Modules.LOADMODULE = function() {
	Listeners.add(window, 'nsDOMTreeStyleTabTabbarPositionChanged', listenForTreeStyleTab);
	Listeners.add(window, 'nsDOMTreeStyleTabAutoHideStateChange', listenForTreeStyleTab);
	Listeners.add(window, 'WillShowSlimChrome', noShowOnTreeStyleTab, true);
	Listeners.add(window, 'SlimChromeNormalActiveArea', extendActiveAreaOnTreeStyleTab, true);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'nsDOMTreeStyleTabTabbarPositionChanged', listenForTreeStyleTab);
	Listeners.remove(window, 'nsDOMTreeStyleTabAutoHideStateChange', listenForTreeStyleTab);
	Listeners.remove(window, 'WillShowSlimChrome', noShowOnTreeStyleTab, true);
	Listeners.remove(window, 'SlimChromeNormalActiveArea', extendActiveAreaOnTreeStyleTab, true);
};
