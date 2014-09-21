moduleAid.VERSION = '1.0.0';

this.__defineGetter__('AniWeatherBrowserAgent', function() { return window.AniWeatherBrowserAgent; });

moduleAid.LOADMODULE = function() {
	AniWeatherBrowserAgent._prepareReportById = AniWeatherBrowserAgent.prepareReportById;
	AniWeatherBrowserAgent.prepareReportById = function(reportId, anchor, disp) {
		this._prepareReportById(reportId, anchor, disp);
		
		// don't let slim chrome hide the top of the animation popups
		styleAid.unload('aniWeahter_'+_UUID);
		if(typeof(slimChromeContainer) != 'undefined' && trueAttribute(slimChromeContainer, 'hover')) {
			var sscode = '/*The Fox, Only Better CSS declarations of variable values*/\n';
			sscode += '@namespace url(http://www.w3.org/1999/xhtml);\n';
			sscode += '#weatherLauncher { margin-top: '+slimChromeContainer.clientHeight+'px !important; }\n';
			styleAid.load('aniWeahter_'+_UUID, sscode, true);
		}
	};
	
	AniWeatherBrowserAgent._cancelReport = AniWeatherBrowserAgent.cancelReport;
	AniWeatherBrowserAgent.cancelReport = function(event) {
		this._cancelReport(event);
		styleAid.unload('aniWeahter_'+_UUID);
	};
};

moduleAid.UNLOADMODULE = function() {
	AniWeatherBrowserAgent.prepareReportById = AniWeatherBrowserAgent._prepareReportById;
	AniWeatherBrowserAgent.cancelReport = AniWeatherBrowserAgent._cancelReport;
	delete AniWeatherBrowserAgent._prepareReportById;
	delete AniWeatherBrowserAgent._cancelReport;
	styleAid.unload('aniWeahter_'+_UUID);
};
