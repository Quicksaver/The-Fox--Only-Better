/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 1.4.11

objName = 'theFoxOnlyBetter';
objPathString = 'thefoxonlybetter';
addonUUID = '9cb2c7a0-5224-11e4-916c-0800200c9a66';

addonUris = {
	homepage: 'https://addons.mozilla.org/firefox/addon/the-fox-only-better/',
	support: 'https://github.com/Quicksaver/The-Fox--Only-Better/issues',
	fullchangelog: 'https://github.com/Quicksaver/The-Fox--Only-Better/commits/master',
	email: 'mailto:quicksaver@gmail.com',
	profile: 'https://addons.mozilla.org/firefox/user/quicksaver/',
	api: 'http://fasezero.com/addons/api/thefoxonlybetter',
	development: 'http://fasezero.com/addons/'
};

prefList = {
	slimChrome: true,
	miniOnAllInput: false,
	miniOnChangeLocation: true,
	miniOnTabSelect: false,
	miniOnPinnedTabs: false,
	includeNavBar: true,
	useMouse: true,
	delayIn: 75,
	delayOut: 250,
	slimStyle: 'australis',
	slimAnimation: 'rollout',
	slimOnlyOverContent: false, // hidden pref to enable old Slim Chrome look, with this enabled the toolbars won't cover the sidebar

	skyLights: true,
	skyLightsHide: true,
	skyLightsPlacements: '',

	awesomerURLBar: true,

	suggestHistory: true,
	suggestBookmark: true,
	suggestOpenpage: true,
	suggestSearches: true,
	suggestSearchesEnabled: true,
	suggestSearchesInPB: false,

	maxSuggest: 12,
	maxSuggestHistory: 12,
	maxSuggestBookmark: 12,
	maxSuggestOpenpage: 12,
	maxSuggestSearches: 5,

	awesomerStyle: "frog",
	awesomerColor: "default",
	richMaxSearchRows: 6,
	richMaxDropMarkerRows: 14,
	slimMaxSearchRows: 10,
	slimMaxDropMarkerRows: 24,
	frogMaxSearchRows: 10,
	frogMaxDropMarkerRows: 24,

	searchEnginesInURLBar: true,
	adaptSearchBar: true,
	showOnlyNonEmptySearchBar: true,
	rightClickEngines: 1,

	// for internal use
	migratedKeysets: false,

	slimChromeKeycode: 'VK_F9',
	slimChromeAccel: false,
	slimChromeShift: false,
	slimChromeAlt: false,
	slimChromeCtrl: false
};

// If we're initializing in a content process, we don't care about the rest
if(isContent) { throw 'isContent'; }

paneList = [
	[ 'paneSlimChrome', true ],
	[ 'paneSkyLights', true ],
	[ 'paneAwesomeBar', true ]
];

function startAddon(window) {
	prepareObject(window);
	window[objName].Modules.load(objName, true);
}

function onStartup(aReason) {
	Modules.load('compatibilityFix/sandboxFixes');
	Modules.load('keysets');
	Modules.load('UnifiedComplete');

	// Apply the add-on to every window opened and to be opened
	Windows.callOnAll(startAddon, 'navigator:browser');
	Windows.register(startAddon, 'domwindowopened', 'navigator:browser');
}

function onShutdown(aReason) {
	// remove the add-on from all windows
	Windows.callOnAll(removeObject, null, null, true);

	Modules.unload('UnifiedComplete');
	Modules.unload('keysets');
	Modules.unload('compatibilityFix/sandboxFixes');
}
