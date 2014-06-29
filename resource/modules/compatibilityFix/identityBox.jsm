moduleAid.VERSION = '1.0.0';

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
		
		listenerAid.add($('notification-popup'), 'popuphiding', function() { skyLights.update('identityBox', { active: false }); }, false, true);
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

moduleAid.LOADMODULE = function() {
	gIdentityHandler.__mode = gIdentityHandler._mode;
	delete gIdentityHandler._mode;
	gIdentityHandler.__defineGetter__('_mode', function() { return this.__mode; });
	gIdentityHandler.__defineSetter__('_mode', function(v) {
		this.__mode = v;
		identityBoxUpdate();
		return this.__mode;
	});
	
	toCode.modify(gIdentityHandler, 'gIdentityHandler.handleIdentityButtonEvent', [
		['this._identityPopup.openPopup(this._identityIcon, "bottomcenter topleft");',
			'this._identityPopup.openPopup(isAncestor(event.target, $("'+objName+'-skyLights-identityBox")) ? $("'+objName+'-skyLights-identityBox") : this._identityIcon, "bottomcenter topleft");'
		]
	]);
	
	listenerAid.add(gIdentityPopup, 'AskingForNodeOwner', holdIdentityPopup);
	listenerAid.add(gIdentityPopup, 'popupshowing', identityBoxAnchoredToLight);
	listenerAid.add(gIdentityPopup, 'popuphiding', identityBoxAnchoredToLight);
	listenerAid.add(window, 'LoadedSkyLights', identityBoxLoad);
	listenerAid.add(window, 'UnloadingSkyLights', identityBoxUnload);
	
	if(typeof(skyLights) != 'undefined') {
		identityBoxLoad(true);
	}
};

moduleAid.UNLOADMODULE = function() {
	delete gIdentityHandler._mode;
	gIdentityHandler._mode = gIdentityHandler.__mode;
	delete gIdentityHandler.__mode;
	
	toCode.revert(gIdentityHandler, 'gIdentityHandler.handleIdentityButtonEvent');
	
	listenerAid.remove(gIdentityPopup, 'AskingForNodeOwner', holdIdentityPopup);
	listenerAid.remove(gIdentityPopup, 'popupshowing', identityBoxAnchoredToLight);
	listenerAid.remove(gIdentityPopup, 'popuphiding', identityBoxAnchoredToLight);
	listenerAid.remove(window, 'LoadedSkyLights', identityBoxLoad);
	listenerAid.remove(window, 'UnloadingSkyLights', identityBoxUnload);
	
	if(typeof(skyLights) != 'undefined') {
		identityBoxUnload();
	}
};
