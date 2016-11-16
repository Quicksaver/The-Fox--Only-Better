/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 2.0.2

this.treeStyleTab = {
	handleEvent: function(e) {
		switch(e.type) {
			case 'nsDOMTreeStyleTabTabbarPositionChanged':
			case 'nsDOMTreeStyleTabAutoHideStateChange':
				if(Prefs.slimChrome && self.slimChrome && slimChrome.container) {
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

			case 'SlimChromeUseWholeWidth': {
				let position = TabsToolbar && TabsToolbar.getAttribute('treestyletab-tabbar-position');
				if(position == 'left' || position == 'right') {
					e.preventDefault();
					e.stopPropagation();
				}
				break;
			}
		}
	},

	attrWatcher: function() {
		if(self.slimChrome && slimChrome.container) {
			slimChrome.delayMove();
		}
	}
};

Modules.LOADMODULE = function() {
	Listeners.add(window, 'nsDOMTreeStyleTabTabbarPositionChanged', treeStyleTab);
	Listeners.add(window, 'nsDOMTreeStyleTabAutoHideStateChange', treeStyleTab);
	Listeners.add(window, 'WillShowSlimChrome', treeStyleTab, true);
	Listeners.add(window, 'SlimChromeUseWholeWidth', treeStyleTab, true);

	Watchers.addAttributeWatcher(gBrowser.treeStyleTab.splitter, 'state', treeStyleTab, false, false);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'nsDOMTreeStyleTabTabbarPositionChanged', treeStyleTab);
	Listeners.remove(window, 'nsDOMTreeStyleTabAutoHideStateChange', treeStyleTab);
	Listeners.remove(window, 'WillShowSlimChrome', treeStyleTab, true);
	Listeners.remove(window, 'SlimChromeUseWholeWidth', treeStyleTab, true);
	Watchers.removeAttributeWatcher(gBrowser.treeStyleTab.splitter, 'state', treeStyleTab, false, false);
};
