moduleAid.VERSION = '1.0.1';

this.__defineGetter__('AniWeatherBrowserAgent', function() { return window.AniWeatherBrowserAgent; });

moduleAid.LOADMODULE = function() {
	piggyback.add('AniWeather', AniWeatherBrowserAgent, 'prepareReportById', function() {
		// don't let slim chrome hide the top of the animation popups
		styleAid.unload('aniWeahter_'+_UUID);
		if(typeof(slimChromeContainer) != 'undefined' && trueAttribute(slimChromeContainer, 'hover')) {
			var sscode = '/*The Fox, Only Better CSS declarations of variable values*/\n';
			sscode += '@namespace url(http://www.w3.org/1999/xhtml);\n';
			sscode += '#weatherLauncher { margin-top: '+slimChromeContainer.clientHeight+'px !important; }\n';
			styleAid.load('aniWeahter_'+_UUID, sscode, true);
		}
	}, piggyback.MODE_AFTER);
	
	piggyback.add('AniWeather', AniWeatherBrowserAgent, 'cancelReport', function() {
		styleAid.unload('aniWeahter_'+_UUID);
	}, piggyback.MODE_AFTER);
};

moduleAid.UNLOADMODULE = function() {
	piggyback.revert('AniWeather', AniWeatherBrowserAgent, 'prepareReportById');
	piggyback.revert('AniWeather', AniWeatherBrowserAgent, 'cancelReport');
	styleAid.unload('aniWeahter_'+_UUID);
};
