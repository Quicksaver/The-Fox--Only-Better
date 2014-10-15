// This is the file that is loaded as a content script directly. It helps with defining a "separate" environment in the content
// script, while remaining accessible to the rest of the content scope.
// We have to redefine objName and objPathString here, because there's no easy way to fetch them automatically from defaults.js.
// Important: Do not change anything else other than the name of the object (and again at the bottom) and the objName and objPathString properties!
//
// Use the messenger object to send message safely to this object without conflicting with other add-ons.
// To load or unload modules in the modules/content/ folder into this object, use messenger's loadIn* methods.
// Reserved messages for the messenger system: load, unload, init, reinit, pref, shutdown
//
// Methods that can be used inside content modules:
// listen(aMessage, aListener) - adds aListener as a receiver for when aMessage is passed from chrome to content through the messenger object.
//	aMessage - (string) message to listen to
//	aListener - (function) the listener that will respond to the message. Expects (message) as its only argument; see https://developer.mozilla.org/en-US/docs/The_message_manager
// unlisten(aMessage, aListener) - stops aListener from responding to aMessage.
//	see listen()
// message(aMessage, aListener) - sends a message to chrome to be handled through messenger
//	see listen()
// handleDeadObject(ex) - 	expects [nsIScriptError object] ex. Shows dead object notices as warnings only in the console.
//				If the code can handle them accordingly and firefox does its thing, they shouldn't cause any problems.
//				This should be a copy of the same method in bootstrap.js.
// DOMContentLoaded.add(aMethod) - use this to listen to DOMContentLoaded events, instead of adding a dedicated listener to Scope, to avoid a very weird ZC
//	aMethod - (function) normal event listener
// DOMContentLoaded.remove(aMethod) - undo the above step
//	see DOMContentLoaded.add

this.Cc = Components.classes;
this.Ci = Components.interfaces;
this.Cu = Components.utils;
this.Cm = Components.manager;

this.theFoxOnlyBetter = {
	objName: 'theFoxOnlyBetter',
	objPathString: 'thefoxonlybetter',
	
	initialized: false,
	
	version: '1.2.2',
	Scope: this, // to delete our variable on shutdown later
	get document () { return content.document; },
	$: function(id) { return content.document.getElementById(id); },
	$$: function(sel) { return content.document.querySelectorAll(sel); },
	
	// easy and useful helpers for when I'm debugging
	LOG: function(str) {
		if(!str) { str = typeof(str)+': '+str; }
		this.console.log(this.objName+' '+' :: CONTENT :: '+str);
	},
	
	// some local things
	Addon: null,
	AddonData: {},
	Globals: {},
	prefAid: {},
	
	WINNT: false,
	DARWIN: false,
	LINUX: false,
	
	// and some global (content) things
	webProgress: null,
	
	init: function() {
		this.WINNT = Services.appinfo.OS == 'WINNT';
		this.DARWIN = Services.appinfo.OS == 'Darwin';
		this.LINUX = Services.appinfo.OS != 'WINNT' && Services.appinfo.OS != 'Darwin';
		
		XPCOMUtils.defineLazyModuleGetter(this, "AddonManager", "resource://gre/modules/AddonManager.jsm");
		XPCOMUtils.defineLazyModuleGetter(this, "console", "resource://gre/modules/devtools/Console.jsm");
		XPCOMUtils.defineLazyModuleGetter(this.Scope, "PluralForm", "resource://gre/modules/PluralForm.jsm");
		XPCOMUtils.defineLazyServiceGetter(Services, "navigator", "@mozilla.org/network/protocol;1?name=http", "nsIHttpProtocolHandler");
		
		this.webProgress = docShell.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIWebProgress);
		
		this.DOMContentLoaded.listener = this.DOMContentLoaded.listener.bind(this.DOMContentLoaded);
		this.Scope.addEventListener('DOMContentLoaded', this.DOMContentLoaded.listener);
		
		// and finally our add-on stuff begins
		Services.scriptloader.loadSubScript("resource://"+this.objPathString+"/modules/utils/moduleAid.jsm", this);
		Services.scriptloader.loadSubScript("resource://"+this.objPathString+"/modules/utils/sandboxUtilsPreload.jsm", this);
		Services.scriptloader.loadSubScript("resource://"+this.objPathString+"/modules/utils/windowUtilsPreload.jsm", this);
		
		this.listen('shutdown', this.unload);
		this.listen('load', this.loadModule);
		this.listen('unload', this.unloadModule);
		this.listen('pref', this.carriedPref);
		this.listen('init', this.finishInit);
		this.listen('reinit', this.reinit);
		this.message('init');
	},
	
	finishInit: function(m) {
		this.AddonData = JSON.parse(m.data);
		
		// basic add-on info if needed
		this.AddonManager.getAddonByID(this.AddonData.id, function(addon) {
			this.Addon = addon;
		}.bind(this));
		
		this.initialized = true;
	},
	
	reinit: function() {
		if(!this.initialized) {
			this.message('init');
		}
	},
	
	// aids to listen for messages from chrome
	listeners: [],
	listen: function(aMessage, aListener) {
		for(var i=0; i<this.listeners.length; i++) {
			if(this.listeners[i].message == aMessage && this.listeners[i].listener == aListener) { return; }
		}
		
		this.listeners.push({ message: aMessage, listener: aListener, bound: aListener.bind(this) });
		addMessageListener(this.objName+':'+aMessage, this.listeners[this.listeners.length -1].bound);
	},
	unlisten: function(aMessage, aListener) {
		for(var i=0; i<this.listeners.length; i++) {
			if(this.listeners[i].message == aMessage && this.listeners[i].listener == aListener) {
				removeMessageListener(this.objName+':'+aMessage, this.listeners[i].bound);
				this.listeners.splice(i, 1);
				return;
			}
		}
	},
	
	// send a message to chrome
	message: function(aMessage, aData, aCPOW) {
		sendAsyncMessage(this.objName+':'+aMessage, aData, aCPOW);
	},
	
	// load modules into this object through moduleAid
	loadModule: function(m) {
		this.moduleAid.load('content/'+m.data);
	},
	unloadModule: function(m) {
		this.moduleAid.unload('content/'+m.data);
	},
	
	// we can't access AddonManager (thus FUEL) from content processes, so we simulate it, by syncing this object to the sandbox's prefAid (chrome -> content, one way only)
	carriedPref: function(m) {
		for(var pref in m.data) {
			this.prefAid[pref] = m.data[pref];
		}
	},
	
	// ZC is we add multiple listeners to Scope for DOMContentLoad, no clue why though...
	DOMContentLoaded: {
		handlers: [],
		add: function(aMethod) {
			for(var h of this.handlers) {
				if(h == aMethod) { return; }
			}
			
			this.handlers.push(aMethod);
		},
		remove: function(aMethod) {
			for(var h in this.handlers) {
				if(this.handlers[h] == aMethod) {
					this.handlers.splice(h, 1);
					return;
				}
			}
		},
		listener: function(e) {
			for(var h of this.handlers) {
				try { h(e); } catch(ex) { Cu.reportError(ex); }
			}
		}
	},
	
	// some lazily loaded modules
	
	handleDeadObject: function(ex) {
		if(ex.message == "can't access dead object") {
			var scriptError = Cc["@mozilla.org/scripterror;1"].createInstance(Ci.nsIScriptError);
			scriptError.init("Can't access dead object. This shouldn't cause any problems.", ex.sourceName || ex.fileName || null, ex.sourceLine || null, ex.lineNumber || null, ex.columnNumber || null, scriptError.warningFlag, 'XPConnect JavaScript');
			Services.console.logMessage(scriptError);
			return true;
		} else {
			Cu.reportError(ex);
			return false;
		}
	},
	
	// clean up this object
	unload: function() {
		this.moduleAid.clean();
		
		this.Scope.removeEventListener('DOMContentLoaded', this.DOMContentLoaded.listener);
		
		// remove all listeners, to make sure nothing is left over
		for(var i=0; i<this.listeners.length; i++) {
			removeMessageListener(this.objName+':'+this.listeners[i].message, this.listeners[i].bound);
		}
		
		delete this.Scope[this.objName];
	}
};

theFoxOnlyBetter.init();
