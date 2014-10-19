var defaultsVersion = '1.2.2';
var objName = 'theFoxOnlyBetter';
var objPathString = 'thefoxonlybetter';
var prefList = {
	slimChrome: true,
	miniOnAllInput: false,
	miniOnTabSelect: true,
	includeNavBar: true,
	useMouse: true,
	delayIn: 75,
	delayOut: 250,
	slimStyle: 'australis',
	slimAnimation: 'rollout',
	
	skyLights: true,
	skyLightsHide: true,
	
	slimChromeKeycode: 'VK_F9',
	slimChromeAccel: false,
	slimChromeShift: false,
	slimChromeAlt: false,
	
	// for the what's new tab, it's better they're here so they're automatically carried over to content
	lastVersionNotify: '0',
	notifyOnUpdates: true
};

function startAddon(window) {
	prepareObject(window);
	window[objName].Modules.load(objName, true);
}

function startPreferences(window) {
	replaceObjStrings(window.document);
	preparePreferences(window);
	window[objName].Modules.load('options');
}

function onStartup(aReason) {
	Modules.load('compatibilityFix/sandboxFixes');
	Modules.load('keysets');
	
	// Apply the add-on to every window opened and to be opened
	Windows.callOnAll(startAddon, 'navigator:browser');
	Windows.register(startAddon, 'domwindowopened', 'navigator:browser');
	
	// Apply the add-on to every preferences window opened and to be opened
	Windows.callOnAll(startPreferences, null, "chrome://"+objPathString+"/content/options.xul");
	Windows.register(startPreferences, 'domwindowopened', null, "chrome://"+objPathString+"/content/options.xul");
	Browsers.callOnAll(startPreferences, "chrome://"+objPathString+"/content/options.xul");
	Browsers.register(startPreferences, 'pageshow', "chrome://"+objPathString+"/content/options.xul");
}

function onShutdown(aReason) {
	// remove the add-on from all windows
	Windows.callOnAll(removeObject, null, null, true);
	Browsers.callOnAll(removeObject, null, true);
	
	Modules.unload('keysets');
	Modules.unload('compatibilityFix/sandboxFixes');
}
