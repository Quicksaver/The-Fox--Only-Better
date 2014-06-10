moduleAid.VERSION = '1.0.2';

this.__defineGetter__('slimChromePopup', function() { return $('slimChromeKeyset-menupopup'); });

this.isStillAvailable = function(key, list) {
	if(key.keycode != 'none' && !list[key.keycode]) { return false; }
	return true;
};

this.fillKeycodes = function() {
	var slimChromeKey = {
		keycode: $('slimChromeKeyset-menu').value,
		accel: $('accelCheckboxSlimChrome').checked,
		shift: $('shiftCheckboxSlimChrome').checked,
		alt: $('altCheckboxSlimChrome').checked
	};
	
	var slimChromeAvailable = keysetAid.getAvailable(slimChromeKey, true);
	if(!isStillAvailable(slimChromeKey, slimChromeAvailable)) {
		slimChromeKey.keycode = 'none';
	}
	
	var item = slimChromePopup.firstChild.nextSibling;
	while(item) {
		item.setAttribute('hidden', 'true');
		item.setAttribute('disabled', 'true');
		item = item.nextSibling;
	}
	if(slimChromeKey.keycode == 'none') {
		slimChromePopup.parentNode.selectedItem = slimChromePopup.firstChild;
		$(slimChromePopup.parentNode.getAttribute('preference')).value = 'none';
	}
	
	for(var i=1; i<slimChromePopup.childNodes.length; i++) {
		var item = slimChromePopup.childNodes[i];
		var keycode = item.getAttribute('value');
		if(!slimChromeAvailable[keycode]) {
			continue;
		}
		
		item.removeAttribute('hidden');
		item.removeAttribute('disabled');
		if(keycode == slimChromeKey.keycode) {
			slimChromePopup.parentNode.selectedItem = item;
			// It has the annoying habit of re-selecting the first (none) entry when selecting a menuitem with '*' as value
			if(keycode == '*') {
				var slimChromeItemIndex = slimChromePopup.parentNode.selectedIndex;
				aSync(function() { slimChromePopup.parentNode.selectedIndex = slimChromeItemIndex; });
			}
		}
	}
};

this.initialShowInOpener = function(duration) {
	timerAid.init('initialShowInOpener', function() {
		if(window.opener && window.opener.theFoxOnlyBetter && window.opener.theFoxOnlyBetter.initialShowChrome) {
			window.opener.theFoxOnlyBetter.initialShowChrome(duration);
		}
	}, 150);
};

moduleAid.LOADMODULE = function() {
	if(DARWIN) {
		overlayAid.overlayWindow(window, 'optionsMac');
	}
	
	fillKeycodes();
	fillVersion($('addonVersion'));
};
