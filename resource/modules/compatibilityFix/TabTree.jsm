// VERSION 1.0.0

this.tabTree = {
	handleEvent: function(e) {
		switch(e.type) {
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
	Listeners.add(window, 'SlimChromeNormalActiveArea', tabTree, true);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'SlimChromeNormalActiveArea', tabTree, true);
};
