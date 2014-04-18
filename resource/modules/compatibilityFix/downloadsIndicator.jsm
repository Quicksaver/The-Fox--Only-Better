moduleAid.VERSION = '1.0.2';

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
		// we're already opening to animate, so don't animate again, just replace the previous animation type
		if(reDoDownloadsNotifications) {
			reDoDownloadsNotifications = aType;
			return;
		}
		
		// only pause animation if the button is in the slimChromeContainer
		if(typeof(slimChromeContainer) != 'undefined'
		&& this._initialized && DownloadsCommon.animateNotifications
		&& (isAncestor($('downloads-button'), slimChromeContainer) || isAncestor($('downloads-button'), overflowList))) {
			// if container is hidden, pause until it is shown
			if(!trueAttribute(slimChromeContainer, 'hover')) {
				reDoDownloadsNotifications = aType;
				initialShowChrome();
				return;
			}
			
			// container is not hidden, so keep showing it until animation is done at least
			initialShowChrome(1500);
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
