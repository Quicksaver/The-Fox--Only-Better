// VERSION 2.0.0

this.__defineGetter__('DownloadsIndicatorView', function() { return window.DownloadsIndicatorView; });
this.__defineGetter__('DownloadsCommon', function() { return window.DownloadsCommon; });

this.downloadsIndicator = {
	notification: null,

	handleEvent: function(e) {
		switch(e.type) {
			case 'FinishedSlimChromeWidth':
				if(this.notification) {
					DownloadsIndicatorView._showEventNotification(this.notification);
					this.notification = null;
				}
				break;

			case 'popupshowing':
				if(e.target.id == 'downloadsPanel') {
					Listeners.remove(window, 'popupshowing', this);
					Listeners.add(e.target, 'AskingForNodeOwner', this);
				}
				break;

			case 'AskingForNodeOwner':
				e.detail = 'downloads-button';
				e.stopPropagation();
				break;
		}
	}
};

Modules.LOADMODULE = function() {
	Piggyback.add('downloadsIndicator', DownloadsIndicatorView, 'showEventNotification', function(aType) {
		// we're already opening to animate, so don't animate again, just replace the previous animation type
		if(downloadsIndicator.notification) {
			downloadsIndicator.notification = aType;
			return false;
		}

		// only pause animation if the button is in the slimChromeContainer
		if(typeof(slimChrome) != 'undefined'
		&& this._initialized && DownloadsCommon.animateNotifications
		&& (	isAncestor($('downloads-button'), slimChrome.container)
			|| isAncestor($('downloads-button'), overflowList)
			// not using CUI.getPlacementOfWidget because this involves less checks
			|| CustomizableUI.getWidgetIdsInArea('PanelUI-contents').indexOf('downloads-button') > -1)
		) {
			// if container is hidden, pause until it is shown
			if(!trueAttribute(slimChrome.container, 'hover')) {
				downloadsIndicator.notification = aType;
				slimChrome.initialShow();
				return false;
			}

			// container is not hidden, so keep showing it until animation is done at least
			slimChrome.initialShow(1500);
		}

		return true;
	}, Piggyback.MODE_BEFORE);

	// the downloadsPanel is only created when first called
	if($('downloadsPanel')) {
		Listeners.add($('downloadsPanel'), 'AskingForNodeOwner', downloadsIndicator);
	} else {
		Listeners.add(window, 'popupshowing', downloadsIndicator);
	}

	Listeners.add(window, 'FinishedSlimChromeWidth', downloadsIndicator);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'FinishedSlimChromeWidth', downloadsIndicator);
	Listeners.remove($('downloadsPanel'), 'AskingForNodeOwner', downloadsIndicator);
	Listeners.remove(window, 'popupshowing', downloadsIndicator);

	Piggyback.revert('downloadsIndicator', DownloadsIndicatorView, 'showEventNotification');
};
