// VERSION 1.0.2

this.adaptSearchBar = {
	_inputField: null,
	_value: null,
	_listenForStateChange: false,

	engines: new Map([
		[ 'Google', {
			// https://en.wikipedia.org/wiki/List_of_Google_domains
			hosts: [ /^(([a-z0-9\.-])*\.)?google.[a-z]{2,3}(\.[a-z]{2})?$/ ],
			paths: [ /^\/?/, /^\/webhp\?/, /^\/imghp\?/, /^\/search\?/ ],
			inputIds: [ 'lst-ib' ],
			listenForStateChange: true
		} ],
		[ 'Yahoo', {
			// http://antezeta.com/news/yahoo-search-domains
			hosts: [ /^(([a-z0-9\.-])*\.)?search.yahoo.com$/ ],
			paths: [ /^\/search/, /^\/yhs/ ],
			inputIds: [ 'yschsp' ]
		} ],
		[ 'Bing', {
			// https://en.wikipedia.org/wiki/List_of_Microsoft_domains
			hosts: [ /^(([a-z0-9\.-])*\.)?bing.(com|net|(co(\.uk)?))$/ ],
			paths: [ /^\/\?scope=/, /^\/((images|videos)\/)?search\?/ ],
			inputIds: [ 'sb_form_q' ]
		} ],
		[ 'Amazon', {
			// https://en.wikipedia.org/wiki/Amazon.com#Website
			hosts: [ /^(([a-z0-9\.-])*\.)?amazon.[a-z]{2,3}(\.[a-z]{2})?$/ ],
			paths: [ /^\/s\/()/ ],
			inputIds: [ 'twotabsearchtextbox' ]
		} ],
		[ 'DuckDuckGo', {
			// AFAIK only duckduckgo.com exists and is used for the actual search engine
			hosts: [ /^(([a-z0-9\.-])*\.)?duckduckgo.com$/ ],
			paths: [ /^\/\?q=()/ ],
			inputIds: [ 'search_form_input', 'search_form_input_homepage' ]
		} ],
		[ 'eBay', {
			// http://pages.ebay.in/globaltrade/international.html
			hosts: [ /^(([a-z0-9\.-])*\.)?ebay.[a-z]{2,3}(\.[a-z]{2})?$/ ],
			paths: [ /^\/sch\/()/ ],
			inputIds: [ 'gh-ac' ]
		} ],
		[ 'MercadoLibre', {
			// eBay partner
			hosts: [ /^(([a-z0-9\.-])*\.)?mercadoli(b|v)re\.com\.(ar|br|co|mx)$/ ],
			paths: [ /^\/()/ ], // well this just sucks... results pages url are largely based on the query used
			inputSelectors: [ 'input.nav-search-input' ]
		} ],
		[ 'Twitter', {
			// AFAIK only twitter.com exists
			hosts: [ /^(([a-z0-9\.-])*\.)?twitter\.com$/ ],
			paths: [ /^\/search-home/, /^\/search\?/, /^\/hashtag\/()/ ],
			inputIds: [ 'search-home-input', 'search-query' ],
			inputIdsForPaths: true
		} ],
		[ 'Wikipedia', {
			// AFAIK only wikipedia.org exists
			hosts: [ /^(([a-z0-9\.-])*\.)?wikipedia.org$/ ],
			paths: [ /^\/w\/()/, /^\/wiki\/Special:Search\?/ ],
			inputIds: [ 'searchText' ]
		} ]
	]),

	handleEvent: function(e) {
		//LOG('e:'+e.type+' '+this._inputField.value);

		switch(e.type) {
			case 'input':
				// I wonder how this could even happen, but safeguarding anyway
				if(!this.checkInputField()) { break; }

				// child/accessory nodes? we don't really care
				if(e.target != this._inputField) { break; }

				this.sendValue();
				break;

			case 'load':
				// I wonder how this could even happen, but safeguarding anyway
				if(!this.checkInputField()) { break; }

				// if this fires we assume to already have associated an inputField node,
				// we just want to make sure the value in the search bar reflects the value of the field in case it has changed in the meantime
				if(e.target != document) { break; }

				this.sendValue();
				break;

			case 'DOMContentLoaded':
				// this is the content document of the loaded page.
				let doc = e.originalTarget;
				//LOG('DOMContentLoaded:'+(doc instanceof content.HTMLDocument)+' '+(doc != document));

				if(doc instanceof content.HTMLDocument) {
					// There's no need to check anything other than the currently loaded document
					if(doc != document) { break; }

					this.checkURL();
				}
				break;
		}
	},

	onStateChange: function(aWebProgress, aRequest, aStateFlags, aStatus) {
		// Some AJAX pages (i.e. google, see https://github.com/Quicksaver/The-Fox--Only-Better/issues/116) can remove and re-add the search field,
		// so even if we keep a reference to the inputField, it will be nulled when the page updates itself.
		// Still, let's try to not overdo it here, state changes can be numerous, so let's only do what we absolutely must, and sparsely!

		// no point in checking anything if we don't have a valid engine reference that likes to change the inputField
		if(!this._listenForStateChange) { return; }

		// Only do this when the document is finished loading, and when the state change itself is terminating
		if(!(aStateFlags & Ci.nsIWebProgressListener.STATE_STOP)
		|| aWebProgress.isLoadingDocument
		|| aWebProgress.DOMWindow != content) { return; }

		// Don't worry if we've already set up a timer for this, it will run by itself.
		// Even if we end up running the timer a few times because the delay isn't enough to cover all state changes,
		// this is still better than the overhead of cancelling and setting timers dozens of times in a fraction of a second.
		if(Timers.sendValue) { return; }

		// sendValue already works on a timer
		this.sendValue();
	},

	checkInputField: function() {
		if(!this._inputField) {
			e.target.removeEventListener('input', this);
			e.target.removeEventListener('load', this);
			return false;
		}
	},

	init: function() {
		DOMContentLoaded.add(this);
		WebProgress.add(this, Ci.nsIWebProgress.NOTIFY_ALL);

		this.checkURL();
	},

	deinit: function() {
		DOMContentLoaded.remove(this);
		WebProgress.remove(this, Ci.nsIWebProgress.NOTIFY_ALL);

		try {
			if(this._inputField) {
				this._inputField.removeEventListener('input', this);
				content.removeEventListener('load', this);
			}
		}
		// we don't really care when this fails, it's likely lost references to unloaded nodes, so it produces the same effect,
		// we just care that this doesn't block the unloading process for the other modules
		catch(ex) {}
	},

	reset: function() {
		this._inputField = null;
		this._value = null;
		this._listenForStateChange = false;
	},

	checkURL: function() {
		Timers.cancel('sendValue');

		// always reset our input field reference
		this.reset();
		this.sendValue();

		let uri = document.documentURIObject;
		//LOG('check:'+uri.spec);

		// we return at the end of every regex step, because if we've already found a match there,
		// and we couldn't resolve a node to fetch the search value from, it's unlikely that another
		// regex pattern will also be found for this same host, so there's no point in continuing with the loops

		// for now we just assume that any search engines are using either HTTP or HTTPS
		if(uri.scheme != 'http' && uri.scheme != 'https') { return; }

		// are we on a search results page?
		for(let [ name, engine ] of this.engines) {
			//LOG('scheme:'+uri.scheme);

			// check the scheme first, it's the quickest part
			//for(let scheme of engine.schemes) {
				//if(scheme != uri.scheme) { continue; }
				//LOG('host:'+uri.host);

				// are we on a valid host for this engine?
				for(let host of engine.hosts) {
					if(!host.test(uri.host)) { continue; }
					//LOG('path:'+uri.path);

					// now are we on an actual search results page
					for(let path of engine.paths) {
						if(!path.test(uri.path)) { continue; }

						// ok we're in a results page, let's find the input search field
						// see if this is a page where the input field typically has an id
						if(engine.inputIds) {
							// this flag tells us that each inputId should be used matching the same index of the found path,
							if(engine.inputIdsForPaths) {
								let i = engine.paths.indexOf(path);
								// if there aren't enough ids to cover the index of the found path, the last id in the inputIds array is used
								if(i >= engine.inputIds.length) {
									i = engine.inputIds.length -1;
								}

								let inputId = engine.inputIds[i];
								let input = $(inputId);
								if(!input) { continue; }
								//LOG('input:'+input.localName);

								// and is it a valid input node?
								if(input.localName != 'input') { return; }

								// woohoo we have an input field, we want the value in it to be reflected in the search bar now
								this.useInput(input, engine);

								return;
							}

							for(let inputId of engine.inputIds) {
								let input = $(inputId);
								if(!input) { continue; }
								//LOG('input:'+input.localName);

								// and is it a valid input node?
								if(input.localName != 'input') { return; }

								// woohoo we have an input field, we want the value in it to be reflected in the search bar now
								this.useInput(input, engine);

								return;
							}
						}

						// if we couldn't find an input id until now, try to use a CSS selector
						if(engine.inputSelectors) {
							for(let inputSelector of engine.inputSelectors) {
								let input = $$(inputSelector)[0];
								if(!input) { continue; }
								//LOG('input:'+input.id);

								// woohoo we have an input field, we want the value in it to be reflected in the search bar now
								this.useInput(input, engine);

								return;
							}
						}

						return;
					}

					return;
				}
			//}
		}
	},

	useInput: function(input, engine) {
		this._inputField = input;
		this._inputField.addEventListener('input', this);

		// some pages (i.e. Google) may change the value of the input field dynamically when it loads
		content.addEventListener('load', this);

		// the listenForStateChange tells us if the page likes to change the value of the inputField dynamically in AJAX calls,
		// in which case we have to listen in otherwise the value wouldn't be updated in those cases
		this._listenForStateChange = engine.listenForStateChange || false;

		// update with the current value
		this.sendValue();
	},

	sendValue: function(input) {
		Timers.init('sendValue', () => {
			let value = null;
			if(this._inputField && typeof(this._inputField.value) == 'string') {
				value = this._inputField.value;
			}

			// don't bother when the value hasn't changed since last time, saves on cycles
			if(value === this._value) { return; }
			this._value = value;

			//LOG('value:'+this._inputField.value);
			//LOG('send:'+value);
			message('AdaptSearchBar:Value', value);
		}, 500);
	},

	// this is needed in content progress listeners (for some reason)
	QueryInterface: XPCOMUtils.generateQI([Ci.nsIWebProgressListener, Ci.nsISupportsWeakReference])
};

Modules.LOADMODULE = function() {
	adaptSearchBar.init();
};

Modules.UNLOADMODULE = function() {
	adaptSearchBar.deinit();
};
