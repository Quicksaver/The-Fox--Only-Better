Modules.VERSION = '2.0.0';

this.__defineGetter__('PopupNotifications', function() { return window.PopupNotifications; });
this.__defineGetter__('gIdentityHandler', function() { return window.gIdentityHandler; });
this.__defineGetter__('gIdentityBox', function() { return $('identity-box'); });
this.__defineGetter__('gIdentityPopup', function() { return $('identity-popup'); });

// for the click handler modified by toCode
this.__defineGetter__('KeyEvent', function() { return window.KeyEvent; });
this.__defineGetter__('gURLBar', function() { return window.gURLBar; });

this.identityBox = {
	handleEvent: function(e) {
		switch(e.type) {
			case 'AskingForNodeOwner':
				if(e.target.anchorNode && e.target.anchorNode.id == 'page-proxy-favicon') {
					e.detail = 'identity-box';
					e.stopPropagation();
				}
				break;
			
			case 'popupshowing':
				if(typeof(skyLights) != 'undefined') {
					skyLights.update('identityBox', { active: e.target.anchorNode == skyLights.get('identityBox') });
				}
				break;
				
			case 'popuphiding':
				if(typeof(skyLights) != 'undefined') {
					skyLights.update('identityBox', { active: false });
				}
				break;
			
			case 'LoadedSkyLights':
				this.update(true);
				break;
			
			case 'UnloadingSkyLights':
				this.remove();
				break;
		}
	},
	
	update: function(doAction) {
		if(typeof(skyLights) == 'undefined') { return; }
		
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
			
			default: break;
		}
		
		if($('identity-icon-country-label').value) {
			if(props.tooltip) { props.tooltip += ' '; }
			props.tooltip += $('identity-icon-country-label').value;
		}
		
		if(gIdentityBox.tooltipText) {
			if(props.tooltip) { props.tooltip += ' - '; }
			props.tooltip += gIdentityBox.tooltipText;
		}
		
		if(doAction) {
			props.action = this.action;
		}
		
		skyLights.update('identityBox', props);
	},
	
	action: function(e) {
		var mixedBlocked = PopupNotifications.getNotification('mixed-content-blocked');
		if(mixedBlocked) {
			PopupNotifications._showPanel([mixedBlocked], skyLights.get('identityBox'));
			skyLights.update('identityBox', { active: true });
			
			Listeners.add($('notification-popup'), 'popuphiding', function() { skyLights.update('identityBox', { active: false }); }, false, true);
			return;
		}
		
		gIdentityHandler.handleIdentityButtonEvent(e);
	},
	
	remove: function() {
		if(typeof(skyLights) != 'undefined') {
			skyLights.remove('identityBox');
		}
	}
};

Modules.LOADMODULE = function() {
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
	
	Listeners.add(gIdentityPopup, 'AskingForNodeOwner', identityBox);
	Listeners.add(gIdentityPopup, 'popupshowing', identityBox);
	Listeners.add(gIdentityPopup, 'popuphiding', identityBox);
	Listeners.add(window, 'LoadedSkyLights', identityBox);
	Listeners.add(window, 'UnloadingSkyLights', identityBox);
	
	identityBox.update(true);
};

Modules.UNLOADMODULE = function() {
	delete gIdentityHandler._mode;
	gIdentityHandler._mode = gIdentityHandler.__mode;
	delete gIdentityHandler.__mode;
	
	toCode.revert(gIdentityHandler, 'gIdentityHandler.handleIdentityButtonEvent');
	
	Listeners.remove(gIdentityPopup, 'AskingForNodeOwner', identityBox);
	Listeners.remove(gIdentityPopup, 'popupshowing', identityBox);
	Listeners.remove(gIdentityPopup, 'popuphiding', identityBox);
	Listeners.remove(window, 'LoadedSkyLights', identityBox);
	Listeners.remove(window, 'UnloadingSkyLights', identityBox);
	
	identityBox.remove();
};
