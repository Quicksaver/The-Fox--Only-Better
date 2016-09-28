/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 2.1.6

this.__defineGetter__('gIdentityHandler', function() { return window.gIdentityHandler; });
this.__defineGetter__('gIdentityBox', function() { return $('identity-box'); });
this.__defineGetter__('gIdentityPopup', function() { return $('identity-popup'); });

// for the click handler modified by toCode
this.__defineGetter__('KeyEvent', function() { return window.KeyEvent; });
this.__defineGetter__('gURLBar', function() { return window.gURLBar; });

this.identityBox = {
	initialized: false,

	handleEvent: function(e) {
		switch(e.type) {
			case 'AskingForNodeOwner':
				if(e.target.anchorNode && e.target.anchorNode.id == 'page-proxy-favicon') {
					e.detail = 'identity-box';
					e.stopPropagation();
				}
				break;

			case 'popupshowing':
				skyLights.update('identityBox', { active: e.target.anchorNode == skyLights.get('identityBox') });
				break;

			case 'popuphiding':
				skyLights.update('identityBox', { active: false });
				break;

			case 'LoadedSkyLights':
				this.init();
				break;

			case 'UnloadingSkyLights':
				this.deinit();
				break;

			case 'LoadedSlimChromePopups':
				this.popupInit();
				break;

			case 'UnloadingSlimChromePopups':
				this.popupDeinit();
				break;
		}
	},

	init: function() {
		if(this.initialized) { return; }
		this.initialized = true;

		Piggyback.add('identityBox', gIdentityHandler, 'refreshIdentityBlock', (newMode) => {
			this.update();
		}, Piggyback.MODE_AFTER);

		// change the anchor of the identity box popup to the sky light, in case it was triggered from there and not from the actual identity box
		Piggyback.add('identityBox', gIdentityHandler, 'handleIdentityButtonEvent', function(event) {
			let light = skyLights.get('identityBox');
			let anchor = (isAncestor(event.target, light)) ? light : $('identity-icons');

			if(anchor != this._identityIcons) {
				delete this._identityIcons;
				this._identityIcons = anchor;
			}

			return true;
		}, Piggyback.MODE_BEFORE);

		Listeners.add(gIdentityPopup, 'popupshowing', this);
		Listeners.add(gIdentityPopup, 'popuphiding', this);

		this.update(true);
	},

	deinit: function() {
		if(!this.initialized) { return; }
		this.initialized = false;

		Piggyback.revert('identityBox', gIdentityHandler, 'refreshIdentityBlock');
		Piggyback.revert('identityBox', gIdentityHandler, 'handleIdentityButtonEvent');

		delete gIdentityHandler._identityIcons;
		gIdentityHandler._identityIcons = $('identity-icons');

		Listeners.remove(gIdentityPopup, 'popupshowing', this);
		Listeners.remove(gIdentityPopup, 'popuphiding', this);

		this.remove();
	},

	popupInit: function() {
		popups.mini.add('identity-popup');

		Listeners.add(gIdentityPopup, 'AskingForNodeOwner', this);
	},

	popupDeinit: function() {
		popups.mini.delete('identity-popup');

		Listeners.remove(gIdentityPopup, 'AskingForNodeOwner', this);
	},

	update: function(initialize) {
		// modes are defined in gIdentityHandler.refreshIdentityBlock at http://mxr.mozilla.org/mozilla-central/source/browser/base/content/browser.js
		// default transparent state, for modes "unknownIdentity" and "chromeUI"

		let modes = gIdentityBox.classList;
		let props = {
			tooltip: $('identity-icon-label').value,
			state: gIdentityBox.className,
			color: 'transparent'
		};

		if(modes.contains("verifiedIdentity")) {
			props.color = 'hsl(82,100%,40%)';
		}
		else if(modes.contains("verifiedDomain")) {
			props.color = 'hsl(220,100%,40%)';
		}
		else if(modes.contains("mixedActiveContent")
		|| modes.contains("mixedDisplayContentLoadedActiveBlocked")
		|| modes.contains("mixedDisplayContent")
		|| modes.contains("weakCipher")
		|| modes.contains("insecureLoginForms")) {
			props.color = 'hsl(52,100%,50%)';
		}

		if($('identity-icon-country-label').value) {
			if(props.tooltip) { props.tooltip += ' '; }
			props.tooltip += $('identity-icon-country-label').value;
		}

		if(gIdentityBox.tooltipText) {
			if(props.tooltip) { props.tooltip += ' - '; }
			props.tooltip += gIdentityBox.tooltipText;
		}

		if(initialize) {
			props.action = this.action;
			props.label = Strings.get('skyLights', 'identityBoxLabel');
			props.description = Strings.get('skyLights', 'identityBoxDescription');
		}

		skyLights.update('identityBox', props);
	},

	action: function(e) {
		// Only need to call _showPanel if the PopupNotifications object for this window has already been initialized (i.e. its getter no longer exists)
		let mixedBlocked = !Object.getOwnPropertyDescriptor(window, "PopupNotifications").get && window.PopupNotifications.getNotification('mixed-content-blocked');
		if(mixedBlocked) {
			PopupNotifications._showPanel([mixedBlocked], skyLights.get('identityBox'));
			skyLights.update('identityBox', { active: true });

			Listeners.add($('notification-popup'), 'popuphiding', function() { skyLights.update('identityBox', { active: false }); }, false, true);
			return;
		}

		gIdentityHandler.handleIdentityButtonEvent(e);
	},

	remove: function() {
		skyLights.remove('identityBox');
	}
};

Modules.LOADMODULE = function() {
	Listeners.add(window, 'LoadedSkyLights', identityBox);
	Listeners.add(window, 'UnloadingSkyLights', identityBox);
	Listeners.add(window, 'LoadedSlimChromePopups', identityBox);
	Listeners.add(window, 'UnloadingSlimChromePopups', identityBox);

	if(self.skyLights) {
		identityBox.init();
	}

	if(self.popups) {
		identityBox.popupInit();
	}
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'LoadedSkyLights', identityBox);
	Listeners.remove(window, 'UnloadingSkyLights', identityBox);
	Listeners.remove(window, 'LoadedSlimChromePopups', identityBox);
	Listeners.remove(window, 'UnloadingSlimChromePopups', identityBox);

	identityBox.deinit();

	if(self.popups) {
		identityBox.popupDeinit();
	}
};
