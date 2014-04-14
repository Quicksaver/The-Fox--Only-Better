var defaultsVersion = '1.1.1';
var objName = 'navigatorSupercharger';
var objPathString = 'navigatorsupercharger';
var prefList = {
	lessChrome: true,
	miniOnAllInput: false
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
