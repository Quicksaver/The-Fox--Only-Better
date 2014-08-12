moduleAid.VERSION = '1.1.0';

this.listenForTreeStyleTab = function() {
	if(prefAid.slimChrome && typeof(moveSlimChrome) != 'undefined') {
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

moduleAid.LOADMODULE = function() {
	listenerAid.add(window, 'nsDOMTreeStyleTabTabbarPositionChanged', listenForTreeStyleTab);
	listenerAid.add(window, 'nsDOMTreeStyleTabAutoHideStateChange', listenForTreeStyleTab);
	listenerAid.add(window, 'WillShowSlimChrome', noShowOnTreeStyleTab, true);
	listenerAid.add(window, 'SlimChromeNormalActiveArea', extendActiveAreaOnTreeStyleTab, true);
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(window, 'nsDOMTreeStyleTabTabbarPositionChanged', listenForTreeStyleTab);
	listenerAid.remove(window, 'nsDOMTreeStyleTabAutoHideStateChange', listenForTreeStyleTab);
	listenerAid.remove(window, 'WillShowSlimChrome', noShowOnTreeStyleTab, true);
	listenerAid.remove(window, 'SlimChromeNormalActiveArea', extendActiveAreaOnTreeStyleTab, true);
};
