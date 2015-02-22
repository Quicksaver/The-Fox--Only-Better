Modules.VERSION = '1.1.7';

this.__defineGetter__('slimChromePopup', function() { return $('slimChromeKeyset-menupopup'); });

this.isStillAvailable = function(key, list) {
	if(!list[key.keycode]) { return false; }
	return true;
};

this.fillKeycodes = function() {
	var slimChromeKey = {
		keycode: $('slimChromeKeyset-menu').value,
		accel: $('accelCheckboxSlimChrome').checked,
		shift: $('shiftCheckboxSlimChrome').checked,
		alt: $('altCheckboxSlimChrome').checked
	};
	
	var slimChromeAvailable = Keysets.getAvailable(slimChromeKey, [slimChromeKey]);
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
	
	for(var item of slimChromePopup.childNodes) {
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

this.initialShowInWindow = function(aWindow, style, animation, duration) {
	if(aWindow[objName] && aWindow[objName].initialShowChrome && aWindow[objName].slimChromeStyle) {
		aWindow[objName].slimStyle = style;
		aWindow[objName].slimAnimation = animation;
		aWindow[objName].initialShowChrome(duration);
	}
};

this.initialShowInOpener = function(style, animation, duration) {
	Timers.init('initialShowInOpener', function() {
		if(window.opener && window.opener instanceof window.opener.ChromeWindow) {
			initialShowInWindow(window.opener, style, animation, duration);
		} else {
			var tempShow = function(aWindow) {
				initialShowInWindow(aWindow, style, animation, duration);
			};
			Windows.callOnMostRecent(tempShow, 'navigator:browser');
		}
	}, 150);
};

this.openReleaseNotesTab = function(aWindow) {
	aWindow.gBrowser.selectedTab = aWindow.gBrowser.addTab('about:'+objPathString);
	aWindow.gBrowser.selectedTab.loadOnStartup = true; // for Tab Mix Plus
};

this.openReleaseNotes = function(e) {
	if(e.type == 'click' && e.which != 1) { return; }
	if(e.type == 'keypress' && e.keycode != e.DOM_VK_RETURN) { return; }
	
	if(window.opener && window.opener instanceof window.opener.ChromeWindow && window.opener.gBrowser) {
		openReleaseNotesTab(window.opener);
	} else {
		Windows.callOnMostRecent(openReleaseNotesTab, 'navigator:browser');
	}
	
	e.preventDefault();
	e.stopPropagation();
};

Modules.LOADMODULE = function() {
	if(DARWIN) {
		Overlays.overlayWindow(window, 'optionsMac');
	}
	
	fillKeycodes();
	fillVersion($('addonVersion'));
	
	Listeners.add($('releaseNotesLink'), 'keypress', openReleaseNotes, true);
	Listeners.add($('releaseNotesLink'), 'click', openReleaseNotes, true);
};
