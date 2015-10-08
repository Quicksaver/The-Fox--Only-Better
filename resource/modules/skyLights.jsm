// VERSION 1.2.7

// this is the part for interaction by other possible add-ons or elements that will add/control other sky lights
this.skyLights = {
	kLightPrefix: objName+'-skyLights-',
	
	get container () { return $(this.kLightPrefix+'container'); },
	
	lights: new Map(),
	
	handleEvent: function(e) {
		switch(e.type) {
			case 'click':
				if(e.defaultPrevented) { return; }
				
				// the listener is attached to both the light and its inner container, which could lead to double calls to this,
				// so we do it aSync to prevent redundant calls for the same click action
				Timers.init('clickSkyLight', function() {
					if(e.target._action) {
						e.target._action(e);
					} else if(e.target.parentNode._action) {
						e.target.parentNode._action(e);
					}
				}, 0);
				break;
			
			case 'WillShowSlimChrome':
				var node = e.detail.target;
				if(isAncestor(node, this.container)) {
					while(node) {
						if(node == this.container) { return; }
						
						if(node.className == 'skyLight') {
							e.preventDefault();
							e.stopPropagation();
							return;
						}
						
						node = node.parentNode;
					}
				}
				break;
		}
	},
	
	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'skyLightsHide':
				this.hideOnChrome();
				break;
			
			case 'skyLightsPlacements':
				this.updatePlacements(aData);
				break;
		}
	},
	
	update: function(name, props) {
		if(typeof(name) != 'string') { return; }
		
		var light = this.get(name);
		
		if(!light) {
			// in case something calls this too soon
			if(!this.container) { return; }
			
			light = document.createElement('box');
			light.id = this.kLightPrefix+name;
			setAttribute(light, 'class', 'skyLight');
			setAttribute(light, 'context', 'toolbar-context-menu');
			
			light._speed = 500;
			light._action = null;
			Listeners.add(light, 'click', this);
			
			light.appendChild(document.createElement('box'));
			setAttribute(light.firstChild, 'class', 'skyLightArea');
			Listeners.add(light.firstChild, 'click', this);
			
			this.container.appendChild(light);
			this.lights.set(name, light);
			
			// only our own lights are allowed to use the dependson attribute,
			// so we hardcode it here instead of making it an argument of this method
			let dependson = null;
			if(name == 'identityBox') {
				dependson = 'pref-miniOnChangeLocation';
			}
			
			// register this light with the DnDprefs object, so its position can be customized
			DnDprefs.addWidget('skyLightsPlacements', name, light, props.label, props.description, dependson);
			
			// we need to make sure the light is moved to the correct place or removed if the user chose to disable it
			this.updatePlacements();
		}
		
		for(let p in props) {
			switch(p) {
				// state is an identifying string, mostly for convenience to quickly and easily retrieve the current state of the light
				case 'state':
					setAttribute(light, 'state', props[p]);
					break;
				
				// color is simply a color (rgb/a, hsl/a, hex string, color code) that will be applied to the light
				case 'color':
					light.style.backgroundColor = props[p];
					
					var isTransparent = props[p] == 'transparent';
					if(!isTransparent) {
						var colorExplode = props[p].split(',');
						if(colorExplode.length == 4) {
							isTransparent = parseInt(colorExplode[3]) == 0;
						}
					}
					
					let sscode = '\
						@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n\
						@-moz-document url("'+document.baseURI+'") {\n\
							window['+objName+'_UUID="'+_UUID+'"] #'+this.kLightPrefix+name+':-moz-any(:hover:not([alert="off"]),[active],[alert="on"]) {\n\
								box-shadow: rgba(0,0,0,0.2) 0 1px 2px'	+
									(!isTransparent ? ' 1px, '+props[p]+' 3px 0 4px, '+props[p]+' -3px 0 4px, '+props[p]+' 0 0px 11px' : '')+';\n\
							}\n\
						}';
					
					Styles.load('skyLight-'+name+'_'+_UUID, sscode, true);
					toggleAttribute(light, 'transparent', isTransparent);
					
					break;
				
				// tooltip is the text that should appear when the mouse is hovered to the light
				case 'tooltip':
					setAttribute(light, 'tooltiptext', props[p]);
					break;
				
				// context defines which context menu should the light use if it is right-clicked; by default it will use the toolbar context menu
				case 'context':
					setAttribute(light, 'context', props[p]);
					break;
				
				// action is the method to be called when the user clicks the sky light
				case 'action':
					light._action = props[p];
					toggleAttribute(light, 'action', props[p]);
					break;
					
				// active will set an active attribute to the light, making it always "on" as if the mouse was over it
				case 'active':
					toggleAttribute(light, 'active', props[p]);
					break;
				
				// speed is the blinking speed in ms, corresponding to the duration of each phase (on and off), for when the alert state of the light is active,
				// this defaults to 500ms if never set and the alert property is set
				case 'speed':
					light._speed = props[p];
					break;
					
				// alert will blink the light until the user hovers it with the mouse
				case 'alert':
					if(light._alert) {
						light._alert();
					}
					
					if(props[p]) {
						light._alert = function() {
							Timers.cancel('skyLightsAlert-'+name);
							Listeners.remove(this, 'mouseover', this._alert);
							delete this._alert;
							removeAttribute(this, 'alert');
							removeAttribute(this, 'blinking');
						};
						
						if(props[p] === true) {
							light._blink = null;
							Listeners.add(light, 'mouseover', light._alert);
						} else {
							light._blink = props[p];
						}
						
						Timers.init('skyLightsAlert-'+name, function() {
							let phase = light.getAttribute('alert') == 'on' ? 'off' : 'on';
							let blinking = light._blink !== null;
							
							if(blinking && phase == 'on') {
								if(light._blink <= 0 && light._alert) {
									light._alert();
									return;
								}
								light._blink--;
							}
							
							// this is so the last blink out fades the light immediately when the mouse isn't over it,
							// other wise you could see its opacity change as an actual extra "phase" in the blinking
							toggleAttribute(light, 'blinking', blinking && (light._blink > 0 || phase == 'off'));
							
							setAttribute(light, 'alert', phase);
						}, light._speed, 'slack');
					}
					break;
				
				default: break;
			}
		}
	},
	
	get: function(name) {
		if(typeof(name) != 'string') { return; }
		
		return this.lights.get(name);
	},
	
	remove: function(name) {
		if(typeof(name) != 'string') { return; }
		
		if(this.lights.has(name)) {
			var light = this.lights.get(name);
			Listeners.remove(light, 'click', this);
			Listeners.remove(light.firstChild, 'click', this);
			if(light._alert) {
				light._alert();
			}
			
			DnDprefs.removeWidget('skyLightsPlacements', name, light);
			light.remove();
			Styles.unload('skyLight-'+name+'_'+_UUID);
			this.lights.delete(name);
		}
	},
	
	hideOnChrome: function() {
		toggleAttribute(this.container, 'hideWhenChromeVisible', Prefs.skyLightsHide);
	},
	
	init: function() {
		DnDprefs.addHandler('skyLightsPlacements', this);
		
		Listeners.add(slimChrome.container, 'WillShowSlimChrome', this, true);
		
		Prefs.listen('skyLightsHide', this);
		this.hideOnChrome();
		
		dispatch(this.container, { type: 'LoadedSkyLights', cancelable: false });
		
		// when closing a window we need to make sure all the references to this window's lights are removed from the DnDpref global object
		alwaysRunOnClose.push(() => {
			this.unregister();
		});
	},
	
	deinit: function() {
		Timers.cancel('clickSkyLight');
		
		this.unregister();
		
		dispatch(this.container, { type: 'UnloadingSkyLights', cancelable: false });
		
		Prefs.unlisten('skyLightsHide', this);
		removeAttribute(this.container, 'hideWhenChromeVisible');
		
		Listeners.remove(slimChrome.container, 'WillShowSlimChrome', this, true);
		
		// make sure all the lights are properly unloaded
		for(let light of this.lights.keys()) {
			this.remove(light);
		}
	},
	
	unregister: function() {
		DnDprefs.removeHandler('skyLightsPlacements', this);
		for(let [ name, light ] of this.lights) {
			DnDprefs.removeWidget('skyLightsPlacements', name, light);
		}
	},
	
	updatePlacements: function(placements) {
		if(!this.container) { return; }
		
		if(!placements) {
			placements = DnDprefs.getPref('skyLightsPlacements');
			if(!placements) { return; }
		}
		
		let node = this.container.firstChild;
		
		for(let id of placements.order) {
			let light = this.get(id);
			
			// if this light isn't active, skip it as there's no need to show it in the customization areas
			if(!light) { continue; }
			
			// if the user chose to disable this specific light, we remove it from the DOM tree entirely
			if(!placements.settings.get(id).enable) {
				// keep going through the light nodes before removing it, so we don't lose our position
				if(node && node == light) {
					node = node.nextSibling;
				}
				
				light.remove();
				continue;
			}
			
			// if the current node is already in the correct position, we can skip ahead
			if(node && node == light) {
				node = node.nextSibling;
				continue;
			}
			
			// we're going through the order in the array, so we can just append to the end since we'll eventually go through all lights in order
			this.container.appendChild(light);
			node = null;
		}
	}
};

Modules.LOADMODULE = function() {
	// in case the overlay is already loaded (don't even know if this can happen but better make sure)
	if(skyLights.container) {
		skyLights.init();
	}
	
	Overlays.overlayURI('chrome://'+objPathString+'/content/slimChrome.xul', 'skyLights', {
		onLoad: function(aWindow) { if(typeof(aWindow[objName].skyLights) != 'undefined') { aWindow[objName].skyLights.init(); } },
		onUnload: function(aWindow) { if(typeof(aWindow[objName].skyLights) != 'undefined') { aWindow[objName].skyLights.deinit(); } }
	});
};

Modules.UNLOADMODULE = function() {
	// make sure this runs in case the overlay unloads after the module
	skyLights.deinit();
	
	if(UNLOADED || !Prefs.skyLights || !Prefs.includeNavBar) {
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/slimChrome.xul', 'skyLights');
	}
};
