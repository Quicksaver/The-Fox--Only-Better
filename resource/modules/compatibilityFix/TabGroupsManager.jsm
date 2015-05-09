Modules.VERSION = '2.0.0';

this.TGM = {
	id: 'TabGroupsManagerToolbar',
	get bar () { return $(this.id); },
	
	handleEvent: function(e) {
		switch(e.type) {
			case 'LoadedSlimChrome':
				this.replace();
				break;
		}
	},
	
	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'groupBarOrdinal':
			case 'tabBarOrdinal':
				this.ordinal();
				break;
		}
	},
	
	replace: function() {
		if(isAncestor(this.bar, slimChrome.container)) {
			gNavToolbox.appendChild(this.bar);
		}
		
		// we don't want a doubled menu item for this toolbar
		var i = gNavToolbox.externalToolbars.indexOf(this.bar);
		if(i > -1) {
			gNavToolbox.externalToolbars.splice(i, 1);
		}
	},
	
	ordinal: function() {
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
	}
};

Modules.LOADMODULE = function() {
	Prefs.setDefaults({ groupBarOrdinal: 100, tabBarOrdinal:101 }, 'tabgroupsmanager');
	slimChromeExceptions.add(TGM.id);
	
	Prefs.listen('groupBarOrdinal', TGM);
	Prefs.listen('tabBarOrdinal', TGM);
	
	Listeners.add(window, 'LoadedSlimChrome', TGM);
	
	TGM.ordinal();
	if(typeof(slimChrome) != 'undefined' && slimChrome.container) {
		TGM.replace();
	}
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'LoadedSlimChrome', TGM);
	
	Prefs.unlisten('groupBarOrdinal', TGM);
	Prefs.unlisten('tabBarOrdinal', TGM);
	
	slimChromeExceptions.delete(TGM.id);
	
	Styles.unload('tgmOrdinal_'+_UUID);
};
