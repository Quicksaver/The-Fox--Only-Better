// VERSION 1.0.0

Services.scriptloader.loadSubScript("resource://thefoxonlybetter/modules/utils/content.js", this);

this.theFoxOnlyBetter = this.__contentEnvironment;
delete this.__contentEnvironment;

this.theFoxOnlyBetter.objName = 'theFoxOnlyBetter';
this.theFoxOnlyBetter.objPathString = 'thefoxonlybetter';
this.theFoxOnlyBetter.init();
