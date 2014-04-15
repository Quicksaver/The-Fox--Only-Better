var defaultsVersion = '1.1.4';
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

function onStartup(aReason) {
	// Apply the add-on to every window opened and to be opened
	windowMediator.callOnAll(startAddon, 'navigator:browser');
	windowMediator.register(startAddon, 'domwindowopened', 'navigator:browser');
}

function onShutdown(aReason) {
	// remove the add-on from all windows
	windowMediator.callOnAll(removeObject, null, null, true);
}
