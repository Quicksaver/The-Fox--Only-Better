var defaultsVersion = '1.1.16';
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
	
	lwthemebgImage: '',
	lwthemebgWidth: 0,
	lwthemecolor: '',
	lwthemebgColor: ''
};

function startAddon(window) {
	prepareObject(window);
	window[objName].moduleAid.load(objName, true);
}

function startConditions(aReason) {
	return true;
}

function startPreferences(window) {
	replaceObjStrings(window.document);
	preparePreferences(window);
	window[objName].moduleAid.load('options');
}

function onStartup(aReason) {
	moduleAid.load('compatibilityFix/sandboxFixes');
	moduleAid.load('keysets');
	
	// Apply the add-on to every window opened and to be opened
	windowMediator.callOnAll(startAddon, 'navigator:browser');
	windowMediator.register(startAddon, 'domwindowopened', 'navigator:browser');
	
	// Apply the add-on to every preferences window opened and to be opened
	windowMediator.callOnAll(startPreferences, null, "chrome://"+objPathString+"/content/options.xul");
	windowMediator.register(startPreferences, 'domwindowopened', null, "chrome://"+objPathString+"/content/options.xul");
	browserMediator.callOnAll(startPreferences, "chrome://"+objPathString+"/content/options.xul");
	browserMediator.register(startPreferences, 'pageshow', "chrome://"+objPathString+"/content/options.xul");
}

function onShutdown(aReason) {
	// remove the add-on from all windows
	windowMediator.callOnAll(removeObject, null, null, true);
	browserMediator.callOnAll(removeObject, null, true);
	
	moduleAid.unload('keysets');
	moduleAid.unload('compatibilityFix/sandboxFixes');
}
