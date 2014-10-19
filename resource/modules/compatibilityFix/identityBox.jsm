Modules.VERSION = '1.0.2';

this.__defineGetter__('PopupNotifications', function() { return window.PopupNotifications; });
this.__defineGetter__('gIdentityHandler', function() { return window.gIdentityHandler; });
this.__defineGetter__('gIdentityBox', function() { return $('identity-box'); });
this.__defineGetter__('gIdentityPopup', function() { return $('identity-popup'); });

// for the click handler modified by toCode
this.__defineGetter__('KeyEvent', function() { return window.KeyEvent; });
this.__defineGetter__('gURLBar', function() { return window.gURLBar; });

this.holdIdentityPopup = function(e) {
	if(e.target.anchorNode && e.target.anchorNode.id == 'page-proxy-favicon') {
		e.detail = 'identity-box';
		e.stopPropagation();
	}
};

this.identityBoxUpdate = function(doAction) {
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
		props.action = identityBoxAction;
	}
	
	skyLights.update('identityBox', props);
};

this.identityBoxAction = function(e) {
	var mixedBlocked = PopupNotifications.getNotification('mixed-content-blocked');
	if(mixedBlocked) {
		PopupNotifications._showPanel([mixedBlocked], skyLights.get('identityBox'));
		skyLights.update('identityBox', { active: true });
		
		Listeners.add($('notification-popup'), 'popuphiding', function() { skyLights.update('identityBox', { active: false }); }, false, true);
		return;
	}
	
	gIdentityHandler.handleIdentityButtonEvent(e);
};

this.identityBoxAnchoredToLight = function(e) {
	if(typeof(skyLights) != 'undefined') {
		skyLights.update('identityBox', { active: e.target.anchorNode == skyLights.get('identityBox') && e.type == 'popupshowing' });
	}
};

this.identityBoxLoad = function() {
	identityBoxUpdate(true);
};

this.identityBoxUnload = function() {
	if(typeof(skyLights) != 'undefined') {
		skyLights.remove('identityBox');
	}
};

Modules.LOADMODULE = function() {
	gIdentityHandler.__mode = gIdentityHandler._mode;
	delete gIdentityHandler._mode;
	gIdentityHandler.__defineGetter__('_mode', function() { return this.__mode; });
	gIdentityHandler.__defineSetter__('_mode', function(v) {
		this.__mode = v;
		identityBoxUpdate();
		return this.__mode;
	});
	
	toCode.modify(gIdentityHandler, 'gIdentityHandler.handleIdentityButtonEvent', [
		// this changes the anchor of the identity box popup to the sky light, in case it was triggered from there and not from the actual identity box
		['this._identityPopup.openPopup(this._identityIcon, "bottomcenter topleft");',
			'this._identityPopup.openPopup(isAncestor(event.target, $("theFoxOnlyBetter-skyLights-identityBox")) ? $("theFoxOnlyBetter-skyLights-identityBox") : this._identityIcon, "bottomcenter topleft");'
		]
	]);
	
	Listeners.add(gIdentityPopup, 'AskingForNodeOwner', holdIdentityPopup);
	Listeners.add(gIdentityPopup, 'popupshowing', identityBoxAnchoredToLight);
	Listeners.add(gIdentityPopup, 'popuphiding', identityBoxAnchoredToLight);
	Listeners.add(window, 'LoadedSkyLights', identityBoxLoad);
	Listeners.add(window, 'UnloadingSkyLights', identityBoxUnload);
	
	if(typeof(skyLights) != 'undefined') {
		identityBoxLoad(true);
	}
};

Modules.UNLOADMODULE = function() {
	delete gIdentityHandler._mode;
	gIdentityHandler._mode = gIdentityHandler.__mode;
	delete gIdentityHandler.__mode;
	
	toCode.revert(gIdentityHandler, 'gIdentityHandler.handleIdentityButtonEvent');
	
	Listeners.remove(gIdentityPopup, 'AskingForNodeOwner', holdIdentityPopup);
	Listeners.remove(gIdentityPopup, 'popupshowing', identityBoxAnchoredToLight);
	Listeners.remove(gIdentityPopup, 'popuphiding', identityBoxAnchoredToLight);
	Listeners.remove(window, 'LoadedSkyLights', identityBoxLoad);
	Listeners.remove(window, 'UnloadingSkyLights', identityBoxUnload);
	
	if(typeof(skyLights) != 'undefined') {
		identityBoxUnload();
	}
};
