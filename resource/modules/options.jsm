moduleAid.VERSION = '1.1.3';

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
	
	var slimChromeAvailable = keysetAid.getAvailable(slimChromeKey);
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
	timerAid.init('initialShowInOpener', function() {
		if(window.opener && window.opener instanceof window.opener.ChromeWindow) {
			initialShowInWindow(window.opener, style, animation, duration);
		} else {
			var tempShow = function(aWindow) {
				initialShowInWindow(aWindow, style, animation, duration);
			};
			windowMediator.callOnMostRecent(tempShow, 'navigator:browser');
		}
	}, 150);
};

this.openReleaseNotesTab = function(aWindow) {
	// this doesn't work in e10s yet
	//aWindow.gBrowser.selectedTab = aWindow.gBrowser.addTab('about:'+objPathString);
	aWindow.gBrowser.selectedTab = aWindow.gBrowser.addTab('chrome://'+objPathString+'/content/whatsnew.xhtml');
	aWindow.gBrowser.selectedTab.loadOnStartup = true; // for Tab Mix Plus
};

this.openReleaseNotes = function(e) {
	if(e.type == 'click' && e.which != 1) { return; }
	if(e.type == 'keypress' && e.keycode != e.DOM_VK_RETURN) { return; }
	
	if(window.opener && window.opener instanceof window.opener.ChromeWindow) {
		openReleaseNotesTab(window.opener);
	} else {
		windowMediator.callOnMostRecent(openReleaseNotesTab, 'navigator:browser');
	}
	
	e.preventDefault();
	e.stopPropagation();
};

moduleAid.LOADMODULE = function() {
	if(DARWIN) {
		overlayAid.overlayWindow(window, 'optionsMac');
	}
	
	fillKeycodes();
	fillVersion($('addonVersion'));
	
	listenerAid.add($('releaseNotesLink'), 'keypress', openReleaseNotes, true);
	listenerAid.add($('releaseNotesLink'), 'click', openReleaseNotes, true);
};
