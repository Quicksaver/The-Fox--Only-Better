/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 1.0.2

Modules.LOADMODULE = function() {
	// change the default style and animation for the FT DeepDark theme, because it looks awesome there
	Prefs.setDefaults({
		slimStyle: 'compact',
		slimAnimation: 'slidedown'
	});

	Styles.load('FTDeepDark', 'FTDeepDark');
};

Modules.UNLOADMODULE = function() {
	Styles.unload('FTDeepDark');
};
