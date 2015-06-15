Modules.VERSION = '2.0.1';

this.slimChrome = {
	miniActive: false,
	lastHost: null,
	
	handleEvent: function(e) {
		switch(e.type) {
			case 'focus':
				this.focusPasswords(e.target, true);
				break;
				
			case 'blur':
				this.focusPasswords(e.target, false);
				break;
		}
	},
	
	focusPasswords: function(target, focus) {
		var active = false;
		
		if(focus
		&& target
		&& target.nodeName
		&& target.nodeName.toLowerCase() == 'input'
		&& !target.disabled
		&& (Prefs.miniOnAllInput || target.type == 'password')) {
			active = true;
		}
		
		if(active != this.miniActive) {
			this.miniActive = active;
			message('focusPasswords', this.miniActive);
		}
	},
	
	onLocationChange: function(aProgress, aRequest, aURI) {
		try { var host = aURI.host; }
		catch(ex) { var host = aURI.specIgnoringRef || aURI.spec; }
		
		// no point in showing in certain cases
		if(host == this.lastHost) { return; }
		
		this.lastHost = host;
		message('locationChange', { host: host, spec: aURI.specIgnoringRef || aURI.spec });
	},
	
	onDOMContentLoaded: function() {
		// I don't think there's a way to do this without relying on each document's MutationObserver instance
		try {
			var observer = new content.MutationObserver((mutations) => {
				try { this.focusPasswords(document.activeElement, true); }
				catch(ex) {}
			});
			observer.observe(document.documentElement, { childList: true, subtree: true });
		}
		catch(ex) {}
	},
	
	// this is needed in content progress listeners (for some reason)
	QueryInterface: XPCOMUtils.generateQI([Ci.nsIWebProgressListener, Ci.nsISupportsWeakReference]),
};

Modules.LOADMODULE = function() {
	// show mini chrome when focusing password fields
	Listeners.add(Scope, 'focus', slimChrome, true);
	Listeners.add(Scope, 'blur', slimChrome, true);
	
	// show mini when the current tab changes host
	webProgress.addProgressListener(slimChrome, Ci.nsIWebProgress.NOTIFY_ALL);
	
	// observe when any changes to the webpage are made, so that for instance when a focused input field is removed, the mini bar doesn't stay stuck open
	DOMContentLoaded.add(slimChrome);
	slimChrome.onDOMContentLoaded();
};

Modules.UNLOADMODULE = function() {
	webProgress.removeProgressListener(slimChrome);
	DOMContentLoaded.remove(slimChrome);
	Listeners.remove(Scope, 'focus', slimChrome, true);
	Listeners.remove(Scope, 'blur', slimChrome, true);
};
