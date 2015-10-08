// VERSION 2.1.3

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
		
		if(Services.vc.compare(Services.appinfo.version, "42.0a1") < 0) {
			gIdentityHandler.__mode = gIdentityHandler._mode;
			delete gIdentityHandler._mode;
			gIdentityHandler.__defineGetter__('_mode', function() { return this.__mode; });
			gIdentityHandler.__defineSetter__('_mode', function(v) {
				this.__mode = v;
				identityBox.update();
				return this.__mode;
			});
			
			toCode.modify(gIdentityHandler, 'gIdentityHandler.handleIdentityButtonEvent', [
				// this changes the anchor of the identity box popup to the sky light, in case it was triggered from there and not from the actual identity box
				['this._identityPopup.openPopup(this._identityIcon, "bottomcenter topleft");',
					'this._identityPopup.openPopup(isAncestor(event.target, $("theFoxOnlyBetter-skyLights-identityBox")) ? $("theFoxOnlyBetter-skyLights-identityBox") : this._identityIcon, "bottomcenter topleft");'
				]
			]);
		} else {
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
		}
		
		Listeners.add(gIdentityPopup, 'popupshowing', this);
		Listeners.add(gIdentityPopup, 'popuphiding', this);
		
		this.update(true);
	},
	
	deinit: function() {
		if(!this.initialized) { return; }
		this.initialized = false;
		
		if(Services.vc.compare(Services.appinfo.version, "42.0a1") < 0) {
			delete gIdentityHandler._mode;
			gIdentityHandler._mode = gIdentityHandler.__mode;
			delete gIdentityHandler.__mode;
			
			toCode.revert(gIdentityHandler, 'gIdentityHandler.handleIdentityButtonEvent');
		} else {
			Piggyback.revert('identityBox', gIdentityHandler, 'refreshIdentityBlock');
			
			Piggyback.revert('identityBox', gIdentityHandler, 'handleIdentityButtonEvent');
			delete gIdentityHandler._identityIcons;
			gIdentityHandler._identityIcons = $('identity-icons');
		}
		
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
		// default transparent state, for modes:
		//	gIdentityHandler.IDENTITY_MODE_UNKNOWN
		//	gIdentityHandler.IDENTITY_MODE_CHROMEUI
		//	gIdentityHandler.IDENTITY_MODE_FILE_URI
		
		var props = {
			tooltip: $('identity-icon-label').value,
			state: gIdentityBox.className,
			color: 'transparent'
		};
		
		switch(props.state) {
			case gIdentityHandler.IDENTITY_MODE_IDENTIFIED:
				props.color = 'hsl(82,100%,40%)';
				break;
			
			case gIdentityHandler.IDENTITY_MODE_DOMAIN_VERIFIED:
				props.color = 'hsl(220,100%,40%)';
				break;
			
			case gIdentityHandler.IDENTITY_MODE_MIXED_ACTIVE_LOADED:
			case gIdentityHandler.IDENTITY_MODE_MIXED_DISPLAY_LOADED_ACTIVE_BLOCKED:
			case gIdentityHandler.IDENTITY_MODE_MIXED_DISPLAY_LOADED:
				props.color = 'hsl(52,100%,50%)';
				break;
			
			default:
				// these were introduced in FF42
				if(Services.vc.compare(Services.appinfo.version, "42.0a1") >= 0) {
					switch(props.state) {
						case gIdentityHandler.MIXED_ACTIVE_BLOCKED_IDENTIFIED:
							props.color = 'hsl(82,100%,40%)';
							break;
						
						case gIdentityHandler.IDENTITY_MODE_MIXED_ACTIVE_BLOCKED:
							props.color = 'hsl(220,100%,40%)';
							break;
						
						case gIdentityHandler.IDENTITY_MODE_USES_WEAK_CIPHER:
							props.color = 'hsl(52,100%,50%)';
							break;
					}
				}
				break;
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
