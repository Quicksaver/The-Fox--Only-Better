moduleAid.VERSION = '1.0.1';
moduleAid.UTILS = true;
moduleAid.BASEUTILS = true;

// There are a few things in CUI that need to be overriden, e.g. the toolbars would register before they were appended to the DOM tree, which is really bad...
// piggyback - This module allows me to piggyback methods of any object. It also gives me access to the CustomizableUI module backstage pass, so I can do the same to it.
// add(aName, aObj, aMethod, aWith, aMode) - Modify aMethod within aObj with another aWith. The original aObj.aMethod will be available as aObj._aMethod.
//	aName - (string) just a name for this operation, usually the name of the module will suffice
//	aObj - (obj) which we want to alter
//	aMethod - (string) name of the method that we want to piggyback
//	aWith - (function) the function to modify with
//	(optional) aMode - (const) one of the following;
//			MODE_REPLACE:	will completely replace aMethod in aObj. This will only be done once globally, so take care that this is done in all occasions with this mode!
//					If you want to alter the arguments before they reach the original method, this is the only way to do it.
//					Also needs to be used if the method is to return a specific value.
//					Default mode.
//			MODE_BEFORE: aMethod will run before the original, and if it returns non-true, it will not follow through to the original
//			MODE_AFTER: aMethod will run after the original
//	(dont set) aKeep - for internal use only for the CustomizableUIInternal special case, don't set this
// revert(aName, aObj, aMethod) - reverts a piggyback done previously
//	see add()

this.piggyback = {
	MODE_REPLACE: 0,
	MODE_BEFORE: 1,
	MODE_AFTER: 2,
	
	add: function(aName, aObj, aMethod, aWith, aMode, aKeep) {
		if(!aMode) { aMode = this.MODE_REPLACE; }
		var aMaster = objName;
		
		if(aKeep) {
			aMaster = aKeep.master;
			
			// carrying over from a CUIInternal destruction, this will never be active even if it was before
			aKeep.active = false;
		}
		
		var aId = '_piggyback_'+aMaster;
		var ids = aObj.__piggybackIds ? aObj.__piggybackIds.split(' ') : [];
		
		var commander = aKeep || {
			master: aMaster,
			method: aWith,
			mode: aMode,
			active: false,
			
			createId: function(bObj) {
				bObj[aId] = { length: 0 }
			},
			createName: function(bObj) {
				bObj[aId][aName] = { length: 0 }
			}
		}
		
		if(!aObj[aId]) {
			if(ids.indexOf(aMaster) == -1) {
				ids.push(aMaster);
				aObj.__piggybackIds = ids.join(' ');
			}
			commander.createId(aObj);
		}
		if(!aObj[aId][aName]) {
			commander.createName(aObj);
			aObj[aId].length++;
		}
		
		// the same method can't be replaced more than once by the same aName (module)
		if(aObj[aId][aName][aMethod]) { return; }
		
		aObj[aId][aName][aMethod] = commander;
		aObj[aId][aName].length++;
		
		// if we're not replacing the method, we create our piggybacker that will call the method before/after the original method
		if(aMode != this.MODE_REPLACE && !aKeep) {
			aObj[aId][aName][aMethod].piggybacker = function() {
				// it's not like I can use a not-live reference to this, and I also can't use an array directly or it'll leave a ZC
				var ex = aObj.__piggybackIds.split(' ');
				
				var proceed = true;
				for(var id of ex) {
					var bId = '_piggyback_'+id;
					for(var name in aObj[bId]) {
						if(aObj[bId][name][aMethod] && aObj[bId][name][aMethod].mode == piggyback.MODE_BEFORE) {
							proceed = aObj[bId][name][aMethod].method.apply(aObj, arguments);
							if(!proceed) { return; }
						}
					}
				}
				
				aObj['_'+aMethod].apply(aObj, arguments);
				
				for(var id of ex) {
					var bId = '_piggyback_'+id;
					for(var name in aObj[bId]) {
						if(aObj[bId][name][aMethod] && aObj[bId][name][aMethod].mode == piggyback.MODE_AFTER) {
							aObj[bId][name][aMethod].method.apply(aObj, arguments);
						}
					}
				}
			};
		}
		
		for(var id of ids) {
			for(var name in aObj['_piggyback_'+id]) {
				if(aObj['_piggyback_'+id][name][aMethod] && aObj['_piggyback_'+id][name][aMethod].active) { return false; }
			}
		}
		
		aObj['_'+aMethod] = aObj[aMethod];
		aObj[aMethod] = (aMode == this.MODE_REPLACE) ? aObj[aId][aName][aMethod].method : aObj[aId][aName][aMethod].piggybacker;
		aObj[aId][aName][aMethod].active = true;
		return true;
	},
	
	revert: function(aName, aObj, aMethod) {
		var aId = '_piggyback_'+objName;
		var ids = aObj.__piggybackIds ? aObj.__piggybackIds.split(' ') : [];
		
		if(!aObj[aId] || !aObj[aId][aName] || !aObj[aId][aName][aMethod]) { return false; }
		
		if(aObj[aId][aName][aMethod].active) {
			aObj[aMethod] = aObj['_'+aMethod];
			delete aObj['_'+aMethod];
			
			// if another add-on wants to modify the same method, let it now
			for(var id of ids) {
				var bId = '_piggyback_'+id;
				for(var name in aObj[bId]) {
					if(aObj[bId][name][aMethod] && !aObj[bId][name][aMethod].active) {
						aObj['_'+aMethod] = aObj[aMethod];
						aObj[aMethod] = (aObj[bId][name][aMethod] == this.MODE_REPLACE) ? aObj[bId][name][aMethod].method : aObj[bId][name][aMethod].piggybacker;
						aObj[bId][name][aMethod].active = true;
					}
				}
			}
		}
		
		delete aObj[aId][aName][aMethod];
		aObj[aId][aName].length--;
		
		if(aObj[aId][aName].length == 0) {
			delete aObj[aId][aName];
			aObj[aId].length--;
			
			if(aObj[aId].length == 0) {
				delete aObj[aId];
				ids.splice(ids.indexOf(objName), 1);
				
				if(ids.length > 0) {
					aObj.__piggybackIds = ids.join(' ');
				} else {
					delete aObj.__piggybackids;
				}
			}
		}
	}
};

moduleAid.LOADMODULE = function() {
	// CustomizableUI is a special case, as CustomizableUIInternal is frozen and not exported
	self.CUIBackstage = Cu.import("resource:///modules/CustomizableUI.jsm", self);
	CUIBackstage['_piggyback_'+objName] = {
		replaceInternal: function(objs) {
			if(!CUIBackstage.__CustomizableUIInternal) {
				CUIBackstage.__CustomizableUIInternal = CUIBackstage.CustomizableUIInternal;
			
				var CUIInternalNew = {};
				for(var p in CUIBackstage.CustomizableUIInternal) {
					if(CUIBackstage.CustomizableUIInternal.hasOwnProperty(p)) {
						var propGetter = CUIBackstage.CustomizableUIInternal.__lookupGetter__(p);
						if(propGetter) {
							CUIInternalNew.__defineGetter__(p, propGetter.bind(CUIBackstage.__CustomizableUIInternal));
						} else {
							CUIInternalNew[p] = CUIBackstage.CustomizableUIInternal[p].bind(CUIBackstage.__CustomizableUIInternal);
						}
					}
				}
				CUIBackstage.CustomizableUIInternal = CUIInternalNew;
				CUIBackstage['_piggyback_'+objName].active = true;
				
				// we have to make sure any other modifications from other add-ons stay in place if we're re-replacing CUIInternal
				if(objs) {
					for(var id in objs) {
						for(var name in objs[id]) {
							for(var method in objs[id][name]) {
								piggyback.add(
									name,
									CUIBackstage.CustomizableUIInternal,
									method,
									objs[id][name][method].method,
									objs[id][name][method].mode,
									objs[id][name][method]
								);
							}
						}
					}
				}		
			}
		},
		active: false
	};
	
	CUIBackstage['_piggyback_'+objName].replaceInternal();
	
	if(!CUIBackstage.__piggybackIds) {
		CUIBackstage.__piggybackIds = objName;
	} else if(CUIBackstage.__piggybackIds.indexOf(objName) == -1) { // should always be the case if it doesn't exist
		var ex = CUIBackstage.__piggybackIds.split(' ');
		ex.push(objName);
		CUIBackstage.__piggybackIds = ex.join(' ');
	}
};

moduleAid.UNLOADMODULE = function() {
	var ids = CUIBackstage.__piggybackIds ? CUIBackstage.__piggybackIds.split(' ') : [];
	
	// we really need to put everything back as it was!
	if(ids.indexOf(objName) > -1) {
		var active = CUIBackstage['_piggyback_'+objName].active;
		
		delete CUIBackstage['_piggyback_'+objName];
		ids.splice(ids.indexOf(objName), 1);
		if(ids.length > 0) {
			CUIBackstage.__piggybackIds = ids.join(' ');
		} else {
			delete CUIBackstage.__piggybackIds;
		}
		
		var internalObjs = null;
		if(active) {
			// we have to make sure any other modifications from other add-ons stay in place
			if(CUIBackstage.CustomizableUIInternal.__piggybackIds) {
				var internalIds = CUIBackstage.CustomizableUIInternal.__piggybackIds.split(' ');
				internalObjs = {};
				for(var id of internalIds) {
					internalObjs[id] = CUIBackstage.CustomizableUIInternal['_piggyback_'+id];
				}
			}
			
			CUIBackstage.CustomizableUIInternal = CUIBackstage.__CustomizableUIInternal;
			delete CUIBackstage.__CustomizableUIInternal;
			
			// if another add-on is still initialized, make sure it redoes this
			for(var id of ids) {
				CUIBackstage[id].replaceInternal(internalObjs);
			}
		}
	}
};
