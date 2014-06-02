moduleAid.VERSION = '1.0.1';
moduleAid.UTILS = true;

// messenger - 	Aid object to communicate with browser content scripts (e10s).
//		Important: this loads the defaults.js file into every browser window, so make sure that everything in it is wrapped in their own methods,
//		or that at least it won't fail when loaded like this.
// messageBrowser(aBrowser, aMessage, aData, aCPOW) - sends a message to content scripts of a browser
//	aBrowser - (xul element) the browser element to send the message to
//	aMessage - (string) message to send, will be sent as objName-aMessage
//	aData - (string) data to be passed along with the message; can be a JSON-serializable object
//	aCPOW - (object) an object, typically a xul element, that will be proxied to the content script
// messageWindow(aWindow, aMessage, aData, aCPOW) - sends a message to content scripts of all browsers in the provided window
//	aWindow - (obj) window of which all browsers should receive this message
//	see messageBrowser()
// messageAll(aMessage, aData, aCPOW) - sends a message to content scripts of all browsers in all windows
//	see messageBrowser()
// listenBrowser(aBrowser, aMessage, aListener) - registers a listener for messages sent from content scripts through this backbone's methods
//	aBrowser - (xul element) the browser element from which to listen to messages
//	aMessage - (string) - message to listen for
//	aListener - (function) the listener that will respond to the message. Expects (message) as its only argument; see https://developer.mozilla.org/en-US/docs/The_message_manager
// unlistenBrowser(aBrowser, aMessage, aListener) - unregisters a listener for messages sent from content scripts
//	see listenBrowser()
// listenWindow(aWindow, aMessage, aListener) - registers a listener for messages sent from all browsers in the provided window
//	aWindow - (obj) window of which all browsers should be listened to
//	see listenBrowser()
// unlistenWindow(aWindow, aMessage, aListener) - unregisters a listener for messages sent from all browsers in the provided window
//	see listenWindow()
// listenAll(aMessage, aListener) - registers a listener for messages sent from all browsers open in all windows
//	see listenBrowser()
// unlistenAll(aMessage, aListener) - unregisters a listener for messages sent from all browsers open in all windows
//	see listenBrowser()
this.messenger = {
	globalMM: Cc["@mozilla.org/globalmessagemanager;1"].getService(Ci.nsIMessageListenerManager),
	
	messageBrowser: function(aBrowser, aMessage, aData, aCPOW) {
		if(!aBrowser || !aBrowser.messageManager) { return; }
		
		aBrowser.messageManager.sendAsyncMessage(objName+':'+aMessage, aData, aCPOW);
	},
	
	messageWindow: function(aWindow, aMessage, aData, aCPOW) {
		if(!aWindow || !aWindow.messageManager) { return; }
		
		aWindow.messageManager.broadcastAsyncMessage(objName+':'+aMessage, aData, aCPOW);
	},
	
	messageAll: function(aMessage, aData, aCPOW) {
		this.globalMM.broadcastAsyncMessage(objName+':'+aMessage, aData, aCPOW);
	},
	
	listenBrowser: function(aBrowser, aMessage, aListener) {
		if(!aBrowser || !aBrowser.messageManager) { return; }
		
		aBrowser.messageManager.addMessageListener(objName+':'+aMessage, aListener);
	},
	
	unlistenBrowser: function(aBrowser, aMessage, aListener) {
		if(!aBrowser || !aBrowser.messageManager) { return; }
		
		aBrowser.messageManager.removeMessageListener(objName+':'+aMessage, aListener);
	},
	
	listenWindow: function(aWindow, aMessage, aListener) {
		if(!aWindow || !aWindow.messageManager) { return; }
		
		aWindow.messageManager.addMessageListener(objName+':'+aMessage, aListener);
	},
	
	unlistenWindow: function(aWindow, aMessage, aListener) {
		if(!aWindow || !aWindow.messageManager) { return; }
		
		aWindow.messageManager.removeMessageListener(objName+':'+aMessage, aListener);
	},
	
	listenAll: function(aMessage, aListener) {
		this.globalMM.addMessageListener(objName+':'+aMessage, aListener);
	},
	
	unlistenAll: function(aMessage, aListener) {
		this.globalMM.removeMessageListener(objName+':'+aMessage, aListener);
	},
	
	getInitialPrefs: function(m) {
		var current = {};
		for(var pref in prefList) {
			if(pref.startsWith('NoSync_')) { continue; }
			current[pref] = prefAid[pref];
		}
		messenger.messageBrowser(m.target, 'pref', current);
	},
	
	carryPref: function(pref, val) {
		if(pref.startsWith('NoSync_')) { return; }
		
		var carry = {};
		carry[pref] = val;
		messenger.messageAll('pref', carry);
	}
};

moduleAid.LOADMODULE = function() {
	messenger.listenAll('getPrefAid', messenger.getInitialPrefs);
	messenger.globalMM.loadFrameScript('resource://'+objPathString+'/modules/utils/content.js', true);
	
	for(var pref in prefList) {
		if(pref.startsWith('NoSync_')) { continue; }
		
		prefAid.listen(pref, messenger.carryPref);
	}
};

moduleAid.UNLOADMODULE = function() {
	messenger.unlistenAll('getPrefAid', messenger.getInitialPrefs);
	
	for(var pref in prefList) {
		if(pref.startsWith('NoSync_')) { continue; }
		
		prefAid.unlisten(pref, messenger.carryPref);
	}
	
	messenger.messageAll('shutdown');
};
