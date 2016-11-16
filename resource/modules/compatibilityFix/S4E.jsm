/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 2.1.0

this.S4E = {
	activeProgress: false,

	get progress () { return $('urlbar-progress-alt'); },

	handleEvent: function(e) {
		switch(e.type) {
			// focusing forces a Top style, but bluring sometimes doesn't revert back to the original style,
			// I have no idea how _pmpack is lost though
			case 'LoadedSlimChrome':
			case 'UnloadedSlimChrome':
				this.reapply();
				// no break; continue to 'blur'

			case 'blur':
			case 'focus':
				if(gURLBar._pmpack === null) {
					switch(Prefs['progress.urlbar']) {
						case 1:
							gURLBar.pmpack = "end";
							break;
						case 2:
							gURLBar.pmpack = "begin";
							break;
						case 3:
							gURLBar.pmpack = "center";
							break;
						default: break;
					}
				}
				break;

			case 'WillSetMiniChrome':
				if(this.activeProgress && !e.detail) {
					e.preventDefault();
					e.stopPropagation();
				}
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
			case "status.linkOver":
				this.toggleLinkOver();
				break;
		}
	},

	attrWatcher: function() {
		if(!Prefs.includeNavBar) { return; }

		this.activeProgress = this.progress && !this.progress.hidden && !this.progress.collapsed;

		if(typeof(slimChrome) != 'undefined') {
			if(this.activeProgress) {
				Timers.cancel('S4Elistener');
				// show immediately when progress bar becomes visible
				slimChrome.setMini(true);
			} else {
				// don't hide immediately when page load ends
				Timers.init('setMini', () => {
					// see if a password field is focused, if yes show the url immediately
					if(slimChrome.focusPasswords()) {
						slimChrome.miniSideSwitch(false);
					}
					// if not let it hide normally
					else if(!slimChrome.onTabSelect()) {
						Timers.init('S4Elistener', function() {
							slimChrome.miniSideSwitch(false);
						}, 400);
					}
				}, 2000);
			}
		}
	},

	checkLinkOver: function(aURL) {
		if(Prefs['status.linkOver'] != 2 || !self.slimChrome || !slimChrome.container) { return; }

		if(self.popups && popups.holdMini) { return; }

		if(gURLBar._overLinkBox.getAttribute('type') == 'overLink' && aURL) {
			Timers.cancel('S4Elistener');
			slimChrome.quickShowMini(true);

			// Don't truncate the shown url to the "current" dimensions, because they won't take into account the actual size of the mini bar until now.
			gURLBar.updateOverLinkLayout();

			// Even with the above, S4E often truncates it to two thirds of the available width. So...
			gURLBar._overLinkBox.maxWidth = gURLBar._overLinkLayer.boxObject.width;
		}
		// see if a password field is focused, if yes show the url immediately
		else if(slimChrome.focusPasswords()) {
			slimChrome.miniSideSwitch(false);
		}
		// if not let it hide normally
		else if(!slimChrome.onTabSelect()) {
			Timers.init('S4Elistener', function() {
				if(typeof(slimChrome) != 'undefined') {
					slimChrome.miniSideSwitch(false);
				}
			}, 400);
		}
	},

	toggleLinkOver: function(unload) {
		if(!unload && Prefs['status.linkOver']) {
			Piggyback.add("S4E", gURLBar, "setStatus", (aURL) => {
				this.checkLinkOver(aURL);
			}, Piggyback.MODE_AFTER);
		}
		else {
			Piggyback.revert("S4E", gURLBar, "setStatus");
			slimChrome.hideMiniInABit();
		}
	},

	reapply: function() {
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
	},

	init: function() {
		Prefs.setDefaults({
			['progress.urlbar']: 1,
			['status.linkOver']: 1
		}, 'caligon.s4e');

		Styles.load('S4E', 'S4E');

		Watchers.addAttributeWatcher(S4E.progress, 'hidden', this, false, false);
		Watchers.addAttributeWatcher(S4E.progress, 'collapsed', this, false, false);
		Watchers.addAttributeWatcher(S4E.progress, 'value', this, false, false);

		Listeners.add(window, 'LoadedSlimChrome', this);
		Listeners.add(window, 'UnloadedSlimChrome', this);
		Listeners.add(window, 'WillSetMiniChrome', this, true);
		Listeners.add(window, 'UnloadingSlimChrome', this);
		Listeners.add(window, 'MovedSlimChrome', this);
		Listeners.add(gURLBar, 'blur', this, true);
		Listeners.add(gURLBar, 'focus', this, true);

		// Show the mini bar when showing links or the status text in the location bar
		this.toggleLinkOver();
		this.reapply();

		if(self.slimChrome && slimChrome.lastStyle) {
			this.resize();
		}
	},

	uninit: function() {
		Watchers.removeAttributeWatcher(S4E.progress, 'hidden', this, false, false);
		Watchers.removeAttributeWatcher(S4E.progress, 'collapsed', this, false, false);
		Watchers.removeAttributeWatcher(S4E.progress, 'value', this, false, false);

		Listeners.remove(window, 'LoadedSlimChrome', this);
		Listeners.remove(window, 'UnloadedSlimChrome', this);
		Listeners.remove(window, 'WillSetMiniChrome', this, true);
		Listeners.remove(window, 'UnloadingSlimChrome', this);
		Listeners.remove(window, 'MovedSlimChrome', this);
		Listeners.remove(gURLBar, 'blur', this, true);
		Listeners.remove(gURLBar, 'focus', this, true);
		Listeners.remove(self.slimChrome && slimChrome.container, 'mouseover', this, true);

		this.toggleLinkOver(true);

		Styles.unload('S4Eresize_'+_UUID);
		if(UNLOADED) {
			Styles.unload('S4E');
		}
	}
};

Modules.LOADMODULE = function() {
	S4E.init();
};

Modules.UNLOADMODULE = function() {
	S4E.uninit();
};
