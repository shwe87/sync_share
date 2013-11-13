var { emit, on, once, off } = require("sdk/event/core");

var data = require("sdk/self").data;
var tabs = require("sdk/tabs");
var Request = require("sdk/request").Request;
/* GOOGLE DRIVE OAUTH CONSTANTS */
const CLIENT_ID = '737302378245.apps.googleusercontent.com';
const CLIENT_SECRET = 'rcWgBDcdt9PuVnrKGXz81Hf7';
const REDIRECT_URI_URN = 'urn:ietf:wg:oauth:2.0:oob';
const REDIRECT_URI_LOCAL = 'http://localhost';
const SCOPE = 'https://www.googleapis.com/auth/drive.appdata+';
var URL = 'https://accounts.google.com/o/oauth2/auth?'+'scope='+SCOPE+'https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&'+'redirect_uri=' + REDIRECT_URI_URN + '&'+ 'client_id=' + CLIENT_ID+'&'+'response_type=code';

/*Files we can work with*/
const TABS_FILE = 'tabs.json';
const BOOKMARKS_FILE = 'bookmarks.json';
const HISTORY_FILE = 'history.json';


/*Google drive necessary var.*/
var access_token;
var token_type;
var expires_in;
var id_token;
var refresh_token;
var resumable_sesion_uri;
var theCode;




exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};


/*
When the token was expired!
info: synctab: Search File = Unauthorized
info: synctab: Search File = 401
info: synctab: Search File = {"Alternate-Protocol":"443:quic","Cache-Control":"private, max-age=0","Content-Encoding":"gzip","Content-Length":"162","Content-Type":"application/json; charset=UTF-8","Date":"Tue, 29 Oct 2013 13:34:06 GMT","Expires":"Tue, 29 Oct 2013 13:34:06 GMT","Server":"GSE","WWW-Authenticate":"Bearer realm=\"https://www.google.com/accounts/AuthSubRequest\", error=invalid_token","x-content-type-options":"nosniff","X-Frame-Options":"SAMEORIGIN","X-XSS-Protection":"1; mode=block","X-Firefox-Spdy":"3"}
info: synctab: Search File = {
 "error": {
  "errors": [
   {
    "domain": "global",
    "reason": "authError",
    "message": "Invalid Credentials",
    "locationType": "header",
    "location": "Authorization"
   }
  ],
  "code": 401,
  "message": "Invalid Credentials"
 }
}

*/

exports.makeMessage = function(){



}


//This is the auth function: controls the authentication process:
exports.auth = function (datas){
	//name = element;
	tabs.open({
		url: URL,
		onReady: function(tab){
			var tabWorker = tab.attach({
				contentScriptFile: data.url('google-drive-handler.js')
	 		});
	 		tabWorker.port.on('takeCode',function(myCode){
			theCode = myCode;
			try{
				tabWorker.port.on('closeTab',function(msg){
					tab.close();
				});
			}catch(e){
				console.log('Shut down!!');
			}
			var getAccess = Request({		
				url: 'https://accounts.google.com/o/oauth2/token',
				contentType: 'application/x-www-form-urlencoded',
				content: {'code': myCode,'client_id':CLIENT_ID,'client_secret':CLIENT_SECRET,'redirect_uri':REDIRECT_URI_URN,'grant_type':'authorization_code'},
				onComplete: function(response){
      					
					//console.log('STATUS ' + response.statusText);
					if(response.statusText =='OK'){
						/*
						The response format will be:
						 {
						  "access_token" : string,
						  "token_type" : string,
						  "expires_in" : 3600,
						  "id_token" : string,
						  "refresh_token" : string
						}
						To access this; response.json.access_token, etc
						*/
						tabWorker.port.emit('signedIn','Signed in correctly');
						datas.token = response.json.access_token;
						datas.token_type = response.json.token_type;
						datas.expires_in = response.json.expires_in;
						datas.id_token = response.json.id_token;
						datas.refresh_token = response.json.refresh_token;
						//datas.accessDatas = response.json;
						datas.authSuccess = true;
						console.log('auth: Elements  = '+JSON.stringify(datas));				
					}		
					else{
						datas.authSuccess = false;
					}
					emit(exports, 'authComplete', datas);
				}
			});
			getAccess.post();
			//console.log('Posted!');
			});
		
		}	
	});	

	
};



//Search for specific file with the file name title.
exports.searchFile = function(searchDatas){
	//title, dataToSave, token
	console.log("Search File.");
	var title = searchDatas.title;
	var token = searchDatas.token;
	var dataToSave = searchDatas.dataToSave;
	console.log("SEARCH FOR = " + title);
	//If dataToSave null then there is nothing to save
	//ElementToSave: 
        var exists = false;	//Lets assume that it doesn't exist.
        var request = "https://www.googleapis.com/drive/v2/files?q=title+=+'"+title+"'";
        var whoCalled = 'searchFile';
        var searchFor = Request({
                url: request,
                headers: {'Host':'www.googleapis.com','Authorization': 'Bearer '+ token},
                onComplete: function(response){
                	//console.log();
                	console.log("Search File = " + response.statusText);
                	console.log("Search File = " + response.status);
                	console.log("Search File = " + JSON.stringify(response.headers));
                	console.log("Search File = " + response.text);
                	if (response.status == '401'){	//Invalid token; Unauthorized
                		//auth('searchFile',[title,dataToSave]);
                		console.log("Unauthorized.");
                		searchDatas.whoCalled = whoCalled;
                		searchDatas.authorized = false;
                		emit(exports,'Unauthorized',searchDatas);
                	}
                	else if (response.status == '200'){ //Everything fine
                		var dLoadURL = '';
        			var fileId = '';
		               	if (response.json.items.length == 0){
		               		// If there is no item then the file doesn't exist-
		               		console.log("Search File Doesn't Exist " + response.text);                       		
		               	}
		               	else{
		               		//The files exists.
		               		console.log("Search File It exists " + title);
		               		exists = true;
		               		dLoadURL = response.json.items[0].downloadUrl;
		               		fileId = response.json.items[0].id;		
		               		searchDatas.dLoadURL = dLoadURL;
		               		searchDatas.fileId = fileId;               				
		               	}
		               	searchDatas.exists = exists;
		               	emit(exports, 'searchFile',searchDatas);
		        }
                       
                }
        });
        searchFor.get();
}

//Upload the file
function uploadFile(uploadData){
	//uploadFile = [fileData, resumable_sesion_uri]
	//fileData = [exists, title, dataToSave, token, dLoadURL, fileId]
	console.log('uploadFile: UPLOAD!!!!');
	//var fileData = uploadData[0];
	var dataToSave = uploadData.dataToSave;
	var token = uploadData.token;
	var resumable_sesion_uri = uploadData.resumable_sesion_uri;
	//var token = uploadData[2];
	
	var str = JSON.stringify(dataToSave);
	console.log("Going to upload = " + str ) ;
	var session = Request({		
		url: resumable_sesion_uri,
		//contentType: 'application/json; charset=UTF-8',
		headers: {'Authorization': 'Bearer '+ token,'Content-Type':'application/json; charset=UTF-8'},
		content: str,
		onComplete: function(response){			
			/*console.log('Upload file = ' + response.text);
			console.log('Upload file status = ' + response.status);
			console.log('Upload File status text = ' + response.statusText);
			console.log('Headers = ' + JSON.stringify(response.headers));*/
			console.log('uploadFile: Upload completed!!');
			resumable_sesion = response.headers.Location;
			uploadData.resumable_sesion = resumable_sesion;
			//var elementToSave = uploadData[3];
			emit(exports, 'saveComplete', uploadData); 
		}
	
	});
	session.put();

}

//Start the upload process:
exports.startUpload = function startUpload(fileData){
	//fileData = [exists, title, dataToSave, token, dLoadURL, fileId]
	var exists = fileData.exists;
	var fileName = fileData.title;
	var dataToSave = fileData.dataToSave;
	var token = fileData.token;
	//var elementToSave = fileData[6];
	/*var dataToSave = fileData[4];
	var token = fileData[5];*/
	
	
	if (!exists){		
		//If it is a new file then create it:
		console.log('handleSave: NO EXSITE '+ fileName);
		var parents = [{'id':'appdata'}];
		var j = {'title': fileName,'parents':parents};
		var str = JSON.stringify(j);
		var session = Request({		
			url: 'https://www.googleapis.com/upload/drive/v2/files?uploadType=resumable',
			//contentType: 'application/json; charset=UTF-8',
			headers: {'Host':'www.googleapis.com','Authorization': 'Bearer '+ token,'Content-Length':38,'Content-Type':'application/json; charset=UTF-8','X-Upload-Content-Type':'application/json'/*,'X-Upload-Content-Length':2000000*/},
			content: str,
			onComplete: function(response){
				console.log('Start Upload file = ' + response.statusText+'\r\n\r\n');
				/*console.log('Start Upload file status = ' + response.status+'\r\n\r\n');
				console.log('Start Upload File status text = ' + response.statusText+'\r\n\r\n');
				console.log('Start Headers = ' + JSON.stringify(response.headers+'\r\n\r\n'));*/
				resumable_sesion_uri = response.headers.Location;
				fileData.resumable_sesion_uri = resumable_sesion_uri;
				//console.log(resumable_sesion_uri);
				//this.uploadFile(dataToSave, resumable_sesion_uri, token);
				//this.listen;
				//emit(exports, 'startComplete', [dataToSave, resumable_sesion_uri, token]);
				/*
				var dataToSave = uploadData[0];
				var resumable_sesion = uploadData[1];
				var token = uploadData[2];
				*/
				
				uploadFile(fileData);
				
						
			}	
		});
		session.post();
	}
	else{
		var downloadURL = fileData.dLoadURL;
		var fileId = fileData.fileId;
		//Try to just add lines, not upload a new file.
		//First step: Start a resumable session:
		console.log('handleSave: Existe ' + fileName );
		var session = Request({                
		        url: 'https://www.googleapis.com/upload/drive/v2/files/'+fileId+'?uploadType=resumable',
		        //contentType: 'application/json; charset=UTF-8',
		        headers: {'Host':'www.googleapis.com','Authorization': 'Bearer '+ token/*,'Content-Length':38,'Content-Type':'application/json; charset=UTF-8','X-Upload-Content-Type':'application/json'/*,'X-Upload-Content-Length':2000000*/},
		        //content: str,
		        onComplete: function(response){
		                console.log('Start Upload file = ' + response.statusText+'\r\n\r\n');
				/*console.log('Start Upload file status = ' + response.status+'\r\n\r\n');
				console.log('Start Upload File status text = ' + response.statusText+'\r\n\r\n');
				console.log('Start Headers = ' + JSON.stringify(response.headers+'\r\n\r\n'));*/
		                resumable_sesion_uri = response.headers.Location;
		                //this.uploadFile(dataToSave, resumable_sesion_uri, token);
		                //emit(exports, 'startComplete', [dataToSave, resumable_sesion_uri, token ]); 
		                //this.listen; 
		                fileData.resumable_sesion_uri = resumable_sesion_uri;    
		                uploadFile(fileData);      
		        }        
		});
		session.put();	
	}
	
}



/*exports.saveData = function(fileName, dataToSave,token, resumable_sesion_uri){

	this.searchFile(fileName, dataToSave, token);
	this.on('startUpload',this.handleSave);
}*/







/*
POST /o/oauth2/token HTTP/1.1
Host: accounts.google.com
Content-Type: application/x-www-form-urlencoded

client_id=8819981768.apps.googleusercontent.com&
client_secret={client_secret}&
refresh_token=1/6BMfW9j53gdGImsiyUH5kU5RsR4zwI9lUVX-tqf8JXQ&
grant_type=refresh_token

*/

exports.refreshToken = function(){
	

}

exports.downloadData = function(datas){
	/*fileData = [exists, title, dataToSave, token, dLoadURL, fileId]*/
	var token = datas.token;
	var downloadURL = datas.dLoadURL;
	var whoCalls = 'downloadData';
        var download = Request({
                url: downloadURL,
                headers: {'Authorization': 'Bearer '+ token},
                onComplete: function(response){
                       // console.log("downloadData: Downloaded data = "  response.text);
                        console.log("downloadData: status " + response.status);
                        console.log("downloadData: status text " + response.statusText);
                        //console.log("downloadData: Headers " + JSON.stringify(response.headers));
                       // console.log();
                       if(response.status == '401'){
                       		//refresh_token
                       		//emit(exports,'auth',[fileName, downloadURL]);
                       		datas.whoCalled = whoCalls;
                       		datas.fileData = fileData;
                       		emit(exports,'Unauthorized',datas);
                       
                       }
                       else if(response.status == '200'){
				//If it is just download the datas then:
				datas.downloadedContent = response.text;
		               	emit(exports,'downloadComplete',datas);		
                       }
                      
                }
        
        });
        download.get();
}

/*
exports.handleData = function(fileData){
	
	var exists = fileData[0];
	var fileId = fileData[1];
	var downloadURL = fileData[2];
	var fileName = fileData[3];
	var dataToSave = fileData[4];
	var token = fileData[5];
	
	if (exists){
		console.log('handleData: Existe ' + fileName);
		this.downloadData(fileName, downloadURL, token);
	}
	else{
		console.log('handleData: No EXISTE ' + fileName);
		emit(exports,'cannotDownload',fileName);
	}


}
*/

exports.getData = function(searchDatas){
	searchDatas.save = false;
	this.searchFile(searchDatas)
	//this.on('startDownload',this.handleData); 
}





















