moduleAid.VERSION = '1.0.0';

this.listenForTreeStyleTab = function() {
	if(prefAid.lessChrome && typeof(moveLessChrome) != 'undefined') {
		moveLessChrome();
	}
};

moduleAid.LOADMODULE = function() {
	listenerAid.add(window, 'nsDOMTreeStyleTabTabbarPositionChanged', listenForTreeStyleTab);
	listenerAid.add(window, 'nsDOMTreeStyleTabAutoHideStateChange', listenForTreeStyleTab);
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(window, 'nsDOMTreeStyleTabTabbarPositionChanged', listenForTreeStyleTab);
	listenerAid.remove(window, 'nsDOMTreeStyleTabAutoHideStateChange', listenForTreeStyleTab);
};
