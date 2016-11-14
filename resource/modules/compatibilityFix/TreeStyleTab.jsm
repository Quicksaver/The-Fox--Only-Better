/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 2.0.1

this.treeStyleTab = {
	handleEvent: function(e) {
		switch(e.type) {
			case 'nsDOMTreeStyleTabTabbarPositionChanged':
			case 'nsDOMTreeStyleTabAutoHideStateChange':
				if(Prefs.slimChrome && typeof(slimChrome) != 'undefined' && slimChrome.container) {
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
		}
	}
};

Modules.LOADMODULE = function() {
	Listeners.add(window, 'nsDOMTreeStyleTabTabbarPositionChanged', treeStyleTab);
	Listeners.add(window, 'nsDOMTreeStyleTabAutoHideStateChange', treeStyleTab);
	Listeners.add(window, 'WillShowSlimChrome', treeStyleTab, true);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'nsDOMTreeStyleTabTabbarPositionChanged', treeStyleTab);
	Listeners.remove(window, 'nsDOMTreeStyleTabAutoHideStateChange', treeStyleTab);
	Listeners.remove(window, 'WillShowSlimChrome', treeStyleTab, true);
};
