var { emit, on, once, off } = require("sdk/event/core");
var dropbox = require('./dropbox.js');
var gapi = require('./gapi.js');



var chosenServer;
//var serverInfo = {'dropbox':false,'googleDrive':false,'both':false};
const preferences = require("sdk/simple-prefs");
var theServer;
var dropboxDatas = {};
dropboxDatas.access_token;
dropboxDatas.token_type;
dropboxDatas.uid;

var gapiDatas = {};
gapiDatas.access_token;
gapiDatas.token_type;
gapiDatas.expires_in;
gapiDatas.id_token;
gapidatas.refresh_token;

const DROPBOX = 'dropbox';
const GOOGLE_DRIVE = 'gapi';
const BOTH = 'both';



/*Handle the auth reply*/
//var access_token = dropBox.access_token;
function handleAuth(authDatas){
	/*authDatas = [response.json, callersData]
	**callersData = [whoCalled, datas...]
	*/
	authenticated = authDatas.authSuccess;
	//var accessDatas = authDatas[0];
	//var callersData = authDatas[1];
	
	//var whoCalled = authDatas.whoCalled;
	
	//Save the respective value of the access response.
	if (authenticated){
		/*
		googleDrive.access_token = authDatas.token;
		googleDrive.token_type = authDatas.token_type;
		googleDrive.expires_in = authDatas.expires_in;
		googleDrive.id_token = authDatas.id_token;
		googleDrive.refresh_token = authDatas.refresh_token;*/
		dropBox.access_token = authDatas.token;
		dropBox.token_type = authDatas.token_type;
		dropBox.uid = authDatas.uid;
	}
	
	/*var currentTab = tabs.activeTab;
	console.log("Active tab " + currentTab.title);
	var currentTabWorker = currentTab.attach({
		contentScriptFile: data.url('messages.js')
	});
	currentTabWorker.port.emit('authenticated','Signed in correctly!');
	*/
	/*panelMessage.write({'msg':'Signed in correctly!','type':'correct'});
	panelMessage.show();
	timer.setTimeout(hidePanel, 5000);	//5 seconds*/
	
	//console.log("EXPIRES IN " + expires_in);
	
	/*
	if (whoCalled == 'searchFile'){
		//Continue to search File
		//callersData = ['searchFile' , title, dataToSave]
		var title = authDatas.title;
		var dataToSave = authDatas.dataToSave;
		//var elementToSave = callersData[3];
		gapi.searchFile(authDatas);
	}
	/*if(whoCalled == 'OpenTab'){
		tabs.open({
  			url: data.url('GoogleDriveShare.html'),
  			inNewWindow: true
    		});
		
	}*/
	/*
	else if (whoCalled == 'downloadData'){
		//callersData = ['downloadData', fileName, downloadURL]
		var title = authDatas.title;
		var downloadURL = authDatas.dLoadURL;
		gapi.downloadData(authDatas);	
	}*/


}


function changeServer(){
	console.log("hello");
	chosenServer = preferences.prefs['server'];
	console.log(server);	
	setServer();
}
exports.changeServer = changeServer;


function setServer(){
	//if(chosenServer != undefined){
	//	serverInfo[chosenServer] = false;
	//}
	chosenServer = preferences.prefs['server'];
	//serverInfo[chosenServer] = true;
	if (chosenServer == DROPBOX){//If it is not both then:
		theServer = dropbox;
	}
	else if (chosenServer == GOOGLE_DRIVE){
		theServer = gapi;
	}
	else if (chosenServer == BOTH){
		theServer = 'both';
	}
	console.log('Chosen server = ' + chosenServer +' '+ serverInfo[chosenServer]);	
}
exports.setServer = setServer;

function save(writeDatas){
	if (theServer != undefined && theServer != null){
		if (chosenServer != BOTH){
			theServer.save(writeDatas);	
		}
		else if (chosenServer == BOTH){
			dropbox.save(writeDatas);
			gapi.save(writeDatas);
		}
	}
}
exports.save = save;

function read(readInfo){
	if (theServer != undefined && theServer != null){
		if (chosenServer != BOTH){
			theServer.save(readInfo);
		}
		else if (chosenServer == BOTH){
			dropbox.save(readInfo);
			gapi.save(readInfo);
		}
	}
}
exports.read = read;
//When the user is unauthorized:
gapi.on('Unauthorized',handleUnAuth);
//When the authentication process is completed:
gapi.on('authComplete',handleAuth);
//Display the downloaded data.  
gapi.on('display',handleDisplay);
//To show the corresponding message
gapi.on('showMessage',handleShowMessage); 

dropbox.on('Unauthorized',handleUnAuth);
//When the authentication process is completed:
dropbox.on('authComplete',handleAuth);
//Display the downloaded data.  
dropbox.on('display',handleDisplay);
//To show the corresponding message
dropbox.on('showMessage',handleShowMessage); 

   
exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};