moduleAid.VERSION = '1.0.0';

moduleAid.LOADMODULE = function() {
	slimChromeExceptions.push('hackBarToolbar');
	
	// we move the hackBar to a place where it won't be sent into our hiding container
	$('browser-bottombox').appendChild($('hackBarToolbar'));
};

moduleAid.UNLOADMODULE = function() {
	slimChromeExceptions.splice(slimChromeExceptions.indexOf('hackBarToolbar'), 1);
	
	gNavToolbox.appendChild($('hackBarToolbar'));
};
