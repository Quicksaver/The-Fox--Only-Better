moduleAid.VERSION = '1.0.2';

this.__defineGetter__('slimChromeClipPathURLBarWrapper', function() { return $(objName+'-slimChrome-clipPath-urlbar-wrapper-path'); });
this.__defineGetter__('slimChromeClipPathContainer', function() { return $(objName+'-slimChrome-clipPath-container-path'); });
this.__defineGetter__('slimChromeSVGBefore', function() { return $(objName+'-slimChrome-svg-before-path'); });
this.__defineGetter__('slimChromeSVGAfter', function() { return $(objName+'-slimChrome-svg-after-path'); });

this.AUSTRALIS_BORDER_WIDTH = 26; // the size of the border element, basically how far it extends
this.AUSTRALIS_BORDER_WIDTH_INCR = 6; // how much should the border extend with each toolbar added, so that it doesn't distort
this.AUSTRALIS_BORDER_OFFSET_X1 = 0.015; // percentage by which the border svg should be offset of the actual clipPath, so that it looks thicker (top)
this.AUSTRALIS_BORDER_OFFSET_Y1 = 0.03; // percentage by which the border svg ends should be offset of the actual clipPath (top)
this.AUSTRALIS_BORDER_OFFSET_X2 = 0.02; // percentage by which the border svg should be offset of the actual clipPath, so that it looks thicker (bottom)
this.AUSTRALIS_BORDER_OFFSET_Y2 = 0.02; // percentage by which the border svg ends should be offset of the actual clipPath (bottom)
this.AUSTRALIS_BORDER_PADDING_ADJUST_NAVBAR = -12; // this is added to AUSTRALIS_BORDER_WIDTH and that is applied as the navbar's padding
this.AUSTRALIS_BORDER_PADDING_ADJUST_OTHERS = -5; // this is added to AUSTRALIS_BORDER_WIDTH and that is applied as all toolbars' padding

// the following define the shape and curvature of the australis-style container borders; values are a decimal percentage of the total border size
// used as "M COORD_X1,COORD_Y1 C CURVE1_X1,CURVE1_Y1 CURVE1_X2,CURVE1_Y2 COORD_X2,COORD_Y2 CURVE1_X1,CURVE1_Y1 CURVE2_X2,CURVE2_Y2 COORD_X3,COORD_Y3";
// see https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths

this.AUSTRALIS_BORDER_CURVE1_X1 = 0.4;
this.AUSTRALIS_BORDER_CURVE1_Y1 = 0.05;
this.AUSTRALIS_BORDER_CURVE1_X2 = 0.48;
this.AUSTRALIS_BORDER_CURVE1_Y2 = 0.30;

this.AUSTRALIS_BORDER_CURVE2_X1 = 0.55;
this.AUSTRALIS_BORDER_CURVE2_Y1 = 0.5;
this.AUSTRALIS_BORDER_CURVE2_X2 = 0.45;
this.AUSTRALIS_BORDER_CURVE2_Y2 = 1;

this.AUSTRALIS_BORDER_COORD_X1 = 0;
this.AUSTRALIS_BORDER_COORD_Y1 = 0;
this.AUSTRALIS_BORDER_COORD_X2 = 0.5;
this.AUSTRALIS_BORDER_COORD_Y2 = 0.5;
this.AUSTRALIS_BORDER_COORD_X3 = 1;
this.AUSTRALIS_BORDER_COORD_Y3 = 1;

this.slimChromeClipPaths = function() {
	if(prefAid.slimStyle == 'compact') {
		var d = !DARWIN ? 'm 1,-5 l 0,7.8 l 0,0.2 l 0,22l10000,0 l 0,-50 l -10000,0 z' : 'M 1,-5 l 0,34 l 10000,0 l 0,-34 l -10000,0 z';
		setAttribute(slimChromeClipPathURLBarWrapper, 'd', d);
		
		return;
	}
	
	if(prefAid.slimStyle != 'australis' || typeof(lastSlimChromeStyle) == 'undefined' || !lastSlimChromeStyle) { return; }
	
	var width = AUSTRALIS_BORDER_WIDTH;
	for(var i=0; i<slimChromeToolbars.childNodes.length; i++) {
		if(!slimChromeToolbars.childNodes[i].hidden && !slimChromeToolbars.childNodes[i].collapsed) {
			width += AUSTRALIS_BORDER_WIDTH_INCR;
		}
	}
	
	// don't bother if nothing changed in the meantime
	if(slimChromeContainer._borderSize == width && slimChromeContainer._lastSize == lastSlimChromeStyle.width) { return; }
	slimChromeContainer._borderSize = width;
	slimChromeContainer._lastSize = lastSlimChromeStyle.width;
	
	// first bit, define the initial point
	var d = "M "+AUSTRALIS_BORDER_COORD_X1+","+(AUSTRALIS_BORDER_COORD_Y1-AUSTRALIS_BORDER_OFFSET_Y1);
	
	// next bit, the left border
	var aC = width /lastSlimChromeStyle.width;
	d += " C";
	d += " "+(AUSTRALIS_BORDER_CURVE1_X1*aC)+","+AUSTRALIS_BORDER_CURVE1_Y1;
	d += " "+(AUSTRALIS_BORDER_CURVE1_X2*aC)+","+AUSTRALIS_BORDER_CURVE1_Y2;
	d += " "+(AUSTRALIS_BORDER_COORD_X2*aC)+","+AUSTRALIS_BORDER_COORD_Y2;
	d += " "+(AUSTRALIS_BORDER_CURVE2_X1*aC)+","+AUSTRALIS_BORDER_CURVE2_Y1;
	d += " "+(AUSTRALIS_BORDER_CURVE2_X2*aC)+","+AUSTRALIS_BORDER_CURVE2_Y2;
	d += " "+(AUSTRALIS_BORDER_COORD_X3*aC)+","+AUSTRALIS_BORDER_COORD_Y3;
	
	// next bit, the full container
	var bC = (lastSlimChromeStyle.width -width) /lastSlimChromeStyle.width;
	d += " L "+aC+",1 "+bC+",1";
	
	// next bit, the right border
	d += " C";
	d += " "+(((1-AUSTRALIS_BORDER_CURVE2_X2)*aC)+bC)+","+AUSTRALIS_BORDER_CURVE2_Y2;
	d += " "+(((1-AUSTRALIS_BORDER_CURVE2_X1)*aC)+bC)+","+AUSTRALIS_BORDER_CURVE2_Y1;
	d += " "+(((1-AUSTRALIS_BORDER_COORD_X2)*aC)+bC)+","+AUSTRALIS_BORDER_COORD_Y2;
	d += " "+(((1-AUSTRALIS_BORDER_CURVE1_X2)*aC)+bC)+","+AUSTRALIS_BORDER_CURVE1_Y2;
	d += " "+(((1-AUSTRALIS_BORDER_CURVE1_X1)*aC)+bC)+","+AUSTRALIS_BORDER_CURVE1_Y1;
	d += " "+(((1-AUSTRALIS_BORDER_COORD_X1)*aC)+bC)+","+(AUSTRALIS_BORDER_COORD_Y1-AUSTRALIS_BORDER_OFFSET_Y1);
	
	// last bit, wrap the whole path
	d += " L 1,0 "+AUSTRALIS_BORDER_COORD_X1+","+AUSTRALIS_BORDER_COORD_Y1+" z";
	
	setAttribute(slimChromeClipPathContainer, 'd', d);
	
	// define the DOM nodes sizes first
	styleAid.unload('slimChromeSVG_'+_UUID);
	
	var sscode = '/*The Fox, Only Better CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([chromehidden~="toolbar"]) #navigator-toolbox[slimStyle="australis"] #'+objName+'-slimChrome-container:-moz-any([hover],:not([onlyURLBar])) #'+objName+'-slimChrome-toolbars-before,\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([chromehidden~="toolbar"]) #navigator-toolbox[slimStyle="australis"] #'+objName+'-slimChrome-container:-moz-any([hover],:not([onlyURLBar])) #'+objName+'-slimChrome-toolbars-after {\n';
	sscode += '		width: ' + width + 'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([chromehidden~="toolbar"]) #navigator-toolbox[slimStyle="australis"] #'+objName+'-slimChrome-container:-moz-any([hover],:not([onlyURLBar])) #'+objName+'-slimChrome-toolbars > *:not(#nav-bar) {\n';
	sscode += '		padding-left: ' + (width +AUSTRALIS_BORDER_PADDING_ADJUST_OTHERS) + 'px !important;\n';
	sscode += '		padding-right: ' + (width +AUSTRALIS_BORDER_PADDING_ADJUST_OTHERS) + 'px !important;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([chromehidden~="toolbar"]) #navigator-toolbox[slimStyle="australis"] #'+objName+'-slimChrome-container:-moz-any([hover],:not([onlyURLBar])) #'+objName+'-slimChrome-toolbars > #nav-bar {\n';
	sscode += '		padding-left: ' + (width +AUSTRALIS_BORDER_PADDING_ADJUST_NAVBAR) + 'px !important;\n';
	sscode += '		padding-right: ' + (width +AUSTRALIS_BORDER_PADDING_ADJUST_NAVBAR) + 'px !important;\n';
	sscode += '	}\n';
	sscode += '}';
	
	styleAid.load('slimChromeSVG_'+_UUID, sscode, true);
	
	// no point in proceeding as these never change, we only need to do the following once
	if(slimChromeSVGBefore.getAttribute('d')) { return; }
	
	// now we draw the actual border strokes
	var left = (RTL) ? slimChromeSVGAfter : slimChromeSVGBefore;
	var right = (RTL) ? slimChromeSVGBefore : slimChromeSVGAfter;
	
	// this is similar to the above, except with the offset applied on X, and it doesn't depend on the width of the container
	var d = "M "+(AUSTRALIS_BORDER_COORD_X1-AUSTRALIS_BORDER_OFFSET_X1)+","+(AUSTRALIS_BORDER_COORD_Y1-AUSTRALIS_BORDER_OFFSET_Y1);
	d += " C";
	d += " "+(AUSTRALIS_BORDER_CURVE1_X1+AUSTRALIS_BORDER_OFFSET_X1)+","+AUSTRALIS_BORDER_CURVE1_Y1;
	d += " "+(AUSTRALIS_BORDER_CURVE1_X2+AUSTRALIS_BORDER_OFFSET_X1)+","+AUSTRALIS_BORDER_CURVE1_Y2;
	d += " "+(AUSTRALIS_BORDER_COORD_X2+AUSTRALIS_BORDER_OFFSET_X1)+","+AUSTRALIS_BORDER_COORD_Y2;
	d += " "+(AUSTRALIS_BORDER_CURVE2_X1+AUSTRALIS_BORDER_OFFSET_X2)+","+AUSTRALIS_BORDER_CURVE2_Y1;
	d += " "+(AUSTRALIS_BORDER_CURVE2_X2+AUSTRALIS_BORDER_OFFSET_X2)+","+AUSTRALIS_BORDER_CURVE2_Y2;
	d += " "+(AUSTRALIS_BORDER_COORD_X3-AUSTRALIS_BORDER_OFFSET_X2)+","+(AUSTRALIS_BORDER_COORD_Y3+AUSTRALIS_BORDER_OFFSET_Y2);
	setAttribute(left, 'd', d);
	
	var d = "M "+(1-AUSTRALIS_BORDER_COORD_X3+AUSTRALIS_BORDER_OFFSET_X2)+","+(AUSTRALIS_BORDER_COORD_Y3+AUSTRALIS_BORDER_OFFSET_Y2);
	d += " C";
	d += " "+(1-(AUSTRALIS_BORDER_CURVE2_X2+AUSTRALIS_BORDER_OFFSET_X2))+","+AUSTRALIS_BORDER_CURVE2_Y2;
	d += " "+(1-(AUSTRALIS_BORDER_CURVE2_X1+AUSTRALIS_BORDER_OFFSET_X2))+","+AUSTRALIS_BORDER_CURVE2_Y1;
	d += " "+(1-(AUSTRALIS_BORDER_COORD_X2+AUSTRALIS_BORDER_OFFSET_X1))+","+AUSTRALIS_BORDER_COORD_Y2;
	d += " "+(1-(AUSTRALIS_BORDER_CURVE1_X2+AUSTRALIS_BORDER_OFFSET_X1))+","+AUSTRALIS_BORDER_CURVE1_Y2;
	d += " "+(1-(AUSTRALIS_BORDER_CURVE1_X1+AUSTRALIS_BORDER_OFFSET_X1))+","+AUSTRALIS_BORDER_CURVE1_Y1;
	d += " "+(1-(AUSTRALIS_BORDER_COORD_X1-AUSTRALIS_BORDER_OFFSET_X1))+","+(AUSTRALIS_BORDER_COORD_Y1-AUSTRALIS_BORDER_OFFSET_Y1);
	setAttribute(right, 'd', d);
};

this.slimChromeStyle = function(show) {
	setAttribute(gNavToolbox, 'slimStyle', prefAid.slimStyle);
	slimChromeClipPaths();
	
	if(show && typeof(initialShowChrome) != 'undefined') {
		initialShowChrome(1500);
	}
};

this.slimChromeStyleChildListener = {
	observer: null,
	
	handler: function(mutations) {
		slimChromeClipPaths();
	}
};

this.slimChromeStyleHiddenListener = {
	observer: null,
	
	handler: function(mutations) {
		slimChromeClipPaths();
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
};

this.slimChromeStyleOnUnload = function() {
	slimChromeStyleChildListener.observer.disconnect();
	slimChromeStyleHiddenListener.observer.disconnect();
	
	delete slimChromeContainer._borderSize;
	delete slimChromeContainer._lastSize;
	
	removeAttribute(gNavToolbox, 'slimStyle');
};

moduleAid.LOADMODULE = function() {
	prefAid.listen('slimStyle', slimChromeStyle);
	
	listenerAid.add(window, 'LoadedSlimChrome', slimChromeStyleOnLoad);
	listenerAid.add(window, 'UnloadingSlimChrome', slimChromeStyleOnUnload);
	listenerAid.add(window, 'MovedSlimChrome', slimChromeClipPaths);
	
	slimChromeStyle();
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(window, 'LoadedSlimChrome', slimChromeStyleOnLoad);
	listenerAid.remove(window, 'UnloadingSlimChrome', slimChromeStyleOnUnload);
	listenerAid.remove(window, 'MovedSlimChrome', slimChromeClipPaths);
	
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
