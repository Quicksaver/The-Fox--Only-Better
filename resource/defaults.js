// VERSION 1.4.0

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

	adaptSearchBar: true,

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
	[ 'paneExperimental' ]
];

function startAddon(window) {
	prepareObject(window);
	window[objName].Modules.load(objName, true);
}

function onStartup(aReason) {
	Modules.load('compatibilityFix/sandboxFixes');
	Modules.load('keysets');

	// Apply the add-on to every window opened and to be opened
	Windows.callOnAll(startAddon, 'navigator:browser');
	Windows.register(startAddon, 'domwindowopened', 'navigator:browser');
}

function onShutdown(aReason) {
	// remove the add-on from all windows
	Windows.callOnAll(removeObject, null, null, true);

	Modules.unload('keysets');
	Modules.unload('compatibilityFix/sandboxFixes');
}
