moduleAid.VERSION = '1.1.0';

this.__defineGetter__('whatsNewURL', function() { return 'chrome://'+objPathString+'/content/whatsnew.xhtml'; });
this.__defineGetter__('whatsNewAbout', function() { return 'about:'+objPathString; });

this.whatsNewLastVersion = null;
this.changelog = '';

this.whatsNewInit = function() {
	// not loaded yet?
	if(!$('currentVersion')) { return; }
	
	// needed for all commanders and links and buttons and stuff
	content.command = whatsNewCommand;
	content.allVersions = whatsNewAllVersions;
	content.toggleNotifyOnUpdates = whatsNewToggleNotifyOnUpdates;
	
	// place the current version in the page
	$('currentVersion').textContent = $('currentVersion').textContent.replace('{v}', AddonData.version);
	removeAttribute($('version'), 'invisible');
	
	// carry the preference to chrome process
	$('notifyOnUpdates').addEventListener('change', whatsNewNotifyOnUpdates);
	$('notifyOnUpdates').checked = prefAid.notifyOnUpdates;
	
	// check to see if there is a more recent version available
	Addon.findUpdates(whatsNewCheckAMO, AddonManager.UPDATE_WHEN_PERIODIC_UPDATE);
	
	// need to get the changelog in order to populate it
	message('changeLog');
};

this.whatsNewCommand = function(str) {
	if(typeof(str) != 'string' || !str) { return; }
	message(str);
};

this.whatsNewAllVersions = function() {
	whatsNewFillChangeLog('0');
};

this.whatsNewToggleNotifyOnUpdates = function() {
	$('notifyOnUpdates').checked = !$('notifyOnUpdates').checked;
	whatsNewNotifyOnUpdates();
};

this.whatsNewNotifyOnUpdates = function() {
	message('notifyOnUpdates', $('notifyOnUpdates').checked);
};

this.whatsNewCheckAMO = {
	onUpdateAvailable: function() {
		$('needsupdate').hidden = false;
	},
	onNoUpdateAvailable: function() {
		$('uptodate').hidden = false;
	}
};

this.whatsNewChangeLog = function(m) {
	changelog = JSON.parse(m.data);
	
	whatsNewFillChangeLog(whatsNewLastVersion);
	whatsNewLastVersion = null;
};

this.whatsNewNotifyLastVersion = function(m) {
	whatsNewLastVersion = m.data;
};

// this fills the notes section of the page
this.whatsNewFillChangeLog = function(version) {
	if(!changelog.current) { return; }
	
	if(!version) {
		version = changelog.current;
	}
	
	// clean up that section before we add everything to it
	while($('notes').firstChild) {
		$('notes').firstChild.remove();
	}
		
	for(var release in changelog.releases) {
		if(Services.vc.compare(release, version) > 0 || (!whatsNewLastVersion && Services.vc.compare(release, version) == 0)) {
			var section = document.createElement('section');
			section.id = release;
			section.classList.add('notes');
			
			var h3 = document.createElement('h3');
			h3.textContent = 'Version '+release+' - Release Notes';
			section.appendChild(h3);
			
			var h4 = document.createElement('h4');
			h4.textContent = 'Released '+changelog.releases[release].date;
			section.appendChild(h4);
			
			var ul = document.createElement('ul');
			ul.classList.add('notes-items');
			section.appendChild(ul);
			
			for(var note of changelog.releases[release].notes) {
				var li = document.createElement('li');
				
				if(note[0] != "") {
					var b = document.createElement('b');
					b.classList.add(note[0]);
					b.textContent = note[0];
					li.appendChild(b);
					li.classList.add('tagged');
				}
				
				var p = document.createElement('p');
				p.innerHTML = note[1]; // just string text, with some <a> tags on occasion; all these can be found in the resource/changelog.json file
				li.appendChild(p);
				
				ul.appendChild(li);
			}
			
			var sibling = $('notes').firstChild;
			while(sibling && (sibling.id == 'knownissues' || Services.vc.compare(release, sibling.id) < 0)) {
				sibling = sibling.nextSibling;
			}
			$('notes').insertBefore(section, sibling);
			
			// if we're printing the current release, also print the known issues if there are any
			if(release == changelog.current && changelog.knownissues) {
				var section = document.createElement('section');
				section.id = 'knownissues';
				section.classList.add('notes');
				
				var h3 = document.createElement('h3');
				h3.textContent = 'Known Issues';
				section.appendChild(h3);
				
				var ul = document.createElement('ul');
				ul.classList.add('notes-items');
				section.appendChild(ul);
				
				for(var issue of changelog.knownissues) {
					var li = document.createElement('li');
					li.classList.add('tagged');
					
					var b = document.createElement('b');
					b.classList.add('unresolved');
					b.textContent = 'unresolved';
					li.appendChild(b);
					
					var p = document.createElement('p');
					p.innerHTML = issue[0]; // just string text, with some <a> tags on occasion; all these can be found in the resource/changelog.json file
					li.appendChild(p);
					
					ul.appendChild(li);
				}
							
				$('notes').insertBefore(section, sibling);
			}
		}
	}
	
	// if we're printing all the releases, hide the button to show them as it won't be needed anymore
	if(Services.vc.compare(version, '0') == 0) {
		$('allVersions').hidden = true;
	}
};

this.whatsNewProgressListener = {
	// this is needed in content progress listeners (for some reason)
	QueryInterface: XPCOMUtils.generateQI([Ci.nsIWebProgressListener, Ci.nsISupportsWeakReference]),
	
	onLocationChange: function(aProgress, aRequest, aURI) {
		if(aURI.spec.startsWith(whatsNewURL) || aURI.spec.startsWith(whatsNewAbout)) {
			whatsNewInit();
		}
	}
};

this.whatsNewLoadListener = function(e) {
	if(document.baseURI.startsWith(whatsNewURL) || document.baseURI.startsWith(whatsNewAbout)) {
		whatsNewInit();
	}
};

moduleAid.LOADMODULE = function() {
	webProgress.addProgressListener(whatsNewProgressListener, Ci.nsIWebProgress.NOTIFY_ALL);
	DOMContentLoaded.add(whatsNewLoadListener);
	listen('changeLog', whatsNewChangeLog);
	listen('notifyLastVersion', whatsNewNotifyLastVersion);
};

moduleAid.UNLOADMODULE = function() {
	webProgress.removeProgressListener(whatsNewProgressListener);
	DOMContentLoaded.remove(whatsNewLoadListener);
	unlisten('changeLog', whatsNewChangeLog);
	unlisten('notifyLastVersion', whatsNewNotifyLastVersion);
};
