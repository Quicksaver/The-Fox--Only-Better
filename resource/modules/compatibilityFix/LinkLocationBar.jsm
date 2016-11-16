/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 2.1.0

this.__defineGetter__('LinkLocationBar', function() { return window.LinkLocationBar; });
this.__defineGetter__('gURLBar', function() { return window.gURLBar; });

this.LLB = {
	handleEvent: function(e) {
		switch(e.type) {
			case 'LoadedSlimChrome':
			case 'UnloadedSlimChrome':
				this.reapply();
				break;

			case 'UnloadingSlimChrome':
				Listeners.remove(slimChrome.container, 'mouseover', this, true);
				break;

			case 'mouseover':
				if(!trueAttribute(slimChrome.container, 'altState')
				|| !trueAttribute(slimChrome.container, 'onlyURLBar')
				|| trueAttribute(slimChrome.container, 'hover')) {
					return;
				}

				e.preventDefault();
				e.stopPropagation();
				slimChrome.miniSideSwitch(!trueAttribute(slimChrome.container, 'miniSideSwitch'));
				break;

			case 'MovedSlimChrome':
				this.resize();
				break;
		}
	},

	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'includeNavBar':
				Timers.init('LLBreApplyPrefs', function() { LinkLocationBar.applyPrefs(); }, 250);
				break;
		}
	},

	attrWatcher: function() {
		if(!Prefs.includeNavBar) { return; }
		if(!self.slimChrome) { return; }
		if(self.popups && popups.holdMini) { return; }

		// show the link hover state immediately
		if(gURLBar.getAttribute('overlinkstate') == 'showing') {
			Timers.cancel('LBBlistener');
			slimChrome.setMini(true, true);
		// see if a password field is focused, if yes show the url immediately
		} else if(slimChrome.focusPasswords()) {
			slimChrome.miniSideSwitch(false);
		// if not let it hide normally
		} else {
			Timers.init('LBBlistener', function() {
				slimChrome.miniSideSwitch(false);
			}, 400);
		}
	},

	// its preferences are lost when slimChrome un/loads
	reapply: function() {
		LinkLocationBar.applyPrefs();

		try { Listeners.add(slimChrome.container, 'mouseover', this, true); }
		catch(ex) {}
	},

	resize: function() {
		let sscode = '\
			@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n\
			@-moz-document url("'+document.baseURI+'") {\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-container[onlyURLBar][altState]:not([hover]) {\n\
					max-width: ' + Math.floor(slimChrome.lastStyle.width /2) + 'px;\n\
				}\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-container[onlyURLBar][altState]:not([hover]) [anonid="over-link-box"] {\n\
					max-width: ' + (Math.floor(slimChrome.lastStyle.width /2) -16) + 'px !important;\n\
				}\n\
			}';

		Styles.load('LLBresize_'+_UUID, sscode, true);
	}
};

Modules.LOADMODULE = function() {
	Styles.load('LinkLocationBar', 'LinkLocationBar');

	Listeners.add(window, 'LoadedSlimChrome', LLB);
	Listeners.add(window, 'UnloadingSlimChrome', LLB);
	Listeners.add(window, 'UnloadedSlimChrome', LLB);
	Listeners.add(window, 'MovedSlimChrome', LLB);
	Prefs.listen('includeNavBar', LLB);

	Watchers.addAttributeWatcher(gURLBar, 'overlinkstate', LLB, false, false);

	Piggyback.add('LinkLocationBar', gURLBar, '_updateOverLink', function(aURL) {
		Timers.cancel('_updateOverLink');

		// just throwing a value out there, basically anything that's too small means the chrome is still hidden, so this value wouldn't be the actual mini's width to be used,
		// in turn the text would not be colored correctly (it would not distinguish the domain from the rest) because it truncates it when the width is not enough
		if(this._shell.boxObject.width < 150) {
			Timers.init('_updateOverLink', function() { gURLBar._updateOverLink(aURL); }, 50);
			return false;
		}

		return true;
	}, Piggyback.MODE_BEFORE);

	if(typeof(slimChrome) != 'undefined' && slimChrome.lastStyle) {
		LLB.resize();
	}

	LLB.reapply();
};

Modules.UNLOADMODULE = function() {
	Piggyback.revert('LinkLocationBar', gURLBar, '_updateOverLink');
	Watchers.removeAttributeWatcher(gURLBar, 'overlinkstate', LLB, false, false);
	Listeners.remove(window, 'LoadedSlimChrome', LLB);
	Listeners.remove(window, 'UnloadingSlimChrome', LLB);
	Listeners.remove(window, 'UnloadedSlimChrome', LLB);
	Listeners.remove(window, 'MovedSlimChrome', LLB);
	Listeners.remove(self.slimChrome && slimChrome.container, 'mouseover', this, true);
	Prefs.unlisten('includeNavBar', LLB);

	Styles.unload('LLBresize_'+_UUID);

	if(UNLOADED) {
		Styles.unload('LinkLocationBar');
	}
};
