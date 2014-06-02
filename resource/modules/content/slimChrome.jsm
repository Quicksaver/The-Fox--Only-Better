moduleAid.VERSION = '1.0.0';

this.focusPasswords = function(e) {
	if(e.target
	&& e.target.nodeName
	&& e.target.nodeName.toLowerCase() == 'input'
	&& !e.target.disabled
	&& (prefAid.miniOnAllInput || e.target.type == 'password')) {
		message('focusPasswords', (e.type == 'focus'));
	}
};

this.slimChromeProgressListener = {
	// this is needed in content progress listeners (for some reason)
	QueryInterface: XPCOMUtils.generateQI([Ci.nsIWebProgressListener, Ci.nsISupportsWeakReference]),
	
	last: null,
	onLocationChange: function(aProgress, aRequest, aURI) {
		try { var host = aURI.host; }
		catch(ex) { var host = aURI.spec; }
		
		// no point in showing in certain cases
		if(host == this.last) { return; }
		
		this.last = host;
		message('locationChange', { host: host, spec: aURI.spec });
	}
};

moduleAid.LOADMODULE = function() {
	// show mini chrome when focusing password fields
	listenerAid.add(Scope, 'focus', focusPasswords, true);
	listenerAid.add(Scope, 'blur', focusPasswords, true);
	
	// show mini when the current tab changes host
	webProgress.addProgressListener(slimChromeProgressListener, Ci.nsIWebProgress.NOTIFY_ALL);
};

moduleAid.UNLOADMODULE = function() {
	webProgress.removeProgressListener(slimChromeProgressListener);
	
	// these will be removed through listenerAid.clean(), calling them here would just cause an error, as the sandboxTools module wouldn't have been loaded at this point,
	// it couldn't be loaded now because the resource handler has been removed already.
	//listenerAid.remove(Scope, 'focus', focusPasswords, true);
	//listenerAid.remove(Scope, 'blur', focusPasswords, true);
};
