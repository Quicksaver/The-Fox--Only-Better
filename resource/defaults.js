var defaultsVersion = '1.1.6';
var objName = 'theFoxOnlyBetter';
var objPathString = 'thefoxonlybetter';
var prefList = {
	slimChrome: true,
	miniOnAllInput: false,
	
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
	fillVersion(window.document.getElementById('addonVersion'));
}

function onStartup(aReason) {
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
}
