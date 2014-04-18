moduleAid.VERSION = '1.0.0';

this.__defineGetter__('DownloadsIndicatorView', function() { return window.DownloadsIndicatorView; });
this.__defineGetter__('DownloadsCommon', function() { return window.DownloadsCommon; });

this.reDoDownloadsNotifications = null;

this.downloadsFinishedWidth = function() {
	if(reDoDownloadsNotifications) {
		DownloadsIndicatorView._showEventNotification(reDoDownloadsNotifications);
		reDoDownloadsNotifications = null;
	}
};

moduleAid.LOADMODULE = function() {
	DownloadsIndicatorView._showEventNotification = DownloadsIndicatorView.showEventNotification;
	DownloadsIndicatorView.showEventNotification = function(aType) {
		if(this._initialized && DownloadsCommon.animateNotifications && typeof(slimChromeContainer) != 'undefined' && slimChromeContainer.hovers == 0) {
			reDoDownloadsNotifications = aType;
			initialShowChrome();
			return;
		}
		this._showEventNotification(aType);
	};
	
	listenerAid.add(window, 'FinishedSlimChromeWidth', downloadsFinishedWidth);
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(window, 'FinishedSlimChromeWidth', downloadsFinishedWidth);
	
	DownloadsIndicatorView.showEventNotification = DownloadsIndicatorView._showEventNotification;
	delete DownloadsIndicatorView._showEventNotification;
};
