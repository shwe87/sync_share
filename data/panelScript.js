self.port.on('write',function(messageInfo){
	console.log("Writing a message.....");
	var messageContainer = document.getElementById('messageContainer');
	if (messageContainer != null){
		var message = document.getElementById('message');
		message.innerHTML = messageInfo.msg;
		messageContainer.setAttribute('class',messageInfo.type);
		//message.setAttribute('class',messageInfo.messageType);	
	}
	
	
	//self.port.emit('show','panel');


});
