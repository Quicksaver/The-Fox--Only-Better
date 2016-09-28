/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
