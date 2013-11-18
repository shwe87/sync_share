/*Mozilla sdk modules load*/
var data = require("sdk/self").data;
var tabs = require("sdk/tabs");
var pageMod = require("sdk/page-mod");
var panel = require("./panelControl.js");
var timer = require('sdk/timers');

/*Variables*/
var openMenuTabWorker;
var myContextMenu;


/*My modules*/
var bookmarks = require('./bookmark.js');	//Query bookmarks
var history = require('./history.js');		//Query history
var gapi = require('./gapi.js');
var xulControl = require('./xulControl.js');
var contextMenu = require('./contextMenu.js');
var dropbox = require('./dropbox.js');



const TABS_FILE = 'tabs.json';
const BOOKMARKS_FILE = 'bookmarks.json';
const HISTORY_FILE = 'history.json';

/*Actions that can be realized*/
const REWRITE = 'rewrite';
const SHOW = 'show';

var panelMessage;
var {Cc, Ci, Cu} = require("chrome");



/* GOOGLE DRIVE OAUTH CONSTANTS 
const CLIENT_ID = '737302378245.apps.googleusercontent.com';
const CLIENT_SECRET = 'rcWgBDcdt9PuVnrKGXz81Hf7';
const REDIRECT_URI_URN = 'urn:ietf:wg:oauth:2.0:oob';
const REDIRECT_URI_LOCAL = 'http://localhost';
const SCOPE = 'https://www.googleapis.com/auth/drive+';
var URL = 'https://accounts.google.com/o/oauth2/auth?'+'scope='+SCOPE+'https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&'+'redirect_uri=' + REDIRECT_URI_URN + '&'+ 'client_id=' + CLIENT_ID+'&'+'response_type=code';*/


/*Google drive necessary var.*/
var googleDrive = {};
googleDrive.access_token;
googleDrive.token_type;
googleDrive.expires_in;
googleDrive.id_token;
googleDrive.refresh_token;
googleDrive.resumable_sesion_uri;
googleDrive.theCode;


var dropBox = {};
dropBox.access_token;
dropBox.token_type;
dropBox.uid;
var authenticated = false;

/*
tabs.open('www.urjc.es');
tabs.open('www.gmail.com');
tabs.open('www.google.com');
tabs.open('www.mozilla.org');
tabs.open('www.hotmail.com');
tabs.open('www.facebook.com');
tabs.open('http://www.urjc.es/alumnos/');


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
	panelMessage.write({'msg':'Signed in correctly!','type':'correct'});
	panelMessage.show();
	timer.setTimeout(hidePanel, 5000);	//5 seconds
	
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

/*If unauthorized message is received:*/
function handleUnAuth(functionDatas){
	//functionDatas = ['searchFile', title, dataToSave]
	dropbox.auth(functionDatas);


}

function handleDisplay(toShowDatas){
	try{
		openMenuTabWorker.port.emit('show',toShowDatas);
	}
	catch(e){
		console.log("ERROR = " + e.toString());
	}
}

function handleShowMessage(messageToShow){
	panelMessage.write(messageToShow);
	panelMessage.show();
	timer.setTimeout(hidePanel, 5000);	//5 seconds

}

//Function to save the given tabs
function saveTabs(tabsToSave){
	//console.log("Tab to save " + clickedTab.title);
	//See if authenticated:
	if (!authenticated){
		//gapi.auth(TABS);
		console.log("Not authenticated");
	}
	var message = {};
	message.msg = 'Loading...';
	message.type = 'correct';
	handleShowMessage(message);
	/*
	var a = {"test":"test"};
	var clone_of_a = JSON.parse(JSON.stringify(a));
	*/
	/*var tabToSave = tabsToSave[0];
	var dataToSave = {'id':tabToSave.id,'title':tabToSave.title,'url':tabToSave.url};
	gapi.searchFile(TABS_FILE, dataToSave, access_token, tabToSave);*/
	//Get the favicon icon:
	
	var dataToSave = new Array();
	
	for each (var tabToSave in tabsToSave){	
		//tabToSave.on('ready',function(thisTab){			
			var newTab = {'id':tabToSave.id,'title':tabToSave.title,'url':tabToSave.url};
			dataToSave.push(newTab);	
		//});
	}
	console.log("saveTabs = " + JSON.stringify(dataToSave));
	var save = new Object();
	save.title = TABS_FILE;
	save.dataToSave = dataToSave;
	save.token = dropBox.access_token;
	dropbox.save(save);
	//gapi.write(save);
}


function hidePanel(){
	panelMessage.hide();

}


function listSavedTabs(){
	try{
		console.log('listSavedTabs: Sending getTableReady');
		openMenuTabWorker.port.emit('getTableReady','tabs');
		console.log('listSavedTabs: gapi.getData');
		var newData = new Object();
		newData.title = TABS_FILE;
		newData.token = dropBox.access_token;
		//gapi.getData(newData);
		dropbox.read(newData);
	}catch(e){
		console.log('ERROR!! '+e.toString());
	}
	
}

function listSavedBookmarks(){
	try{
		console.log('listSavedBookmarks: SEnding getTableReady bookmarks');
		openMenuTabWorker.port.emit('getTableReady','bookmarks');
		var newData = new Object();
		newData.title = BOOKMARKS_FILE;
		newData.token = dropBox.access_token;
		//gapi.getData(newData);
		dropbox.read(newData);
	}catch(e){
		console.log('ERROR ' + e.toString());
	}

}

function listSavedHistory(){
	try{
		console.log('listSavedHistory: SEnding getTableReady history');
		openMenuTabWorker.port.emit('getTableReady','history');
		var newData = new Object();
		newData.title = HISTORY_FILE;
		newData.token = dropBox.access_token;
		//gapi.getData(newData);
		dropbox.read(newData);
	}catch(e){
		console.log("ERROR " + e.toString());
	}

}

function getAllBookmarks(){
	console.log("GET ALL BOOKMARKS!!!");
	try{	
		console.log('getAllBookmarks: Sending: getTableReady bookmarks');	
		openMenuTabWorker.port.emit('getTableReady','bookmarks');
		//console.log("getAllBookmarks: sent showAllBookmarks");
		var folderIds = bookmarks.getFoldersId();
		for each (var id in folderIds){
			//console.log("<ul>"+bookmarks.nameFolder(id));
			var aParent = {'itemId':'bookmarksList'}
			var aBookmark={'title':bookmarks.nameFolder(id),'itemId':id,'icon':'','parentId':'bookmarksList'}
			var ifFolder = true;
			console.log('getAllBookmarks: takeABookmarks send');
			openMenuTabWorker.port.emit('takeABookmark',[aBookmark,ifFolder]);
			//console.log("getAllBookmarks: sent takeABookmark "+ aBookmark.title);
			bookmarks.getFoldersChildren(id);
			try{
				openMenuTabWorker.port.emit('clean','loading');
			}catch(e){
				console.log("ERROR " + e.toString());
			}
		}
	}catch(e){
		console.log('getAllBookmarks: Error! ' + e.toString());
	}

	
}



function takeABookmark(bookmarkToShow){
	try{
		var aBookmark = bookmarkToShow[0];
		var ifFolder = bookmarkToShow[1];
		var bookmarkToSend = {};
		bookmarkToSend.itemId = aBookmark.itemId;
		bookmarkToSend.title = aBookmark.title;
		bookmarkToSend.icon = aBookmark.icon;
		bookmarkToSend.parentId = aBookmark.parent.itemId;
		if (!ifFolder){
			//If not a folder, then there is an url
			//console.log("Not a folder.");
			bookmarkToSend.url = aBookmark.uri;
			//favicon.getFavicon(aBookmark.uri);
		}
		openMenuTabWorker.port.emit('takeABookmark',[bookmarkToSend,ifFolder]);
		//console.log("takeABookmark: sent takeABookmark " + bookmarkToSend.url);
	
	}catch(e){
		console.log('takeABookmark: Error! '+e.toString());
	}
	/*var ifFolder = things[1];
	if (ifFolder){
		console.log("<ul>"+things[0].title);
	}
	else{
		console.log("<li>"+things[0].title);
	}*/

}

//Get all the history.
function getAllHistory(){
	console.log('Getting history....');
	var historyList = history.queryHistory();
	try{	
		openMenuTabWorker.port.emit('getTableReady','history');
		openMenuTabWorker.port.emit('takeAllHistory',historyList);
	}catch(e){
		console.log("getAllHistory: ERROR! " + e.toString());
	}


}
var pageModify;
//Open the tab with the menu:
function openMenu(msg){
	tabs.open({
		url: data.url('myPage.html')
	});
	/*tabs.on('load', function(tab) {
		listSavedTabs();
	});*/	
	
	pageModify = pageMod.PageMod({
		include: data.url('myPage.html'),
		contentStyleFile: data.url('myPageStyle.css'),
		contentScriptWhen: 'ready',
		contentScriptFile: data.url('myPageScript.js'),
		onAttach: function onAttach(worker) {
			openMenuTabWorker = worker;
			console.log(openMenuTabWorker.tab.title);
			openMenuTabWorker.port.emit('start','Bookmarks');
			openMenuTabWorker.port.on('cellClicked',function(clickedElement){
				
				var nodeName = clickedElement.node;
				var nodeId = clickedElement.id;
				console.log('cellClicked received = ' + clickedElement.node + ','+clickedElement.id);
				if (nodeId == 'tabsCell'){
					console.log('\r\n\r\n tabsCell');
					//console.log('Here nodeName = '+nodeName);
					//console.log('Here nodeId = '+nodeId);
					//List the saved tabs:
					listSavedTabs();
					
				}
				else if (nodeName == 'Bookmarks'){
					if (nodeId == 'bookmarksCell'){
						console.log('****bookmarksCell****');
						console.log('Send initHiddenRow');
						openMenuTabWorker.port.emit('initHiddenRow');
					}
					console.log('\r\n\r\n Bookmarks');
					//console.log('Here nodeName = '+nodeName);
					//console.log('Here nodeId = '+nodeId);
					console.log('Calling getAllBookmarks()');
					getAllBookmarks();
				}
				else if (nodeName == 'History'){
					if (nodeId == 'historyCell'){
						console.log('****historyCell****');
						console.log('Send initHiddenRow');
						openMenuTabWorker.port.emit('initHiddenRow');
					}
					console.log('\r\n\r\n History');
					//console.log('Here nodeName = '+nodeName);
					//console.log('Here nodeId = '+nodeId);
					console.log('Calling getAllHistory()');
					getAllHistory();
				}
				else if (nodeName == 'Saved Bookmarks'){
					console.log('\r\n\r\n *********Saved Bookmarks');
					//console.log('Here nodeName = '+nodeName);
					//console.log('Here nodeId = '+nodeId);
					//console.log("SAVED BOOKMARKS!");
					listSavedBookmarks();
				}
				else if (nodeName == 'Saved History'){
					console.log('\r\n\r\n ***********Saved History');
					console.log('Here nodeName = '+nodeName);
					console.log('Here nodeId = '+nodeId);
					console.log("SAVED HISTORY");
					listSavedHistory();
				}
				
				
			});
			//openMenuWorker.port.emit('msg','Hola');
	  	}
	});



}


//Handle the context menu:
function handleContextMenu(clickedDetails){
	var clickedNode = clickedDetails[0];
	var contextLabel = clickedDetails[1];
	
	
	console.log("Clicked title " + clickedNode.className);
	/*console.log("LABEL " + contextLabel);*/
	var newData = new Object();
	var dataToSave = [clickedNode];
	if ( clickedNode.className == 'bookmark'){
		newData.title = BOOKMARKS_FILE;
		newData.dataToSave = dataToSave;
		newData.token = dropBox.access_token;
		//gapi.write(newData);
		dropbox.save(newData);
	}
	else if (clickedNode.className == 'history'){
		newData.title = HISTORY_FILE;
		newData.dataToSave = dataToSave;
		newData.token = dropBox.access_token;
		//gapi.write(newData);
		dropbox.save(newData);
	}
}







/*var windows = require("sdk/window/utils");*/

exports.main = function(options, callbacks) {
    //Create the panel:
    panelMessage = panel.Panel();
    //Add the tab context menu:
    xulControl.addAllOptions();
    //Add the save all tabs menu item in the tool menu
    //xulControl.addSaveAllTabsMenu();
     
    /*Listen for the events*/
    //The module xulControl informs us when the user right clicks the tab. 
    xulControl.on('tabContextClicked',saveTabs);
    //The module xulControl informs us when the save all menu item is clicked.
    xulControl.on('saveAllTabsClicked',saveTabs);
    //The module xulControl informs us when the open menu item is clicked.
    xulControl.on('openMenuClicked',openMenu);
    
    //Whenever the context menu is clicked:
    contextMenu.addContextMenu('Save this');
    contextMenu.on('contextClicked',handleContextMenu);
    
    //Whenever the bookmark sends us information:
    bookmarks.on('take',takeABookmark);
    
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
    
    /*
    var window = windows.getMostRecentBrowserWindow();
    window.alert("REfresh token " + refresh_token);*/
    


    
};

exports.onUnload = function (reason) {
	console.log(reason);
	try{
		openMenuTabWorker.destroy();
		pageModify.destroy();
	}
	catch(e){
		console.log("ERROR " + e.toString());
	}
};







