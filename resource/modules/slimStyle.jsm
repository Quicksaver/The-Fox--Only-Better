moduleAid.VERSION = '1.2.0';

this.__defineGetter__('slimChromeClipPathURLBarWrapper', function() { return $(objName+'-slimChrome-clipPath-urlbar-wrapper-path'); });
this.__defineGetter__('slimChromeClipPathLeft', function() { return $(objName+'-slimChrome-clipPath-toolbars-left-path'); });
this.__defineGetter__('slimChromeClipPathRight', function() { return $(objName+'-slimChrome-clipPath-toolbars-right-path'); });
this.__defineGetter__('slimChromeSVGLeft', function() { return $(objName+'-slimChrome-svg-'+(RTL ? 'after' : 'before')+'-path'); });
this.__defineGetter__('slimChromeSVGRight', function() { return $(objName+'-slimChrome-svg-'+(RTL ? 'before' : 'after')+'-path'); });

this._slimStyle = null;
this.__defineGetter__('slimStyle', function() { return this._slimStyle || prefAid.slimStyle; });
this.__defineSetter__('slimStyle', function(v) {
	if(v) {
		timerAid.init('resetSlimStyle', function() {
			slimStyle = null;
		}, 2250);
	}
	this._slimStyle = v;
	slimChromeStyle();
});

this.AUSTRALIS_BORDER_WIDTH_BASE = 34; // the size of the border element, basically how far it extends
this.AUSTRALIS_BORDER_WIDTH_INCR = 8; // how much should the border extend with each toolbar added, so that it doesn't distort
this.AUSTRALIS_BORDER_OFFSET_Y1 = 0.015; // percentage by which the border svg ends should be offset of the actual clipPath (top)
this.AUSTRALIS_BORDER_OFFSET_Y2 = 0.015; // percentage by which the border svg ends should be offset of the actual clipPath (bottom)
this.AUSTRALIS_BORDER_MARGIN_ADJUST_TOOLBARS = -6; // this is added to AUSTRALIS_BORDER_WIDTH and that is applied as the toolbars' container margin
this.AUSTRALIS_BORDER_MARGIN_ADJUST_BOTTOM = 2; // this is added to the margins of the australis bottom border container
this.AUSTRALIS_BORDER_NAVBAR_MARGIN = 5; // negative margin for the nav-bar so there isn't a huge space between it and the others
this.AUSTRALIS_BORDER_TOOLBAR_MARGIN = 3; // incremented to the nav-bar per-toolbar

this.__defineGetter__('AUSTRALIS_BORDER_WIDTH', function() { return AUSTRALIS_BORDER_WIDTH_BASE + (AUSTRALIS_BORDER_WIDTH_INCR * slimChromeNumToolbars()); });

// I don't know why but the bottom part of the SVG line doesn't match exactly the outer clip-path,
// even though they both use the same values and should have the same dimensions...
this.__defineGetter__('AUSTRALIS_BORDER_OFFSET_YS', function() {
	if(!WINNT) {
		return (slimChromeNumToolbars() > 1) ? 0.02 : 0.04;
	}	
	else if(Services.navigator.oscpu.startsWith('Windows NT 5.1')) {
		return (slimChromeNumToolbars() > 1) ? 0.01 : 0.02;
	}
	return (slimChromeNumToolbars() > 1) ? 0.04 : 0.06;
});

// the following define the shape and curvature of the australis-style container borders; values are a decimal percentage of the total border size
// used as "M COORD_X1,COORD_Y1 C CURVE1_X1,CURVE1_Y1 CURVE1_X2,CURVE1_Y2 COORD_X2,COORD_Y2 CURVE1_X1,CURVE1_Y1 CURVE2_X2,CURVE2_Y2 COORD_X3,COORD_Y3 [...]";
// see https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths

this.AUSTRALIS_BORDER_CURVE1_X1 = 0;
this.AUSTRALIS_BORDER_CURVE1_Y1 = 0;
this.AUSTRALIS_BORDER_CURVE1_X2 = 0.04;
this.AUSTRALIS_BORDER_CURVE1_Y2 = 0;

this.AUSTRALIS_BORDER_CURVE2_X1 = 0.49;
this.AUSTRALIS_BORDER_CURVE2_Y1 = 0.02;
this.AUSTRALIS_BORDER_CURVE2_X2 = 0.46;
this.AUSTRALIS_BORDER_CURVE2_Y2 = 0.38;

this.AUSTRALIS_BORDER_CURVE3_X1 = 0.54;
this.AUSTRALIS_BORDER_CURVE3_Y1 = 0.62;
this.AUSTRALIS_BORDER_CURVE3_X2 = 0.51;
this.AUSTRALIS_BORDER_CURVE3_Y2 = 0.98;

this.AUSTRALIS_BORDER_CURVE4_X1 = 0.96;
this.AUSTRALIS_BORDER_CURVE4_Y1 = 1;
this.AUSTRALIS_BORDER_CURVE4_X2 = 1;
this.AUSTRALIS_BORDER_CURVE4_Y2 = 1;

this.AUSTRALIS_BORDER_COORD_X1 = 0;
this.AUSTRALIS_BORDER_COORD_Y1 = 0;
this.AUSTRALIS_BORDER_COORD_X2 = 0.04;
this.AUSTRALIS_BORDER_COORD_Y2 = 0.015;
this.AUSTRALIS_BORDER_COORD_X3 = 0.5;
this.AUSTRALIS_BORDER_COORD_Y3 = 0.5;
this.AUSTRALIS_BORDER_COORD_X4 = 0.96;
this.AUSTRALIS_BORDER_COORD_Y4 = 0.985;
this.AUSTRALIS_BORDER_COORD_X5 = 1;
this.AUSTRALIS_BORDER_COORD_Y5 = 1;

this.slimChromeClipPaths = function() {
	personaChanged();
	
	if(slimStyle == 'compact') {
		var d = !DARWIN ? 'm 1,-5 l 0,7.8 l 0,0.2 l 0,50 l 10000,0 l 0,-100 l -10000,0 z' : 'M 1,-5 l 0,50 l 10000,0 l 0,-100 l -10000,0 z';
		setAttribute(slimChromeClipPathURLBarWrapper, 'd', d);
		
		return;
	}
	
	if(slimStyle != 'australis' || typeof(lastSlimChromeStyle) == 'undefined' || !lastSlimChromeStyle) { return; }
	
	// we don't want to calculate the paths in this case, as they rely on the actual height of the toolbars, which would be incorrect here;
	// the paths will be re-done when the chrome is next shown
	if(trueAttribute(slimChromeContainer, 'onlyURLBar') && !trueAttribute(slimChromeContainer, 'hover')) {
		removeAttribute(slimChromeContainer, 'numToolbars');
		return;
	}
	
	var width = AUSTRALIS_BORDER_WIDTH;
	
	// don't bother if nothing changed in the meantime
	if(slimChromeContainer._borderSize == width && slimChromeContainer._lastWidth == lastSlimChromeStyle.width) {
		return;
	}
	slimChromeContainer._borderSize = width;
	slimChromeContainer._lastWidth = lastSlimChromeStyle.width;
	
	var bottomMargin = width -AUSTRALIS_BORDER_WIDTH_INCR +AUSTRALIS_BORDER_MARGIN_ADJUST_BOTTOM;
	var bottomWidth = bottomMargin *2;
	
	var toolbarsMargin = width +AUSTRALIS_BORDER_MARGIN_ADJUST_TOOLBARS;
	var toolbarsWidth = toolbarsMargin *2;
	
	var navbarMargin = AUSTRALIS_BORDER_NAVBAR_MARGIN + (AUSTRALIS_BORDER_TOOLBAR_MARGIN *slimChromeNumToolbars());
	
	// define the DOM nodes sizes first
	styleAid.unload('slimChromeSVG_'+_UUID);
	
	var sscode = '/*The Fox, Only Better CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([chromehidden~="toolbar"]) #navigator-toolbox[slimStyle="australis"] #'+objName+'-slimChrome-container:-moz-any([hover],:not([onlyURLBar])) #'+objName+'-slimChrome-toolbars-before,\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([chromehidden~="toolbar"]) #navigator-toolbox[slimStyle="australis"] #'+objName+'-slimChrome-container:-moz-any([hover],:not([onlyURLBar])) #'+objName+'-slimChrome-toolbars-after {\n';
	sscode += '		width: ' + width + 'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([chromehidden~="toolbar"]) #theFoxOnlyBetter-slimChrome-toolbars-bottom {\n';
	sscode += '		margin-left: ' + bottomMargin + 'px;\n';
	sscode += '		margin-right: ' + bottomMargin + 'px;\n';
	sscode += '		width: calc(100% - ' + bottomWidth + 'px);\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([chromehidden~="toolbar"]) #navigator-toolbox[slimStyle="australis"] #'+objName+'-slimChrome-container:-moz-any([hover],:not([onlyURLBar])) #'+objName+'-slimChrome-toolbars {\n';
	sscode += '		margin-left: ' + toolbarsMargin + 'px !important;\n';
	sscode += '		margin-right: ' + toolbarsMargin + 'px !important;\n';
	sscode += '		width: calc(100% - ' + toolbarsWidth + 'px) !important;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([chromehidden~="toolbar"]) #navigator-toolbox[slimStyle="australis"] #'+objName+'-slimChrome-container:-moz-any([hover],:not([onlyURLBar])) #nav-bar {\n';
	sscode += '		margin: 0 -'+navbarMargin+'px;\n';
	sscode += '	}\n';
	sscode += '}';
	
	styleAid.load('slimChromeSVG_'+_UUID, sscode, true);
	
	// the left border
	var d = "M "+AUSTRALIS_BORDER_COORD_X1+","+AUSTRALIS_BORDER_COORD_Y1;
	d += " C";
	d += " "+AUSTRALIS_BORDER_CURVE1_X1+","+AUSTRALIS_BORDER_CURVE1_Y1;
	d += " "+AUSTRALIS_BORDER_CURVE1_X2+","+AUSTRALIS_BORDER_CURVE1_Y2;
	d += " "+AUSTRALIS_BORDER_COORD_X2+","+AUSTRALIS_BORDER_COORD_Y2;
	d += " "+AUSTRALIS_BORDER_CURVE2_X1+","+AUSTRALIS_BORDER_CURVE2_Y1;
	d += " "+AUSTRALIS_BORDER_CURVE2_X2+","+AUSTRALIS_BORDER_CURVE2_Y2;
	d += " "+AUSTRALIS_BORDER_COORD_X3+","+AUSTRALIS_BORDER_COORD_Y3;
	d += " "+AUSTRALIS_BORDER_CURVE3_X1+","+(AUSTRALIS_BORDER_CURVE3_Y1-AUSTRALIS_BORDER_OFFSET_YS);
	d += " "+AUSTRALIS_BORDER_CURVE3_X2+","+(AUSTRALIS_BORDER_CURVE3_Y2-AUSTRALIS_BORDER_OFFSET_YS);
	d += " "+AUSTRALIS_BORDER_COORD_X4+","+(AUSTRALIS_BORDER_COORD_Y4-AUSTRALIS_BORDER_OFFSET_YS);
	d += " "+AUSTRALIS_BORDER_CURVE4_X1+","+AUSTRALIS_BORDER_CURVE4_Y1;
	d += " "+AUSTRALIS_BORDER_CURVE4_X2+","+AUSTRALIS_BORDER_CURVE4_Y2;
	d += " "+AUSTRALIS_BORDER_COORD_X5+","+AUSTRALIS_BORDER_COORD_Y5;
	d += " L "+AUSTRALIS_BORDER_COORD_X5+","+AUSTRALIS_BORDER_COORD_Y1+" z";
	setAttribute(slimChromeClipPathLeft, 'd', d);
	
	// now we draw the actual border strokes
	var d = "M "+AUSTRALIS_BORDER_COORD_X1+","+(AUSTRALIS_BORDER_COORD_Y1-AUSTRALIS_BORDER_OFFSET_Y1);
	d += " C";
	d += " "+AUSTRALIS_BORDER_CURVE1_X1+","+(AUSTRALIS_BORDER_CURVE1_Y1-AUSTRALIS_BORDER_OFFSET_Y1);
	d += " "+AUSTRALIS_BORDER_CURVE1_X2+","+(AUSTRALIS_BORDER_CURVE1_Y2-AUSTRALIS_BORDER_OFFSET_Y1);
	d += " "+AUSTRALIS_BORDER_COORD_X2+","+(AUSTRALIS_BORDER_COORD_Y2-AUSTRALIS_BORDER_OFFSET_Y1);
	d += " "+AUSTRALIS_BORDER_CURVE2_X1+","+AUSTRALIS_BORDER_CURVE2_Y1;
	d += " "+AUSTRALIS_BORDER_CURVE2_X2+","+AUSTRALIS_BORDER_CURVE2_Y2;
	d += " "+AUSTRALIS_BORDER_COORD_X3+","+AUSTRALIS_BORDER_COORD_Y3;
	d += " "+AUSTRALIS_BORDER_CURVE3_X1+","+AUSTRALIS_BORDER_CURVE3_Y1;
	d += " "+AUSTRALIS_BORDER_CURVE3_X2+","+AUSTRALIS_BORDER_CURVE3_Y2;
	d += " "+AUSTRALIS_BORDER_COORD_X4+","+(AUSTRALIS_BORDER_COORD_Y4+AUSTRALIS_BORDER_OFFSET_Y2);
	d += " "+AUSTRALIS_BORDER_CURVE4_X1+","+(AUSTRALIS_BORDER_CURVE4_Y1+AUSTRALIS_BORDER_OFFSET_Y2);
	d += " "+AUSTRALIS_BORDER_CURVE4_X2+","+(AUSTRALIS_BORDER_CURVE4_Y2+AUSTRALIS_BORDER_OFFSET_Y2);
	d += " "+AUSTRALIS_BORDER_COORD_X5+","+(AUSTRALIS_BORDER_COORD_Y5+AUSTRALIS_BORDER_OFFSET_Y2);
	setAttribute(slimChromeSVGLeft, 'd', d);
	
	// next bit, the right border
	var d = "M "+(1-AUSTRALIS_BORDER_COORD_X5)+","+AUSTRALIS_BORDER_COORD_Y5;
	d += " C";
	d += " "+(1-AUSTRALIS_BORDER_CURVE4_X2)+","+AUSTRALIS_BORDER_CURVE4_Y2;
	d += " "+(1-AUSTRALIS_BORDER_CURVE4_X1)+","+AUSTRALIS_BORDER_CURVE4_Y1;
	d += " "+(1-AUSTRALIS_BORDER_COORD_X4)+","+(AUSTRALIS_BORDER_COORD_Y4-AUSTRALIS_BORDER_OFFSET_YS);
	d += " "+(1-AUSTRALIS_BORDER_CURVE3_X2)+","+(AUSTRALIS_BORDER_CURVE3_Y2-AUSTRALIS_BORDER_OFFSET_YS);
	d += " "+(1-AUSTRALIS_BORDER_CURVE3_X1)+","+(AUSTRALIS_BORDER_CURVE3_Y1-AUSTRALIS_BORDER_OFFSET_YS);
	d += " "+(1-AUSTRALIS_BORDER_COORD_X3)+","+AUSTRALIS_BORDER_COORD_Y3;
	d += " "+(1-AUSTRALIS_BORDER_CURVE2_X2)+","+AUSTRALIS_BORDER_CURVE2_Y2;
	d += " "+(1-AUSTRALIS_BORDER_CURVE2_X1)+","+AUSTRALIS_BORDER_CURVE2_Y1;
	d += " "+(1-AUSTRALIS_BORDER_COORD_X2)+","+AUSTRALIS_BORDER_COORD_Y2;
	d += " "+(1-AUSTRALIS_BORDER_CURVE1_X2)+","+AUSTRALIS_BORDER_CURVE1_Y2;
	d += " "+(1-AUSTRALIS_BORDER_CURVE1_X1)+","+AUSTRALIS_BORDER_CURVE1_Y1;
	d += " "+(1-AUSTRALIS_BORDER_COORD_X1)+","+AUSTRALIS_BORDER_COORD_Y1;
	d += " L "+(1-AUSTRALIS_BORDER_COORD_X5)+","+AUSTRALIS_BORDER_COORD_Y1+" z";
	setAttribute(slimChromeClipPathRight, 'd', d);
	
	// and again the border
	var d = "M "+(1-AUSTRALIS_BORDER_COORD_X5)+","+(AUSTRALIS_BORDER_COORD_Y5+AUSTRALIS_BORDER_OFFSET_Y2);
	d += " C";
	d += " "+(1-AUSTRALIS_BORDER_CURVE4_X2)+","+(AUSTRALIS_BORDER_CURVE4_Y2+AUSTRALIS_BORDER_OFFSET_Y2);
	d += " "+(1-AUSTRALIS_BORDER_CURVE4_X1)+","+(AUSTRALIS_BORDER_CURVE4_Y1+AUSTRALIS_BORDER_OFFSET_Y2);
	d += " "+(1-AUSTRALIS_BORDER_COORD_X4)+","+(AUSTRALIS_BORDER_COORD_Y4+AUSTRALIS_BORDER_OFFSET_Y2);
	d += " "+(1-AUSTRALIS_BORDER_CURVE3_X2)+","+AUSTRALIS_BORDER_CURVE3_Y2;
	d += " "+(1-AUSTRALIS_BORDER_CURVE3_X1)+","+AUSTRALIS_BORDER_CURVE3_Y1;
	d += " "+(1-AUSTRALIS_BORDER_COORD_X3)+","+AUSTRALIS_BORDER_COORD_Y3;
	d += " "+(1-AUSTRALIS_BORDER_CURVE2_X2)+","+AUSTRALIS_BORDER_CURVE2_Y2;
	d += " "+(1-AUSTRALIS_BORDER_CURVE2_X1)+","+AUSTRALIS_BORDER_CURVE2_Y1;
	d += " "+(1-AUSTRALIS_BORDER_COORD_X2)+","+(AUSTRALIS_BORDER_COORD_Y2-AUSTRALIS_BORDER_OFFSET_Y1);
	d += " "+(1-AUSTRALIS_BORDER_CURVE1_X2)+","+(AUSTRALIS_BORDER_CURVE1_Y2-AUSTRALIS_BORDER_OFFSET_Y1);
	d += " "+(1-AUSTRALIS_BORDER_CURVE1_X1)+","+(AUSTRALIS_BORDER_CURVE1_Y1-AUSTRALIS_BORDER_OFFSET_Y1);
	d += " "+(1-AUSTRALIS_BORDER_COORD_X1)+","+(AUSTRALIS_BORDER_COORD_Y1-AUSTRALIS_BORDER_OFFSET_Y1);
	setAttribute(slimChromeSVGRight, 'd', d);
};

this.slimChromeNumToolbars = function() {
	var t = 0;
	for(var i=0; i<slimChromeToolbars.childNodes.length; i++) {
		if(!slimChromeToolbars.childNodes[i].hidden && !slimChromeToolbars.childNodes[i].collapsed) {
			t++;
		}
	}
	return t;
};

this.slimChromeStyle = function() {
	setAttribute(gNavToolbox, 'slimStyle', slimStyle);
	slimChromeClipPaths();
};

this.slimChromeStyleOnEnsure = function() {
	// make sure this is applied at least once, and only when the chrome is actually shown
	if(trueAttribute(slimChromeContainer, 'hover') || !trueAttribute(slimChromeContainer, 'onlyURLBar')) {
		var t = slimChromeNumToolbars();
		if(parseInt(slimChromeContainer.getAttribute('numToolbars')) != t) {
			setAttribute(slimChromeContainer, 'numToolbars', slimChromeNumToolbars());
			slimChromeClipPaths();
		}
	}
};

this.slimChromeStyleChildListener = {
	observer: null,
	
	handler: function(mutations) {
		slimChromeStyleOnEnsure();
	}
};

this.slimChromeStyleHiddenListener = {
	observer: null,
	
	handler: function(mutations) {
		slimChromeStyleOnEnsure();
	}
};

// some personas stuff

this.bgGradientWINNT = 'rgba(253,253,253,0.4) 0px, rgba(255,255,255,0) 36px, rgba(255,255,255,0)';
this.bgGradientDARWIN = 'rgba(253,253,253,0.45), rgba(253,253,253,0.45)';
this.bgGradientLINUX = 'rgba(255,255,255,.25) 0px, rgba(255,255,255,0) 36px, rgba(255,255,255,0)';

this.lwtheme = {
	bgImage: '',
	color: '',
	bgColor: ''
};

this.personaChanged = function() {
	aSync(stylePersonaSlimChrome);
};

this.stylePersonaSlimChrome = function() {
	if(typeof(slimChromeContainer) == 'undefined' || !slimChromeContainer || !lastSlimChromeStyle) { return; }
	
	if(!trueAttribute(document.documentElement, 'lwtheme')) {
		lwtheme.bgImage = '';
		lwtheme.color = '';
		lwtheme.bgColor = '';
	}
	else {
		var windowStyle = getComputedStyle(document.documentElement);
		if(lwtheme.bgImage != windowStyle.getPropertyValue('background-image') && windowStyle.getPropertyValue('background-image') != 'none') {
			lwtheme.bgImage = windowStyle.getPropertyValue('background-image');
			lwtheme.color = windowStyle.getPropertyValue('color');
			lwtheme.bgColor = windowStyle.getPropertyValue('background-color');
		}
	}
	
	// Unload current stylesheet if it's been loaded
	styleAid.unload('personaSlimChrome_'+_UUID);
	
	if(lwtheme.bgImage != '') {
		var windowStyle = getComputedStyle(document.documentElement);
		var containerBox = slimChromeContainer.getBoundingClientRect();
		var containerStyle = getComputedStyle(slimChromeContainer);
		
		// Another personas in OSX tweak
		var offsetWindowPadding = windowStyle.getPropertyValue('background-position');
		var offsetY = -containerBox.top;
		offsetY += parseInt(containerStyle.getPropertyValue('margin-top'));
		if(offsetWindowPadding.indexOf(' ') > -1 && offsetWindowPadding.indexOf('px', offsetWindowPadding.indexOf(' ') +1) > -1) {
			offsetY += parseInt(offsetWindowPadding.substr(offsetWindowPadding.indexOf(' ') +1, offsetWindowPadding.indexOf('px', offsetWindowPadding.indexOf(' ') +1)));
		}
		
		if(containerStyle.getPropertyValue('direction') == 'ltr') {
			var borderStart = parseInt(containerStyle.getPropertyValue('border-left-width'));
		} else {
			var borderStart = parseInt(containerStyle.getPropertyValue('border-right-width'));
		}
		
		// +1/-1 compensates for borders misplacement in CSS
		if(LTR) {
			var offsetX = -lastSlimChromeStyle.left +document.documentElement.clientWidth -borderStart;
			var fullOffsetX = -lastSlimChromeStyle.fullLeft +document.documentElement.clientWidth -borderStart;
			var australisOffsetX = offsetX -AUSTRALIS_BORDER_WIDTH -AUSTRALIS_BORDER_MARGIN_ADJUST_TOOLBARS;
			var australisOffsetXLeft = offsetX +1;
			var australisOffsetXRight = lastSlimChromeStyle.right +AUSTRALIS_BORDER_WIDTH +borderStart -1;
		} else {
			var offsetX = -lastSlimChromeStyle.right -borderStart;
			var fullOffsetX = -lastSlimChromeStyle.fullRight -borderStart;
			var australisOffsetX = offsetX -AUSTRALIS_BORDER_WIDTH -AUSTRALIS_BORDER_MARGIN_ADJUST_TOOLBARS;
			var australisOffsetXRight = offsetX +1;
			var australisOffsetXLeft = -document.documentElement.clientWidth +lastSlimChromeStyle.left +AUSTRALIS_BORDER_WIDTH +borderStart -1;
		}
		
		var bgGradient = (WINNT) ? bgGradientWINNT : (DARWIN) ? bgGradientDARWIN : bgGradientLINUX;
		
		var sscode = '/*The Fox, only better CSS declarations of variable values*/\n';
		sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
		sscode += '@-moz-document url("'+document.baseURI+'") {\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-toolbars,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-toolbars-before,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-toolbars-after {\n';
		sscode += '	  background-color: ' + lwtheme.bgColor + ' !important;\n';
		sscode += '	  color: ' + lwtheme.color + ' !important;\n';
		sscode += '	  background-repeat: repeat !important;\n';
		sscode += '	  background-size: auto auto !important;\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-toolbars,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-toolbars-before,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-toolbars-after {\n';
		sscode += '	  background-image: linear-gradient('+((DARWIN) ? bgGradient : 'transparent, transparent')+'), ' + lwtheme.bgImage + ' !important;\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-slimmer:not([collapsed]) ~ #'+objName+'-slimChrome-container:not([RSSTicker]) > #'+objName+'-slimChrome-toolbars,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-slimmer:not([collapsed]) ~ #'+objName+'-slimChrome-container:not([RSSTicker]) > #'+objName+'-slimChrome-toolbars-before,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-slimmer:not([collapsed]) ~ #'+objName+'-slimChrome-container:not([RSSTicker]) > #'+objName+'-slimChrome-toolbars-after {\n';
		sscode += '	  background-image: linear-gradient('+bgGradient+'), ' + lwtheme.bgImage + ' !important;\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-toolbars {\n';
		sscode += '	  background-position: 0% 0%, '+((RTL) ? 'right' : 'left')+' '+offsetX+'px top '+offsetY+'px !important;\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #navigator-toolbox[slimStyle="full"] #'+objName+'-slimChrome-container:-moz-any([hover],:not([onlyURLBar])) #'+objName+'-slimChrome-toolbars {\n';
		sscode += '	  background-position: 0% 0%, '+((RTL) ? 'right' : 'left')+' '+fullOffsetX+'px top '+offsetY+'px !important;\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #navigator-toolbox[slimStyle="australis"] #'+objName+'-slimChrome-container:-moz-any([hover],:not([onlyURLBar])) #'+objName+'-slimChrome-toolbars {\n';
		sscode += '	  background-position: 0% 0%, '+((RTL) ? 'right' : 'left')+' '+australisOffsetX+'px top '+offsetY+'px !important;\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-toolbars-before:-moz-locale-dir(ltr),\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-toolbars-after:-moz-locale-dir(rtl) {\n';
		sscode += '	  background-position: 0% 0%, '+((RTL) ? 'right' : 'left')+' '+australisOffsetXLeft+'px top '+offsetY+'px !important;\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-toolbars-after:-moz-locale-dir(ltr),\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-slimChrome-toolbars-before:-moz-locale-dir(rtl) {\n';
		sscode += '	  background-position: 0% 0%, '+((RTL) ? 'right' : 'left')+' '+australisOffsetXRight+'px top '+offsetY+'px !important;\n';
		sscode += '	}\n';
		sscode += '}';
		
		styleAid.load('personaSlimChrome_'+_UUID, sscode, true);
	}
};

this.slimChromeStyleOnLoad = function() {
	// observe when toolbars are added or removed from the container
	slimChromeStyleChildListener.observer = new window.MutationObserver(slimChromeStyleChildListener.handler);
	slimChromeStyleChildListener.observer.observe(slimChromeToolbars, { childList: true });
	
	// observe when toolbars in the container are enabled or disabled
	slimChromeStyleHiddenListener.observer = new window.MutationObserver(slimChromeStyleHiddenListener.handler);
	slimChromeStyleHiddenListener.observer.observe(slimChromeToolbars, { attributes: true, attributeFilter: ['hidden', 'collapsed'], subtree: true });
	
	slimChromeStyle();
	aSync(stylePersonaSlimChrome, 1000);
};

this.slimChromeStyleOnUnload = function() {
	slimChromeStyleChildListener.observer.disconnect();
	slimChromeStyleHiddenListener.observer.disconnect();
	
	delete slimChromeContainer._borderSize;
	delete slimChromeContainer._lastWidth;
	delete slimChromeContainer._lastHeight;
	
	removeAttribute(gNavToolbox, 'slimStyle');
};

moduleAid.LOADMODULE = function() {
	prefAid.listen('slimStyle', slimChromeStyle);
	
	listenerAid.add(window, 'LoadedSlimChrome', slimChromeStyleOnLoad);
	listenerAid.add(window, 'UnloadingSlimChrome', slimChromeStyleOnUnload);
	listenerAid.add(window, 'MovedSlimChrome', slimChromeClipPaths);
	listenerAid.add(window, 'EnsureSlimChrome', slimChromeStyleOnEnsure);
	
	// support personas in hovering toolbox
	observerAid.add(personaChanged, "lightweight-theme-styling-update");
	
	slimChromeStyle();
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(window, 'LoadedSlimChrome', slimChromeStyleOnLoad);
	listenerAid.remove(window, 'UnloadingSlimChrome', slimChromeStyleOnUnload);
	listenerAid.remove(window, 'MovedSlimChrome', slimChromeClipPaths);
	listenerAid.remove(window, 'EnsureSlimChrome', slimChromeStyleOnEnsure);
	observerAid.remove(personaChanged, "lightweight-theme-styling-update");
	
	prefAid.unlisten('slimStyle', slimChromeStyle);
	
	styleAid.unload('slimChromeSVG_'+_UUID);
	
	if(slimChromeStyleChildListener.observer) {
		slimChromeStyleChildListener.observer.disconnect();
	}
	if(slimChromeStyleHiddenListener.observer) {
		slimChromeStyleHiddenListener.observer.disconnect();
	}
	
	removeAttribute(gNavToolbox, 'slimStyle');
};
