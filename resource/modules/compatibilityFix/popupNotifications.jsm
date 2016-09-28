/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 1.0.0

this.__defineGetter__('PopupNotifications', function() { return window.PopupNotifications; });

this.popupNotifications = {
	_originalGetter: null,

	get panel() { return $('notification-popup'); },

	handleEvent: function(e) {
		switch(e.type) {
			case 'AskingForNodeOwner':
				e.detail = 'notification-popup-box';
				e.stopPropagation();
				break;

			case 'LoadedSlimChromePopups':
				this.init();
				break;

			case 'UnloadingSlimChromePopups':
				this.deinit();
				break;
		}
	},

	init: function() {
		popups.mini.add('notification-popup');

		Listeners.add(this.panel, 'AskingForNodeOwner', this);

		// Only need to modify the PopupNotifications object for this window has already been initialized (i.e. its getter no longer exists)
		this._originalGetter = Object.getOwnPropertyDescriptor(window, "PopupNotifications").get;
		if(!this._originalGetter) {
			this.lazyInit();
		}
		// otherwise we wait for its lazy getter to load the actual object, and only then we initialize it
		else {
			window.__defineGetter__('PopupNotifications', () => {
				// the following deletes this getter and actually creates the PopupNotifications instance in this window
				this._originalGetter();

				// we don't need this anymore
				this._originalGetter = null;

				// now we can modify it
				this.lazyInit();

				// and of course return the instance as this is still a lazy getter
				return PopupNotifications;
			});
		}
	},

	deinit: function() {
		popups.mini.delete('notification-popup');

		Listeners.remove(this.panel, 'AskingForNodeOwner', this);

		if(!this._originalGetter) {
			this.lazyDeinit();
		}
		else {
			window.__defineGetter__('PopupNotifications', this._originalGetter);
			this._originalGetter = null;
		}
	},

	lazyInit: function() {
		// this property is only set right before the panel will be opened
		PopupNotifications.__currentAnchorElement = PopupNotifications._currentAnchorElement;
		delete PopupNotifications._currentAnchorElement;
		PopupNotifications.__defineGetter__('_currentAnchorElement', function() { return this.__currentAnchorElement; });
		PopupNotifications.__defineSetter__('_currentAnchorElement', function(v) {
			this.__currentAnchorElement = v;

			// the mini bar is not shown yet, so show it before the panel actually opens, prevents some jumping around,
			// but only if the anchor is actually in the hidden toolbars
			if(Prefs.includeNavBar
			&& self.slimChrome
			&& isAncestor(this.__currentAnchorElement, slimChrome.container)
			&& !trueAttribute(slimChrome.container, 'mini')) {
				slimChrome.quickShowMini();
			}

			return v;
		});
	},

	lazyDeinit: function() {
		delete PopupNotifications._currentAnchorElement;
		PopupNotifications._currentAnchorElement = PopupNotifications.__currentAnchorElement;
		delete PopupNotifications.__currentAnchorElement;
	}
};

Modules.LOADMODULE = function() {
	Listeners.add(window, 'LoadedSlimChromePopups', popupNotifications);
	Listeners.add(window, 'UnloadingSlimChromePopups', popupNotifications);

	if(self.popups) {
		popupNotifications.init();
	}
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'LoadedSlimChromePopups', popupNotifications);
	Listeners.remove(window, 'UnloadingSlimChromePopups', popupNotifications);

	if(self.popups) {
		popupNotifications.deinit();
	}
};
