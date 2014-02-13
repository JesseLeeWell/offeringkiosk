 // Wait for Cordova to load
    //
document.addEventListener("deviceready", onDeviceReady, false);

//environment
var environment = 'dev';
//var environment = 'qa';
//var environment = 'prod';
//var environment = 'local';
 // Global InAppBrowser reference
if(environment == 'dev')
{
	var _baseURL =  'http://dev.continuetogive.com/';
	var _kioskURL = 'http://dev.kiosk.continuetogive.com/';
	
}
else if(environment == 'qa')
{
	var _baseURL = 'http://qa.continuetogive.com/';
	var _kioskURL = 'http://qa.kiosk.continuetogive.com/';
}
else if(environment == 'local')
{
	var _baseURL = 'http://local.bugfixes.continuetogive.com/';
	var _kioskURL = 'http://local.bugfixes.continuetogive.com/';
}
else if(environment == 'prod')
{
	var _baseURL = 'http://www.continuetogive.com/';
	var _kioskURL = 'http://www.kiosk.continuetogive.com/';
}
else
{
	var _baseURL = 'http://dev.continuetogive.com/';
	var _kioskURL = 'http://dev.kiosk.continuetogive.com/';
}
var _kiosksetupURL = 'index.php?moduleType=Module_kiosk&task=setupkiosk';
var _forgotPinURL = 'index.php?moduleType=Module_system&task=kioskforgotpassword';
var _contactRequestURL ='index.php?moduleType=Module_kiosk&task=appcontactrequestform';
var _searchPage = 'index.php?moduleType=Module_Search&task=show.results';
var _signUpPage = 'index.php?moduleType=Module_Registration&task=regflow_church&registrationstep=regcreateaccount';
var _getPageInformationURL = 'router/Kiosk/getpageinformation?pageid=';

var appwindow = null;
var browserwindow = null;
var _storagePageID = "storagePageID";
var _storageDisplayName = "storageDisplayName";
var _storageFullURL = "storageFullURL";
var _storagePin = 'pin';

//setPagePaymentInformation();

// Cordova is ready
//
$( document ).ready(function() {
 onDeviceReady();
});

function onDeviceReady() { 

	alert(window.device.model);

	

	alert( 'Device Name: '     + device.name     + '<br />' +
                            'Device Cordova: '  + device.cordova  + '<br />' +
                            'Device Platform: ' + device.platform + '<br />' +
                            'Device UUID: '     + device.uuid     + '<br />' +
                            'Device Model: '    + device.model    + '<br />' +
                            'Device Version: '  + device.version  + '<br />');
						

	setupbyscreensize();	
	setPagePaymentInformation(setStepClaimOrganization);
	//var hideIntro = 'true';//storageGet('hideintro');
	var hideIntro = storageGet('hideintro');
	
	//var alreadyshowedintro = window.sessionStorage.getItem('alreadyshowedintro');
	setupSettingsPage();	
	if((hideIntro && hideIntro == 'true'))// || (alreadyshowedintro && alreadyshowedintro == 'true'))
	{
		
		determinStartPage();
	}
	else
	{
		//set the session storage that it showed the intro
		//window.sessionStorage.setItem("alreadyshowedintro", "true");	
		$.mobile.loading( 'show', {
			text: 'Loading Intro',
			textVisible: true,
			theme: 'a',
			html: ""
		});
		setTimeout( function() { 
			loadMoreInfo('');
			
			}, 2000 );
				
		
	}	
	
}

//bind to our indexpage so that we can set it up every tiem we go there
$(document).bind( "pagechange", function( e, data ) { 

	if ( data.options.target == "#indexpage" ) {


		setupSettingsPage();
	}
});
function determinStartPage()
{
	//based on the settings they chose, open the correct screen
	//settings vs donation vs point of sale
	
	//first make sure we have a donation page set, if not defaule to settings.
	var pageid = getPageID();
	var displayname = getDisplayName();	
	
	if(!(isSearchSet()))
	{
		return true; //just leave them on the settings screen
	}
	else
	{
		
		//determine what they set as the opeing page
		var startpageselection = storageGet('startpageselection');
		switch(startpageselection)
		{
			case 'donationpage':
			  openDonationPage('');
			  break;
			case 'pointofsalepage':
			  openDonationPage('/donation_prompt?show_purchase_form=true');
			  break;
			default:
			  //default is just settings page, so just do nothing
			  break;
		}
	
	}
	

}
function iabLoadStart(event) { 
	//alert(event.type + ' - ' + event.url);
}

 function iabLoadStartSearch(event) { 
	
	cururl = event.url;
	
	if(cururl.indexOf("?displayname") != -1)
	{
		
		storeURLInfo(cururl);		
		storageSet('step-search','true');	
		browserwindow.removeEventListener('exit', iabCloseSearch);
		//remove the page data from storage
		window.sessionStorage.removeItem('pagedata');
		setPagePaymentInformation();
		
		//determin what step to send the user to.  eiteher settings page or screen selection page
		if(isStartScreenSet())
		{
			showMessage("Now that your page is set, you can put your kiosk into donation or point of sale mode from this settings screen ", '', " ", "OK");
			loadSettingsPage();
			
		}
		else
		{
			openSetStartScreenPage();
			
		
		}		
		
		//close the search window
		browserwindow.close();
	}
}

 function iabLoadStopDonation(event) { 
	
	cururl = event.url;
	
	if(cururl.indexOf("donation_prompt") != -1)
	{
		
		
	
		
		//browserwindow.executeScript({code: "callAlertTest();"});

	}
}
 function iabLoadStartDonation(event) { 
	
	cururl = event.url;
	
	if(cururl.indexOf("kiosksettings") != -1)
	{
		
		
		browserwindow.close();		
		

	}
}

function iabLoadStop(event) {
	
}

function iabCloseSearch(event) {	
 
	 browserwindow.removeEventListener('loadstart', iabLoadStartSearch);
	 browserwindow.removeEventListener('loadstop', iabLoadStop);
	 browserwindow.removeEventListener('exit', iabCloseSearch);
	 //make sure the home screen is back to index
	
	 loadSettingsPage();
	// appwindow = window.open('index.html', '_self', 'location=yes');	
}

function iabCloseDonation(event) {	
 
	
	showUnlockKioskPage();	 
	 browserwindow.removeEventListener('loadstop', iabLoadStop);
	 browserwindow.removeEventListener('exit', iabCloseDonation);
	//appwindow = window.open('index.html', '_self', 'location=yes');	//donation windows should already be at the index any ways
	//openDonationPage('');
}
function openSearch()
{
	//set the settings path
	storageSet('securesuccesspath', 'search');
	storageSet('securecancelpath', 'index');
	//determin if they should go to the secure kiosk or the unlock kiosk page
	
	if(!isPinSet())
	{
		showSecureKioskPage();
	}
	else
	{
		
		showUnlockKioskPage();
	
	}
}
function openSearchPage()
{	
	browserwindow = window.open(_kioskURL + _searchPage, '_blank', 'location=no,closebuttoncaption=settings');
	
	browserwindow.addEventListener('loadstart', iabLoadStartSearch);
	//browserwindow.addEventListener('loadstop', iabLoadStartSearch);
	browserwindow.addEventListener('exit', iabCloseSearch);
	
}
function openSignupPage()
{
	
	browserwindow = window.open(_baseURL + _signUpPage, '_blank', 'location=no,closebuttoncaption=settings');
	//browserwindow.addEventListener('exit', iabClose);
	
}
function getParameterByName(name, url) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(url);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function openDonationPage(extras)
{
	if(isSearchSet())
	{
		storageSet('securesuccesspath', 'index');
		storageSet('securecancelpath', 'donation');
		var pageid = getPageID();
		var url =_kioskURL + pageid + extras;
		
		
		browserwindow = window.open(url, '_blank', 'toolbar=no,location=no');	
		browserwindow.addEventListener('exit', iabCloseDonation);
		browserwindow.addEventListener('loadstop', iabLoadStopDonation);
		browserwindow.addEventListener('loadstart', iabLoadStartDonation);
		
	}
	else
	{
		showMessage("Please set the kiosk to your church, organization, or fundraiser in step 2 below. ", '', " ", "OK");
		
	
	}
	

}
function storageSet(key, value)
{
	window.localStorage.setItem(key, value);
}
function storageGet(key)
{
	return window.localStorage.getItem(key);
}
function storePageID(value)
{
	storageSet(_storagePageID, value);
}
function storeFullURL(value)
{
	storageSet(_storageFullURL, value);
}
function storeDisplayName(value)
{
	storageSet(_storageDisplayName, value);
}
function getPageID()
{
	return storageGet(_storagePageID);
}
function getDisplayName()
{
	return storageGet(_storageDisplayName);
}
function getFullURL()
{
	return storageGet(_storageFullURL);
}
function storeURLInfo(fullURL)
{
	
	storeFullURL(fullURL);
	var pageid = findPageID(fullURL);
	//get displayname
	var displayname = getParameterByName("displayname", fullURL);
	
	//save these
	storePageID(pageid);
	storeDisplayName(displayname);
}
function setupSettingsPage()
{
	
	//alert('in setup');
	setupKioskOrganizationDisplayName();
	setStepPin();
	setStepSearch();
	setStepStartScreen();
	setStepStartRecivingDonations();
	setStepClaimOrganization();
	//alert('end setup');
	
}
function setStepPin()
{
	//if a pin has been setup, then set this task to completed
	
	if(isPinSet())
	{
		
		$('.step-pin-outer').addClass('completed');
	}
	else
	{
		
		$('.step-pin-outer').removeClass('completed');
	
	}
	
}
function setStepSearch()
{
	
	
	if(isSearchSet())
	{
		$('.step-search-outer').addClass('completed');
	}
	else
	{
		
		$('.step-search-outer').removeClass('completed');
	
	}
}
function setStepStartScreen()
{
	
	if(isStartScreenSet())
	{
		$('.step-startscreen-outer').addClass('completed');
	}
	else
	{
		
		$('.step-startscreen-outer').removeClass('completed');
	
	}
}
function setStepStartRecivingDonations()
{
	
	if(isStartRecivingDonationsSet())
	{
		$('.step-recievedonations-outer').addClass('completed');
	}
	else
	{
		
		$('.step-recievedonations-outer').removeClass('completed');
	
	}
}
function setStepClaimOrganization()
{
	
	if(isFundraisingPageClaimed())
	{
		$('.step-claimorganization-outer').hide();
	}
	else
	{
		
		$('.step-claimorganization-outer').show();
	
	}
	
	
}


function setupKioskOrganizationDisplayName()
{
	
	//var infoField = document.getElementById("kioskOrganizationDisplayName");
	if(isSearchSet())
	{
		var displayname = getDisplayName();
	
		//infoField.innerHTML = "Kiosk is set to: "+ displayname;
		$("#kioskOrganizationDisplayName").html("Kiosk is set to: "+ displayname);
		
	}
	else
	{
		$("#kioskOrganizationDisplayName").html("");
		//infoField.innerHTML = "";
	
	}
	

}
function findPageID(fullURL)
{
	
	var urlAux = fullURL.split('/');
    var pageid = urlAux[3];
	urlAux = pageid.split('?');
	pageid = urlAux[0];
	return pageid;
}
function showUnlockKioskPage()
{
	//set the state to locked so our timer function will cancel after the apointed time.
	//but if they unlock it with the correct pin, then the state will go to unlocked, and the cancel option will not happen
	storageSet('unlockkioskcurrentstate', 'locked');
	setTimeout(function() {
		  cancelUnlockKioskIfStateIsCorrect();// Do something after 5 seconds
	}, 10000);
	
	
	 $(':mobile-pagecontainer').pagecontainer('change', '#unlockkioskpage', {
        transition: 'pop',
        changeHash: false,
        reverse: false,
        showLoadMsg: true,
		role: "dialog"
    });
	//$.mobile.changePage('#unlockkioskpage','slidefade');
	//appwindow = window.open('index.html#unlockkioskpage', '_self', 'location=yes');
}
function showSecureKioskPage()
{
	
	$(':mobile-pagecontainer').pagecontainer('change', '#securekioskpage', {
			transition: 'pop',
			changeHash: false,
			reverse: false,
			showLoadMsg: true,
			role: "dialog"
		});
		
	//first decide if they have already locked hteir kiosk or not.
	//if they have, then they are going to edit this page.
	//we will hide and show different buttons and pin number
	
	if(isPinSet())
	{
		//then they edit what they have
		 $('#editpinpin').show();
		 $('#editpintext').show();
		 $('#createpintext').hide();
		 $('#securepin').attr("placeholder","New Pin - Required");
		 $('#secureconfirmpin').attr("placeholder","Confirm New Pin - Required");
		
	}
	else
	{
		$('#editpinpin').hide();
		$('#editpintext').hide();
		 $('#createpintext').show();
		$('#securepin').attr("placeholder","Pin - Required");
		$('#secureconfirmpin').attr("placeholder","Confirm Pin - Required");
	
	}
	 
	//$('#secureconfirmpin').addClass('warning');
	//$.mobile.changePage('#securekioskpage','slidefade');
	//window.location = "securekiosk.html";
}
/*
function saveStartPageRadioButtonValue()
{
	alert('in save');
	var startpageselection = $('input[name=startpagegroup]:checked').val();
	//alert(startpageselection);
	storageSet('startpageselection', startpageselection);
	
}
*/
function loadSettingsPage()
{
	
	$(':mobile-pagecontainer').pagecontainer('change', '#indexpage', {
			transition: 'slidefade',
			changeHash: false,
			reverse: true,
			showLoadMsg: true
		});
	
}

function loadMoreInfo(pagetype)
{
	storageSet('hideintro', true);
	switch(pagetype)
		{
			case 'dialog':
			   $(':mobile-pagecontainer').pagecontainer('change', 'intro.html', {
					transition: 'pop',
					changeHash: false,
					reverse: false,
					showLoadMsg: true,
					role: "dialog"
				});
			  break;
			
			default:
				//using the click technique so that we can load it with a transistion and still use the external relation tag it has on a tags
				//alert("here");
				//$('#moreinfolink').click();
				/*
				 $(':mobile-pagecontainer').pagecontainer('change', 'intro.html', {
					transition: 'slidefade',
					changeHash: false,
					reverse: false,
					showLoadMsg: true,
					rel: 'external'
				});
			*/
			  appwindow = window.open('intro.html', '_self', 'location=yes');
			  break;
		}
	

}

function loadContactRequest()
{
	var url = _baseURL + _contactRequestURL;
	appwindow = window.open(url, '_blank', 'location=no');
	
}
function openSetStartScreenPage()
{
	 $(':mobile-pagecontainer').pagecontainer('change', '#setstartscreenpage', {
		transition: 'pop',
		changeHash: false,
		reverse: false,
		showLoadMsg: true,
		role: "dialog"
	});
	
	//set up the radio buttons for start page
	var startpageselection = storageGet('startpageselection');	
	var nametoset = "radiostartpagegroup"+startpageselection;
	$("#"+nametoset).prop("checked", true);
	$("input[type='radio']").checkboxradio("refresh");
}

function closeSetStartScreenPage()
{	
	var startpageselection = $('input[name=startpagegroup]:checked').val();
	//alert(startpageselection);
	storageSet('startpageselection', startpageselection);
	
	if(isStartRecivingDonationsSet())
	{
		loadSettingsPage();
	}
	else
	{
		 openStartRecivingDonationsPage();
	}
	
}
function openStartRecivingDonationsPage()
{
	storageSet('step-recievedonations','true');
	$(':mobile-pagecontainer').pagecontainer('change', '#startreceivingdonationspage', {
		transition: 'pop',
		changeHash: false,
		reverse: true,
		showLoadMsg: true,
		role: "page"
	});
	var pageinfo = getPagePaymentInformation();
	if(!pageinfo.userid || pageinfo.userid == 'null')
	{
		var displayname = getDisplayName();
		
		var address = displayname +"</br>"+ ((pageinfo.address) ? pageinfo.address : " ")+"</br>"+ ((pageinfo.city) ? pageinfo.city : " ")+" "+ pageinfo.state+" "+ ((pageinfo.zip) ? pageinfo.zip : " ");	
		
		$("#organizationinfo").html(address);


		$('#startrecievingdonationsunclaimeddiv').show();
		$('#startrecievingdonationsclaimeddiv').hide();
	}
	else
	{
		
		$('#startrecievingdonationsunclaimeddiv').hide();
		$('#startrecievingdonationsclaimeddiv').show();
	}
}

function closeStartRecivingDonationsPage()
{
	loadSettingsPage();
}
function clearDataForTesting()
{

	window.localStorage.clear();
	loadSettingsPage();
	

}
function showMessageCallBack()
{
	
	return true;
}
function showMessage(message, callback, title, buttonName){
	
        title = title || "default title";
        buttonName = buttonName || 'OK';
		callback = callback || 'showMessageCallBack';
		
        if(navigator.notification && navigator.notification.alert){
			
			navigator.notification.alert(
				message,  // message
				showMessageCallBack,         // callback
				title,            // title
				buttonName                  // buttonName
			);
           

        }else{

            alert(message);
            callback();
        }

    }
function isPinSet()
{
	var pin = storageGet(_storagePin);
	var email = storageGet('email');
	if((!pin || /^\s*$/.test(pin)) || (!email || /^\s*$/.test(email)))
	{
		return false;
		
	}
	else
	{
		return true;
		
	
	}
}
function isSearchSet()
{
	var pageid = getPageID();
	var displayname = getDisplayName();
	if((!pageid || /^\s*$/.test(pageid)) || (!displayname || /^\s*$/.test(displayname)))
	{
		return false;
	}
	else
	{
		
		return true;
	
	}
}
function isStartScreenSet()
{
	var startpageselection = storageGet('startpageselection');	
	
	if((!startpageselection || /^\s*$/.test(startpageselection)) )
	{
		return false;
		
	}
	else
	{
		
		return true;
	
	}
}
function isStartRecivingDonationsSet()
{	
	var steprecievedonations = storageGet('step-recievedonations');	
	
	if((!steprecievedonations || /^\s*$/.test(steprecievedonations)) )
	{
		return false;
	}
	else
	{
		
		return true;
	
	}

}
function isFundraisingPageClaimed()
{
	//do an ajax call to c2g and see if the page is claimed. 
	var returnval = true;
	var pageid = getPageID();
	if(!pageid)
	{
		//return true since they have not page selected to claim
		returnval = true;
	}
	else
	{
		
		var pageinfo = getPagePaymentInformation();
		if(!pageinfo.userid || pageinfo.userid == 'null')
		{
			returnval = false;
		}
		else
		{
			returnval = true;
		}	
		
		
	}
	return returnval;
}
function setPagePaymentInformation(callback)
{
	
	var pageid = getPageID();
	if(!pageid)
	{	
		window.sessionStorage.setItem('pagedata','' );
		
		
	}
	else
	{ 
		
		var urlstring = pageid;
				
		var urltocall = _baseURL + _getPageInformationURL + urlstring;
		$.ajax({
		  url: urltocall,
		  success:function(data){
			
			var obj = jQuery.parseJSON(data );
			
			window.sessionStorage.setItem('pagedata',data);
			if(callback)
			{
				callback();
			}
			
		  }
		  ,
		  fail:function(data){
			
			var obj = jQuery.parseJSON(data );
			
			window.sessionStorage.setItem('pagedata','' );
			if(callback)
			{
				callback();
			}
			
		  }
		});
		
	}

}
function getPagePaymentInformation()
{
	
	var pagedata = window.sessionStorage.getItem('pagedata');
	var obj = jQuery.parseJSON(pagedata );
	return obj;
	
	
	var pageid = getPageID();
	if(!pageid)
	{
		return jQuery.parseJSON('' );
	}
	else
	{ 
		/* cutting this out because otherwise it doesn't run ascyn cause it comes back from mem right away
		//check if we have it in sessionstorage
		var pagedata = window.sessionStorage.getItem('pagedata');
		
		if( !(!pagedata || /^\s*$/.test(pagedata)))
		{
			
			var obj = jQuery.parseJSON(pagedata );
			callback(obj);	
		}
		else
		{
		*/
			var urlstring = pageid;
					
			var urltocall = _baseURL + _getPageInformationURL + urlstring;
			$.ajax({
			  url: urltocall,
			  success:function(data){
				
				var obj = jQuery.parseJSON(data );
				
				window.sessionStorage.setItem('pagedata',data);
				callback(obj);	
				//return obj;
			  }
			});
		//}
	}
}
 function isValidEmailAddress(emailAddress) {
	var pattern = new RegExp(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/);
	return pattern.test(emailAddress);
};
function setupbyscreensize()
{

	width = $(document).width(); // returns width of HTML document
	//alert(width);
	if(width < 720)
	{
	 $('#pagebody').addClass('smallScreen');	
	 $('.largeScreen-setupSteps').hide();
	 $('.smallScreen-setupSteps').show();
	 
	 
	
	}
	else
	{
		$('#pagebody').removeClass('smallScreen');
		$('.smallScreen-setupSteps').hide();
		$('.largeScreen-setupSteps').show();
		
		//$('#donation_prompt_div').addClass('inline_block');
		
	}
}
$( window ).resize(function() {
setupbyscreensize();
});

setupbyscreensize();
