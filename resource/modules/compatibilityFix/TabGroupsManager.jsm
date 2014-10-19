Modules.VERSION = '1.0.3';

this.tgmGroupBarId = 'TabGroupsManagerToolbar';
this.__defineGetter__('tgmGroupBar', function() { return $(tgmGroupBarId); });

this.tgmReplaceBar = function() {
	if(isAncestor(tgmGroupBar, slimChromeContainer)) {
		gNavToolbox.appendChild(tgmGroupBar);
	}
	
	// we don't want a doubled menu item for this toolbar
	var i = gNavToolbox.externalToolbars.indexOf(tgmGroupBar);
	if(i > -1) {
		gNavToolbox.externalToolbars.splice(i, 1);
	}
};

this.tgmOrdinal = function() {
	var ordinal = Math.max(Prefs.groupBarOrdinal, Prefs.tabBarOrdinal) +1;
	
	var sscode = '/*The Fox, only better CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-slimmer,\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-container {\n';
	sscode += '	  -moz-box-ordinal-group: '+ordinal+';\n';
	sscode += '	}\n';
	sscode += '}';
	
	Styles.load('tgmOrdinal_'+_UUID, sscode, true);
};

Modules.LOADMODULE = function() {
	Prefs.setDefaults({ groupBarOrdinal: 100, tabBarOrdinal:101 }, 'tabgroupsmanager');
	slimChromeExceptions.push(tgmGroupBarId);
	
	Prefs.listen('groupBarOrdinal', tgmOrdinal);
	Prefs.listen('tabBarOrdinal', tgmOrdinal);
	
	Listeners.add(window, 'LoadedSlimChrome', tgmReplaceBar);
	
	tgmOrdinal();
	if(typeof(slimChromeContainer) != 'undefined' && slimChromeContainer) {
		tgmReplaceBar();
	}
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'LoadedSlimChrome', tgmReplaceBar);
	
	Prefs.unlisten('groupBarOrdinal', tgmOrdinal);
	Prefs.unlisten('tabBarOrdinal', tgmOrdinal);
	
	slimChromeExceptions.splice(slimChromeExceptions.indexOf(tgmGroupBarId), 1);
	
	Styles.unload('tgmOrdinal_'+_UUID);
};
