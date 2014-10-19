Modules.VERSION = '1.0.2';

// this module catches the popup event and tells which nodes (triggers) the slimChrome script should check for

this.holdOmnibarMenu = function(e) {
	e.detail = 'omnibar-in-urlbar';
	e.stopPropagation();
};

// for the focusSearch module
this.focusOmnibar = true;

Modules.LOADMODULE = function() {
	Listeners.add($('omnibar-engine-menu'), 'AskingForNodeOwner', holdOmnibarMenu);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove($('omnibar-engine-menu'), 'AskingForNodeOwner', holdOmnibarMenu);
};
