// VERSION 1.0.0

// I don't particularly like the code in here, but this is how Diigo is built
// and I just need to fix a bug to make it work with Slim Chrome correctly

this.__defineGetter__('diigo', function() { return window.diigo; });
this.__defineGetter__('diigoUtil', function() { return window.diigoUtil; });

this.diigoListener = function() {
	diigo.Chevron.doResize();
};

Modules.LOADMODULE = function() {
	Piggyback.add('slimChrome', diigo.Chevron, 'doResize', function() {
		var tb = $('diigotb-toolbar');

		//do nothing if the toolbar is collapsed
		if(tb.collapsed) { return; }
		
		var chevron = $("diigoChevron");
		var upgrad = $("diigotb-tb-upgradebtn");
		var spacer = $("diigotb-tb-spacer");
		if(!chevron || !upgrad || !spacer) { return; }
		
		var roomLeft;
		function isOverflowing() {
			roomLeft = spacer.clientWidth;
			diigoUtil.dump('toolbar resize', 'overflowing: ', roomLeft);
			return roomLeft == 0;
		}
		
		diigoUtil.dump('toolbar resize', 'overflowing: ', isOverflowing());
		
		function tryToSqueezeSearchBox() {
			diigoUtil.dump('[Chevron] squeezing search box', roomLeft);
			
			var j = $('diigotb-tb-searchBox');
			if(!trueAttribute(j, 'diigohidden') && !diigoUtil.toBoolean(j.getAttribute('chevron'))) {
				var jj = $('Diigo-X-SearchBox-Container');
				var minWidth = parseInt(jj.getAttribute('minwidth'));
				var squeeze = jj.boxObject.width - minWidth;
				
				diigoUtil.dump('[Chevron] max squeeze ', squeeze, squeeze >= -roomLeft);
				if(squeeze >= -roomLeft){
					var newlength = jj.boxObject.width - (-roomLeft);
					setAttribute(jj.parentNode, 'width', newlength);
					setAttribute(jj, 'width', newlength);
				}
			}
			return !isOverflowing();
		}
		
		if(isOverflowing()) {
			chevron.collapsed = false;
			var whatToChevron = this.whatToChevron(false);
			
			for(var i = whatToChevron.length - 1, ele; ele = whatToChevron[i], i >= 0; i--) {
				if(ele.id == 'diigotb-tb-searchBox' && tryToSqueezeSearchBox()) {
					break;
				} else {
					diigoUtil.dump('[Chevron] hidden id', ele.id);
					this.chevron(ele, true);
					if(!isOverflowing()) { break; }
				}
			}
		} else {
			chevron.collapsed = true;
			var chevroned = this.whatToChevron(true);
			
			//so we still have some room, try to unchevron to fill the free space
			for (var i = 0, len = chevroned.length, ele; ele = chevroned[i], i < len; i++) {
				this.chevron(ele, false);
				
				//if the unchevron action makes it overflow, undo
				if(isOverflowing()) {
					if(ele.id != 'diigotb-tb-searchBox' || !tryToSqueezeSearchBox()) {
						this.chevron(ele, true);
						chevron.collapsed = false;
					}
					
					break;
				}
			}
		}
	});
	
	Listeners.add(window, 'FinishedSlimChromeWidth', diigoListener);
};

Modules.UNLOADMODULE = function() {
	Piggyback.revert('slimChrome', diigo.Chevron, 'doResize');
	
	Listeners.remove(window, 'FinishedSlimChromeWidth', diigoListener);
};
