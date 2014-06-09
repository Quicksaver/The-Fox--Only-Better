moduleAid.VERSION = '1.0.1';

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
	var ordinal = Math.max(prefAid.groupBarOrdinal, prefAid.tabBarOrdinal) +1;
	
	styleAid.unload('tgmOrdinal_'+_UUID);
	
	var sscode = '/*The Fox, only better CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-slimmer,\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-container {\n';
	sscode += '	  -moz-box-ordinal-group: '+ordinal+';\n';
	sscode += '	}\n';
	sscode += '}';
	
	styleAid.load('tgmOrdinal_'+_UUID, sscode, true);
};

moduleAid.LOADMODULE = function() {
	prefAid.setDefaults({ groupBarOrdinal: 100, tabBarOrdinal:101 }, 'tabgroupsmanager');
	slimChromeExceptions.push(tgmGroupBarId);
	
	prefAid.listen('groupBarOrdinal', tgmOrdinal);
	prefAid.listen('tabBarOrdinal', tgmOrdinal);
	
	listenerAid.add(window, 'LoadedSlimChrome', tgmReplaceBar);
	
	tgmOrdinal();
	if(typeof(slimChromeContainer) != 'undefined' && slimChromeContainer) {
		tgmReplaceBar();
	}
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(window, 'LoadedSlimChrome', tgmReplaceBar);
	
	prefAid.unlisten('groupBarOrdinal', tgmOrdinal);
	prefAid.unlisten('tabBarOrdinal', tgmOrdinal);
	
	slimChromeExceptions.splice(slimChromeExceptions.indexOf(tgmGroupBarId), 1);
	
	styleAid.unload('tgmOrdinal_'+_UUID);
};
