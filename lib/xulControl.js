const {Ci,Cc} = require("chrome");
var { emit, on, once, off } = require("sdk/event/core");
var tabs = require("sdk/tabs");
var preferences = require("sdk/simple-prefs");
var myId = preferences.prefs['id'];


var mediator = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);
//Get the window
var window = mediator.getMostRecentWindow("navigator:browser");
//Get the XUL elements as DOM
var document = mediator.getMostRecentWindow("navigator:browser").document; 

/*XUL items unique identifiers*/
const TAB_MENU = myId+'syncTabMenu';
const OPEN_MENU = myId+'openMenu';
const SAVE_TABS_MENU = myId+'saveAllTabs';
const SETTINGS_MENU = myId+'settingsMenu';
const SS_MENU = myId+'syncShareMenu';
const SS_MENU_POPUP = myId+'syncShareMenuPopUp';
const SS_MENU_SEPARATOR = myId+'menuSeparator';
const SS_TAB_SEPARTOR = myId+'tabMenuSeparator';



function createMenuItem(id,label){
	var menuItem = document.createElement('menuitem');
	menuItem.setAttribute('id',id);
	menuItem.setAttribute('label',label);
	return menuItem;

}

function createMenuSeparator(id){
	var menuSeparator = document.createElement('menuseparator');
	menuSeparator.setAttribute('id',id);	
	return menuSeparator;
}


function addTabMenu() {    
	var tabContextMenu = document.getElementById("tabContextMenu");
	if (!tabContextMenu) {
		var message = {'msg':'Internal browser error!','type':'error'};
		emit(exports,'showMessage',message);
	}
	else{
		var separator = createMenuSeparator(SS_TAB_SEPARTOR);
		tabContextMenu.appendChild(separator);
		
		var currentTab = tabs.activeTab;
		var menuItem = createMenuItem(TAB_MENU,'Sync this tab');
		//menuItem.setAttribute('disabled','true');
		menuItem.addEventListener('command', function(event) {
					currentTab = tabs.activeTab;
					console.log(currentTab.id);
					console.log(currentTab.title);
					console.log(currentTab.url);
					if (currentTab.title == 'Connecting…' && currentTab.url == 'about:blank'){
						currentTab.on('ready',function(thisTab){
							console.log("READY!");
							emit(exports,'tabContextClicked',[thisTab]);
						});
					
					}
					else{
						console.log("Already ready!!!");
						emit(exports,'tabContextClicked',[currentTab]);
					}
					
						
		}, false);
		tabContextMenu.appendChild(menuItem);
		/*tabContextMenu.addEventListener('popupshowing',function(event){
			currentTab = tabs.activeTab;
			if (event.target.id == 'tabContextMenu'){ 
				var tabMenu = document.getElementById(TAB_MENU);
				currentTab.on('ready',function(thisTab){
					var tabMenu = document.getElementById(TAB_MENU);
					if (tabMenu){	
						tabMenu.setAttribute('disabled','false');
						
					}
				});
				 
			}	
		});*/
	}
	 	  
}


function addSaveAllTabsMenu(){
	//var toolBar = document.getElementById('menu_ToolsPopup');
	
	/*var menuitem = document.createElement('menuitem');
	menuitem.setAttribute('id', 'saveTabs');
	menuitem.setAttribute('label', 'Save all Tabs');*/
	var menuitem = createMenuItem(SAVE_TABS_MENU,'Save all Tabs');
	menuitem.addEventListener('command', function(event){
		emit(exports,'saveAllTabsClicked',tabs);
	});
	return menuitem;
}


function addOpenMenu(){
	
	
	var openMenuItem = createMenuItem(OPEN_MENU,'Open...');
	openMenuItem.addEventListener('command',function(event){
		emit(exports, 'openMenuClicked', 'open');
	});
	return openMenuItem;
	


}

function addSettingsMenu(){
	var settingsMenuItem = createMenuItem(SETTINGS_MENU,'Settings');
	
	settingsMenuItem.addEventListener('command',function(event){
		var addonMenu = document.getElementById('menu_openAddons');
		if (addonMenu){
			addonMenu.click();
		}
		else{
			tabs.open('about:addons');
		}
	});
	
	return settingsMenuItem;


}

exports.addAllOptions = function(){

	//Add the options in the tool menu:
	var toolBar = document.getElementById('menu_ToolsPopup');
	/***********A Separator***********************/
	//var separator = createMenuSeparator('SyncShareToolSeparator');
	//toolBar.appendChild(separator);
	//Create a pop up menu item:
	var menu = document.createElement('menu');
	menu.setAttribute('id',SS_MENU);
	menu.setAttribute('label','Synch & Share Menu');
	var menuPopUp = document.createElement('menupopup');
	menuPopUp.setAttribute('id',SS_MENU_POPUP);
	//Add the Save all Tabs option.
	menuPopUp.appendChild(addSaveAllTabsMenu());
	//Add the Open... menu option:
	menuPopUp.appendChild(addOpenMenu());
	/*************A Separator***********************/
	var separator = createMenuSeparator(SS_MENU_SEPARATOR);
	menuPopUp.appendChild(separator);
	//Add the settings options
	menuPopUp.appendChild(addSettingsMenu());
	menu.appendChild(menuPopUp);
	toolBar.appendChild(menu);
	//Add the tabs context menu:
	addTabMenu();


}

exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};


