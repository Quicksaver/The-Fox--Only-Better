Modules.VERSION = '1.0.4';

this.__defineGetter__('skyLightsContainer', function() { return $(objName+'-skyLights-container'); });

this.skyLightsExisting = [];

// this is the part for interaction by other possible add-ons or elements that will add/control other sky lights
this.skyLights = {
	update: function(name, props) {
		if(typeof(name) != 'string') { return; }
		
		var light = this.get(name);
		
		if(!light) {
			// in case something calls this too soon
			if(!skyLightsContainer) { return; }
			
			light = document.createElement('box');
			light.id = objName+'-skyLights-'+name;
			setAttribute(light, 'class', 'skyLight');
			setAttribute(light, 'context', 'toolbar-context-menu');
			
			light._action = null;
			Listeners.add(light, 'click', skyLightsOnClick);
			
			light.appendChild(document.createElement('box'));
			setAttribute(light.firstChild, 'class', 'skyLightArea');
			Listeners.add(light.firstChild, 'click', skyLightsOnClick);
			
			skyLightsContainer.appendChild(light);
			skyLightsExisting.push({ name: name, node: light });
		}
		
		for(var p in props) {
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
					
					var sscode = '/*The Fox, Only Better CSS declarations of variable values*/\n';
					sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
					sscode += '@-moz-document url("'+document.baseURI+'") {\n';
					sscode += '	window['+objName+'_UUID="'+_UUID+'"] #theFoxOnlyBetter-skyLights-'+name+':-moz-any(:hover,[active],[alert="on"]) {\n';
					
					if(isTransparent) {
						sscode += '	box-shadow: rgba(0,0,0,0.2) 0 1px 2px;\n';
					} else {
						sscode += '	box-shadow: rgba(0,0,0,0.2) 0 1px 2px 1px, '+props[p]+' 3px 0 4px, '+props[p]+' -3px 0 4px, '+props[p]+' 0 0px 11px;\n';
					}
					
					sscode += '	}\n';
					sscode += '}';
					
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
				
				// alert will blink the light until the user hovers it with the mouse
				case 'alert':
					if(light._alert) {
						light._alert();
					}
					
					if(props[p]) {
						light._alert = function() {
							Timers.cancel('skyLightsAlert-'+name);
							Listeners.remove(light, 'mouseover', light._alert);
							delete light._alert;
							removeAttribute(light, 'alert');
						};
						
						Listeners.add(light, 'mouseover', light._alert);
						Timers.init('skyLightsAlert-'+name, function() {
							setAttribute(light, 'alert', (light.getAttribute('alert') == 'on') ? 'off' : 'on');
						}, 500, 'slack');
					}
					break;
				
				default: break;
			}
		}
	},
	
	get: function(name) {
		if(typeof(name) != 'string') { return; }
		
		for(var s of skyLightsExisting) {
			if(s.name == name) {
				return s.node;
			}
		}
		return null;
	},
	
	remove: function(name) {
		if(typeof(name) != 'string') { return; }
		
		for(var i = 0; i < skyLightsExisting.length; i++) {
			if(skyLightsExisting[i].name == name) {
				Listeners.remove(skyLightsExisting[i].node, 'click', skyLightsOnClick);
				Listeners.remove(skyLightsExisting[i].node.firstChild, 'click', skyLightsOnClick);
				if(skyLightsExisting[i].node._alert) {
					skyLightsExisting[i].node._alert();
				}
				
				skyLightsExisting[i].node.remove();
				Styles.unload('skyLight-'+name+'_'+_UUID);
				skyLightsExisting.splice(i, 1);
				break;
			}
		}
	}
};

this.skyLightsOnClick = function(e) {
	if(e.defaultPrevented) { return; }
	
	if(e.target._action) {
		e.target._action(e);
	} else if(e.target.parentNode._action) {
		e.target.parentNode._action(e);
	}
};

this.skyLightsOnSlimChrome = function(e) {
	var node = e.detail.target;
	if(!isAncestor(node, skyLightsContainer)) { return; }
	
	while(node) {
		if(node == skyLightsContainer) { return; }
		
		if(node.className == 'skyLight') {
			e.preventDefault();
			e.stopPropagation();
			return;
		}
		
		node = node.parentNode;
	}
};

this.skyLightsHideOnChrome = function() {
	toggleAttribute(skyLightsContainer, 'hideWhenChromeVisible', Prefs.skyLightsHide);
};

this.skyLightsLoad = function() {
	Listeners.add(slimChromeContainer, 'WillShowSlimChrome', skyLightsOnSlimChrome, true);
	
	Prefs.listen('skyLightsHide', skyLightsHideOnChrome);
	skyLightsHideOnChrome();
	
	dispatch(skyLightsContainer, { type: 'LoadedSkyLights', cancelable: false });
};

this.skyLightsUnload = function() {
	dispatch(skyLightsContainer, { type: 'UnloadingSkyLights', cancelable: false });
	
	Prefs.unlisten('skyLightsHide', skyLightsHideOnChrome);
	removeAttribute(skyLightsContainer, 'hideWhenChromeVisible');
	
	Listeners.remove(slimChromeContainer, 'WillShowSlimChrome', skyLightsOnSlimChrome, true);
	
	// make sure all the lights are properly unloaded
	while(skyLightsExisting.length > 0) {
		skyLights.remove(skyLightsExisting[0].name);
	}
};

Modules.LOADMODULE = function() {
	// in case the overlay is already loaded (don't even know if this can happen but better make sure)
	if(skyLightsContainer) {
		skyLightsLoad();
	}
	
	Overlays.overlayURI('chrome://'+objPathString+'/content/slimChrome.xul', 'skyLights', null,
		function(aWindow) { if(typeof(aWindow[objName].skyLightsLoad) != 'undefined') { aWindow[objName].skyLightsLoad(); } },
		function(aWindow) { if(typeof(aWindow[objName].skyLightsUnload) != 'undefined') { aWindow[objName].skyLightsUnload(); } }
	);
};

Modules.UNLOADMODULE = function() {
	// make sure this runs in case the overlay unloads after the module
	skyLightsUnload();
	
	if(UNLOADED || !Prefs.skyLights || !Prefs.includeNavBar) {
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/slimChrome.xul', 'skyLights');
	}
};
