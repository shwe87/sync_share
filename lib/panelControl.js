var { Class } = require("sdk/core/heritage");

var panel = require("sdk/panel");
var data = require("sdk/self").data;

var { emit, on, once, off } = require("sdk/event/core");
exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};



var Panel = Class({
  initialize: function initialize() {
  	this.panelWithMessage = panel.Panel({
  		position: {
  			top: 0
  		},
  		width: 700,
  		height: 60,
  		focus: true,
    		contentURL: data.url('panel.html'),
    		contentScriptFile: data.url('panelScript.js')
    	});
  },
  type: 'Panel',
  write: function write(message) {
  	this.panelWithMessage.port.emit('write',message);
  	//this.panelWithMessage.show();
  },
  hide: function hide(){
  	if (this.panelWithMessage.isShowing){
  		this.panelWithMessage.hide();
  	}
  },
  show: function show(){
  	this.panelWithMessage.show();
  }
  
});

exports.Panel = Panel;




