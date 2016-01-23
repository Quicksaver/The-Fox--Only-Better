// VERSION 1.0.0

this.AwsesomerUnifiedComplete = {
	get useOverride () { return UnifiedComplete.enabled; },

	onUnifiedComplete: function() {
		if(useOverride) {
			this.init();
		} else {
			this.uninit();
		}
	},

	handleEvent: function(e) {
		switch(e.type) {
			case 'SlimChromeMovedNavBar':
				// If we're listening, then we should be initializing it.
				this.init();
				break;
		}
	},

	init: function() {
		let args = gURLBar.getAttribute('autocompletesearch').split(" ");
		let iA = args.indexOf('awesomerunifiedcomplete');
		if(iA == -1) {
			let iU = args.indexOf('unifiedcomplete');
			if(iU > -1) {
				args.splice(iU, 1);
			}
			args.push('awesomerunifiedcomplete');

			gURLBar.setAttribute('autocompletesearch', args.join(" "));
			gURLBar.mSearchNames = null;

			// Make sure we keepit initialized when Slim Chrome resets the binding.
			Listeners.add(gNavBar, 'SlimChromeMovedNavBar', this);
		}
	},

	uninit: function() {
		Listeners.remove(gNavBar, 'SlimChromeMovedNavBar', this);

		let args = gURLBar.getAttribute('autocompletesearch').split(" ");
		let iA = args.indexOf('awesomerunifiedcomplete');
		if(iA > -1) {
			args.splice(iA, 1);
			if(Prefs.unifiedcomplete) {
				let iU = args.indexOf('unifiedcomplete');
				if(iU == -1) {
					args.push('unifiedcomplete');
				}
			} else {
				let iI = args.indexOf('urlinline');
				if(iI == -1) {
					args.push('urlinline');
				}
				let iH = args.indexOf('history');
				if(iH == -1) {
					args.push('history');
				}
			}

			gURLBar.setAttribute('autocompletesearch', args.join(" "));
			gURLBar.mSearchNames = null;
		}
	}
};

Modules.LOADMODULE = function() {
	UnifiedComplete.register(AwsesomerUnifiedComplete);
	if(AwsesomerUnifiedComplete.useOverride) {
		AwsesomerUnifiedComplete.init();
	}
};

Modules.UNLOADMODULE = function() {
	UnifiedComplete.unregister(AwsesomerUnifiedComplete);
	AwsesomerUnifiedComplete.uninit();
};
