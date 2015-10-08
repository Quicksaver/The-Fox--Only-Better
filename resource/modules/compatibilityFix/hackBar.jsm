// VERSION 1.0.2

Modules.LOADMODULE = function() {
	slimChromeExceptions.add('hackBarToolbar');
	
	// we move the hackBar to a place where it won't be sent into our hiding container
	$('browser-bottombox').appendChild($('hackBarToolbar'));
};

Modules.UNLOADMODULE = function() {
	slimChromeExceptions.delete('hackBarToolbar');
	
	gNavToolbox.appendChild($('hackBarToolbar'));
};
