/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 2.0.2

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

		let sscode = '\
			@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n\
			@-moz-document url("'+document.baseURI+'") {\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-slimmer,\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-container {\n\
				  -moz-box-ordinal-group: '+ordinal+';\n\
				}\n\
			}';

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
