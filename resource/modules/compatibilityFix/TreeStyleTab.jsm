Modules.VERSION = '2.0.0';

this.treeStyleTab = {
	handleEvent: function(e) {
		switch(e.type) {
			case 'nsDOMTreeStyleTabTabbarPositionChanged':
			case 'nsDOMTreeStyleTabAutoHideStateChange':
				if(Prefs.slimChrome && typeof(slimChrome) != 'undefined') {
					slimChrome.move();
				}
				break;
			
			case 'WillShowSlimChrome':
				// only show the chrome if the tabs are on top
				if(isAncestor(e.detail.target, TabsToolbar) && TabsToolbar.getAttribute('treestyletab-tabbar-position') != "top") {
					e.preventDefault();
					e.stopPropagation();
				}
				break;
			
			case 'SlimChromeNormalActiveArea':
				if(TabsToolbar.getAttribute('treestyletab-tabbar-position') != 'top') {
					e.preventDefault();
					e.stopPropagation();
				}
				break;
		}
	}
};

Modules.LOADMODULE = function() {
	Listeners.add(window, 'nsDOMTreeStyleTabTabbarPositionChanged', treeStyleTab);
	Listeners.add(window, 'nsDOMTreeStyleTabAutoHideStateChange', treeStyleTab);
	Listeners.add(window, 'WillShowSlimChrome', treeStyleTab, true);
	Listeners.add(window, 'SlimChromeNormalActiveArea', treeStyleTab, true);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'nsDOMTreeStyleTabTabbarPositionChanged', treeStyleTab);
	Listeners.remove(window, 'nsDOMTreeStyleTabAutoHideStateChange', treeStyleTab);
	Listeners.remove(window, 'WillShowSlimChrome', treeStyleTab, true);
	Listeners.remove(window, 'SlimChromeNormalActiveArea', treeStyleTab, true);
};
