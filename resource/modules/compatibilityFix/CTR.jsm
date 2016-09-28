/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 1.0.0

this.CTRbackForward = function() {
	Styles.loadIf('CTRbackForward', 'CTRbackForward', false, Prefs.backforward);
};

Modules.LOADMODULE = function() {
	Prefs.setDefaults({ backforward: false }, 'classicthemerestorer');

	Prefs.listen('backforward', CTRbackForward);
	CTRbackForward();
};

Modules.UNLOADMODULE = function() {
	Prefs.unlisten('backforward', CTRbackForward);
	Styles.unload('CTR');
};
