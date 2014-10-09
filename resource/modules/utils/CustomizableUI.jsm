moduleAid.VERSION = '1.0.0';
moduleAid.UTILS = true;
moduleAid.BASEUTILS = true;

// There are a few things in CUI that need to be overriden, e.g. the toolbars would register before they were appended to the DOM tree, which is really bad...
// CUIAid - This module gives me access to the CustomizableUI module backstage pass, to allow me to modify it as I need within the other modules.
// modify(aMethod, aWith) - Modify aMethod within CustomizableUIInternal with another aWith.
//	aMethod - (string) name of the method to be modified
//	aWith - (function) the function to modify with
// revert(aMethod) - reverts a method change modified previously through this module
//	see modify()

this.CUIAid = {
	initialized: false,
	
	modify: function(aMethod, aWith) {
		// already modified by us, can't modify again same method within same add-on
		if(CUIBackstage[objName][aMethod]) { return false; }
		
		CUIBackstage[objName][aMethod] = { method: aWith, used: false };
		
		var ex = CUIBackstage.__modBackboneIds.split(' ');
		for(var id of ex) {
			// already modified, can't do it again so just add to queue
			if(CUIBackstage[id][aMethod] && CUIBackstage[id][aMethod].used) { return false; }
		}
		
		CUIBackstage.CustomizableUIInternal['_'+aMethod] = CUIBackstage.CustomizableUIInternal[aMethod];
		CUIBackstage.CustomizableUIInternal[aMethod] = aWith;
		CUIBackstage[objName][aMethod].used = true;
		return true;
	},
	
	revert: function(aMethod) {
		if(!CUIBackstage[objName][aMethod]) { return false; }
		
		if(CUIBackstage[objName][aMethod].used) {
			CUIBackstage.CustomizableUIInternal[aMethod] = CUIBackstage.CustomizableUIInternal['_'+aMethod];
			delete CUIBackstage.CustomizableUIInternal['_'+aMethod];
			
			// if another add-on wants to modify the same method, let it now
			var ex = CUIBackstage.__modBackboneIds.split(' ');
			for(var id of ex) {
				if(id == objName) { continue; }
				if(CUIBackstage[id][aMethod]) {
					CUIBackstage.CustomizableUIInternal['_'+aMethod] = CUIBackstage.CustomizableUIInternal[aMethod];
					CUIBackstage.CustomizableUIInternal[aMethod] = CUIBackstage[id][aMethod].method;
					CUIBackstage[id][aMethod].used = true;
				}
			}
		}
		
		delete CUIBackstage[objName][aMethod];
	},

	replaceInternal: function() {
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
			CUIBackstage[objName].__replaceInternal.used = true;
		}
	}
};

moduleAid.LOADMODULE = function() {
	CUIAid.initialized = true;
	self.CUIBackstage = Cu.import("resource:///modules/CustomizableUI.jsm", self);
	CUIBackstage[objName] = {
		__replaceInternal: { method: CUIAid.replaceInternal, used: false }
	};
	
	CUIAid.replaceInternal();
	
	if(!CUIBackstage.__modBackboneIds) {
		CUIBackstage.__modBackboneIds = objName;
	} else if(CUIBackstage.__modBackboneIds.indexOf(objName) == -1) {
		var ex = CUIBackstage.__modBackboneIds.split(' ');
		ex.push(objName);
		CUIBackstage.__modBackboneIds = ex.join(' ');
	}
};

moduleAid.UNLOADMODULE = function() {
	// we really need to put everything back as it was!
	if(CUIAid.initialized && CUIBackstage.__modBackboneIds.indexOf(objName) > -1) {
		var ex = CUIBackstage.__modBackboneIds.split(' ');
		ex.splice(ex.indexOf(objName), 1);
		CUIBackstage.__modBackboneIds = ex.join(' ');
		
		// undo our method modifications
		var remove = [];
		for(var m in CUIBackstage[objName]) {
			if(method == '__replaceInternal') { continue; }
			remove.push(CUIBackstage[objName][m].method);
		}
		for(var method of remove) {
			CUIAid.revert(method);
		}
		
		// undo our CUIInternal replacement
		if(CUIBackstage[objName].__replaceInternal.used) {
			CUIBackstage.CustomizableUIInternal = CUIBackstage.__CustomizableUIInternal;
			delete CUIBackstage.__CustomizableUIInternal;
			
			// if another add-on is still initialized, make sure it redoes this
			for(var id of ex) {
				CUIBackstage[id].__replaceInternal.method();
			}
		}
		
		delete CUIBackstage[objName];
		
		if(!CUIBackstage.__modBackboneIds) {
			delete CUIBackstage.__modBackboneIds;
		}
	}
};
