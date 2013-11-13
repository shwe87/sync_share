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



const TABS_FILE = 'tabs.json';
const BOOKMARKS_FILE = 'bookmarks.json';
const HISTORY_FILE = 'history.json';

/*Actions that can be realized*/
const REWRITE = 'rewrite';
const SHOW = 'show';

var panelMessage;




/* GOOGLE DRIVE OAUTH CONSTANTS 
const CLIENT_ID = '737302378245.apps.googleusercontent.com';
const CLIENT_SECRET = 'rcWgBDcdt9PuVnrKGXz81Hf7';
const REDIRECT_URI_URN = 'urn:ietf:wg:oauth:2.0:oob';
const REDIRECT_URI_LOCAL = 'http://localhost';
const SCOPE = 'https://www.googleapis.com/auth/drive+';
var URL = 'https://accounts.google.com/o/oauth2/auth?'+'scope='+SCOPE+'https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&'+'redirect_uri=' + REDIRECT_URI_URN + '&'+ 'client_id=' + CLIENT_ID+'&'+'response_type=code';*/


/*Google drive necessary var.*/
var access_token;
var token_type;
var expires_in;
var id_token;
var refresh_token;
var resumable_sesion_uri;
var theCode;

var authenticated = false;



/*Handle the auth reply*/
function handleAuth(authDatas){
	/*authDatas = [response.json, callersData]
	**callersData = [whoCalled, datas...]
	*/
	authenticated = authDatas.authSuccess;
	//var accessDatas = authDatas[0];
	//var callersData = authDatas[1];
	
	var whoCalled = authDatas.whoCalled;
	
	//Save the respective value of the access response.
	access_token = authDatas.token;
	token_type = authDatas.token_type;
	expires_in = authDatas.expires_in;
	id_token = authDatas.id_token;
	refresh_token = authDatas.refresh_token;
	
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
	
	console.log("EXPIRES IN " + expires_in);
	
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
	else if (whoCalled == 'downloadData'){
		//callersData = ['downloadData', fileName, downloadURL]
		var title = authDatas.title;
		var downloadURL = authDatas.dLoadURL;
		gapi.downloadData(authDatas);	
	}


}

/*If unauthorized message is received:*/
function handleUnAuth(functionDatas){
	//functionDatas = ['searchFile', title, dataToSave]
	gapi.auth(functionDatas);


}

//Function to save the given tabs
function saveTabs(tabsToSave){
	//console.log("Tab to save " + clickedTab.title);
	//See if authenticated:
	if (!authenticated){
		//gapi.auth(TABS);
		console.log("Not authenticated");
	}
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
		
		var newTab = {'id':tabToSave.id,'title':tabToSave.title,'url':tabToSave.url};
		dataToSave.push(newTab);	
	}
	console.log("saveTabs = " + JSON.stringify(dataToSave));
	var save = new Object();
	save.title = TABS_FILE;
	save.dataToSave = dataToSave;
	save.token = access_token;
	save.save = true;
	gapi.searchFile(save);
}


//Handle the result of the search file function:
function handleSearchFile(fileData){
	/*fileData = [exists, title, dataToSave, token, dLoadURL, fileId]*/
	
	var exists = fileData.exists;
	var fileName = fileData.title;
	var dataToSave = fileData.dataToSave;
		
	if (exists){
		console.log("handleSearchFile : File " + fileName + " exists!");
		if (fileData.save == true){		
			//Download the file & save:
			fileData.action = REWRITE;
			gapi.downloadData(fileData);
		}
		else{
			//Only for download:
			console.log ("Only for download");
			fileData.action = SHOW;
			gapi.downloadData(fileData);
		}
		
			
	}
	else{
		//If the file doesn't exist then we have to create the file
		console.log("handleSearchFile: File " + fileName + " doesn't exists! " + expires_in);
		/*
		var anArray = ['Hola','Yo','Soy','Shweta'];
	var anObject = {'title':'new','author':'nobody','array':anArray};
        var j = [];
        j.push(anObject);
        var objects = {'obj':j}
		*/
		//var anArray = [];
		//anArray.concat(dataToSave);
		if (fileData.save == true){
			//To save
			console.log("FILE = " + fileName);
			//var key = Object.keys();
			var object = {};
			if (fileName == TABS_FILE){
				object = {'tabs':dataToSave};
			}
			else if (fileName == BOOKMARKS_FILE){
				object = {'bookmarks':dataToSave};
			}
			else if (fileName == HISTORY_FILE){
				object = {'history':dataToSave};
			}
			fileData.dataToSave = object;
			console.log("Para guardar = " + JSON.stringify(fileData[2]));
			gapi.startUpload(fileData);
		}
		else{
			//Just to download, but there is nothing.
			console.log("Nothing saved!!!");                            
                        openMenuTabWorker.port.emit('show',null);
			
		}			
	}
}
function hidePanel(){
	panelMessage.hide();

}

//Handle the save has been completed function:
function handleSaveCompleted(savedData){
	//savdData = [fileData, resumable_sesion]
	//fileData = [exists, title, dataToSave, token, dLoadURL, fileId]
	//var fileData = savedData[0];
	//var title = fileData[1];
	var title = savedData.title;
	/*var elementsToSave = fileData[6];
	var length = 0;
	try{
		length = elementsToSave.length;
	}catch(e){
		console.log("ERROR " + e.toString());
		length = 1;
	}*/
	var message = 'Correctly Saved!'
	panelMessage.write({'msg':message,'type':'correct'});
	panelMessage.show();
	timer.setTimeout(hidePanel, 5000);	//5 seconds
	//if (title == TABS_FILE){
		//if (length == 1){
	/*var elementToSave = tabs.activeTab;
	var elementWorker = elementToSave.attach({
		contentScriptFile: data.url('messages.js')				
	});
	elementWorker.port.emit('savedCompletely','Correctly saved!');
	console.log("Save completed!!!!");*/
		//}
	//}

}

//Handle when download is completed!
function handleDownloadCompleted(downloadData){
	//downloadData = [fileName, response.text]
	//fileData = [exists, title, dataToSave, token, dLoadURL, fileId]
	//var fileData = downloadData[0];
	var actionAfterDownload = downloadData.action;
	//var data = downloadData[2];
	//The data sometimes is downlaoded as json and sometimes as string
	var downloadedData = {};
	var title = downloadData.title;
	try{
		//If it is downloaded as string:
		downloadedData = JSON.parse(downloadData.downloadedContent);
	}catch(e){
		//Otherwise it's downloaded as json
		console.log("ERROR = " + e.toString());
		downloadedData = downloadData.downloadedContent;
	}
	console.log("DOWNLOADED DATA = " + JSON.stringify(downloadedData));
	if (actionAfterDownload == REWRITE){

		console.log("Have to rewrite!!!!");
		var dataToSave = downloadData.dataToSave;
		
		
		
		//Lets search for the tab with thisTabsId in the listOfTabs.
    		/*	var pos = listOfTabs.map(function(e) { 
    				return e.id; 
    			}).indexOf(thisTabsId);
    			
    			//Once we have got the position of the tab with the id, lets save its cookies:
    			listOfTabs[pos].cookies = cookiesInfo;
    			 */
    		//console.log("Keys " + Object.keys(downloadedData));
    		var key = Object.keys(downloadedData);
    		//console.log("Using key = " + downloadedData[key]);
		//If it is update file then have to update the save data:
		var arrayOfObjects = new Array();	//New array containing the elements' array
		arrayOfObjects = downloadedData[key].slice(0);
		/*if (title == TABS_FILE){
			arrayOfObjects = downloadedData.tabs.slice(0);   //Contains the tabs' array						
		}
		else if (title == BOOKMARKS_FILE){
			arrayOfObjects = downloadedData.bookmarks.slice(0); //Contains the bookmarks' array	
		}
		else{
			arrayOfObjects = downlaodedData.history.slice(0); //Contains the histories' array
		}*/
		console.log("Array Of Objects = " + JSON.stringify(arrayOfObjects));
		console.log("DATA TO SAVE = " + JSON.stringify(dataToSave));
		var upload = false;
		var alreadySaved = new Array();
		//Lets see if the data we are going to save was already saved before:
		for each (var oneData in dataToSave){
			console.log(oneData.url);
			var pos = arrayOfObjects.map(function(e) { 
					console.log("MAP = " + e.url);
    					return e.url; 
    			}).indexOf(oneData.url);
    			
    			
    			if (pos == -1){//Doesn't exist
    				console.log("\r\n\r\n\r\n"+oneData.url + " doesn't exist\r\n\r\n\r\n");
				downloadedData[key].push(oneData);
				upload = true;
					
			}
			else{
				console.log("This tab is already saved " + oneData.title);
				alreadySaved.push(oneData.title);			
			}
    		}
    		if (upload){
	    		//Now dataToSave will be:
			downloadData.dataToSave = downloadedData;
			gapi.startUpload(downloadData);
		}
		if ((alreadySaved.length > 0)){
			//var message = {'msg':'Already Saved '}
			var messageToShow = 'The following are already saved:\r\n';
			for each(var saved in alreadySaved){
				messageToShow = messageToShow + saved.title + '\r\n';
			}
			var message = {'msg':messageToShow,'type':'correct'}
			panelMessage.write(message);
			panelMessage.show();
			timer.setTimeout(hidePanel, 5000);	//5 seconds
			/*var elementToSave = tabs.activeTab;
			//console.log( oneData.title + " IS ALREADY SAVED!!!!!");
			var elementWorker = elementToSave.attach({
				contentScriptFile: data.url('messages.js')
							
			});
			elementWorker.port.emit('alreadySaved',alreadySaved);*/
		}
    		
	}
	else if(actionAfterDownload == SHOW){
		try{
			openMenuTabWorker.port.emit('show',downloadedData);		
		}catch(e){
			console.log("ERROR!");
		}
	
	}

}

function listSavedTabs(){
	try{
		console.log('listSavedTabs: Sending getTableReady');
		openMenuTabWorker.port.emit('getTableReady','tabs');
		console.log('listSavedTabs: gapi.getData');
		var newData = new Object();
		newData.title = TABS_FILE;
		newData.token = access_token;
		gapi.getData(newData);
	}catch(e){
		console.log('ERROR!!');
	}
	
}

function listSavedBookmarks(){
	try{
		console.log('listSavedBookmarks: SEnding getTableReady bookmarks');
		openMenuTabWorker.port.emit('getTableReady','bookmarks');
		var newData = new Object();
		newData.title = BOOKMARKS_FILE;
		newData.token = access_token;
		gapi.getData(newData);
	}catch(e){
		console.log('ERROR');
	}

}

function listSavedHistory(){
	try{
		console.log('listSavedHistory: SEnding getTableReady history');
		openMenuTabWorker.port.emit('getTableReady','history');
		var newData = new Object();
		newData.title = HISTORY_FILE;
		newData.token = access_token;
		gapi.getData(newData);
	}catch(e){
		console.log("ERROR");
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

//Open the tab with the menu:
function openMenu(msg){
	tabs.open({
		url: data.url('myPage.html')
	});
	/*tabs.on('load', function(tab) {
		listSavedTabs();
	});*/	
	
	pageMod.PageMod({
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
		newData.token = access_token;
		newData.save = true;
		gapi.searchFile(newData);
	}
	else if (clickedNode.className == 'history'){
		newData.title = BOOKMARKS_FILE;
		newData.dataToSave = dataToSave;
		newData.token = access_token;
		newData.save = true;
		gapi.searchFile(newData);
	}
}








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
    //Lets search for the file.
    gapi.on('searchFile',handleSearchFile);
    //When the upload of a file has been completed:
    gapi.on('saveComplete',handleSaveCompleted);
    //When the download has been completed:
    gapi.on('downloadComplete',handleDownloadCompleted);
    

    
};







