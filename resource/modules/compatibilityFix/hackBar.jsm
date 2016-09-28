/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 1.0.2

Modules.LOADMODULE = function() {
	slimChromeExceptions.add('hackBarToolbar');

	// we move the hackBar to a place where it won't be sent into our hiding container
	$('browser-bottombox').appendChild($('hackBarToolbar'));
};

Modules.UNLOADMODULE = function() {
	slimChromeExceptions.delete('hackBarToolbar');

	gNavToolbox.appendChild($('hackBarToolbar'));
};
