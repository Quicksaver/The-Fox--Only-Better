moduleAid.VERSION = '1.0.0';

// this module catches the popup event and tells which nodes (triggers) the slimChrome script should check for

this.holdOmnibarMenu = function(e) {
	e.detail = 'omnibar-in-urlbar';
	e.stopPropagation();
};

moduleAid.LOADMODULE = function() {
	listenerAid.add($('omnibar-engine-menu'), 'AskingForNodeOwner', holdOmnibarMenu);
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove($('omnibar-engine-menu'), 'AskingForNodeOwner', holdOmnibarMenu);
};
