Modules.VERSION = '1.0.1';

Modules.LOADMODULE = function() {
	slimChromeExceptions.push('hackBarToolbar');
	
	// we move the hackBar to a place where it won't be sent into our hiding container
	$('browser-bottombox').appendChild($('hackBarToolbar'));
};

Modules.UNLOADMODULE = function() {
	slimChromeExceptions.splice(slimChromeExceptions.indexOf('hackBarToolbar'), 1);
	
	gNavToolbox.appendChild($('hackBarToolbar'));
};
