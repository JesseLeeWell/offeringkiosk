 // Wait for Cordova to load
    //
document.addEventListener("deviceready", onDeviceReady, false);
document.addEventListener("resume", onDeviceReady, false);

//environment
//var environment = 'dev';
//var environment = 'qa';
var environment = 'prod';
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
var _appCheckURL = 'appcheck.php';
var _purchasePageURL = 'index.php?moduleType=Module_Content&task=text&article=learn_more_kiosk';
var _lockKioskHelpURL = 'index.php?moduleType=Module_Content&task=text&article=kiosk_ios_kiosk_mode';

var browserwindow = null;
var browserwindow = null;
var _storagePageID = "storagePageID";
var _storageDisplayName = "storageDisplayName";
var _storageFullURL = "storageFullURL";
var _storagePin = 'pin';
var _kioskversion = '3.0';
var _kiosklicense = 'store';
//var _kiosklicense = 'enterprize';


// Cordova is ready
//
$( document ).ready(function() {
 //onDeviceReady();
});

function onDeviceReady() { 
	
	setapplesafe();
    
    //activate card reader
    //activateCardReader();
    setupbyscreensize();
    
	setPagePaymentInformation(setStepClaimOrganization);
	setupSettingsPage();
    determinStartPage();
	
	
	
}
//bind to our indexpage so that we can set it up every tiem we go there
$(document).bind( "pagechange", function( e, data ) { 

	if ( data.options.target == "#indexpage" ) {


		setupSettingsPage();
	}
	if ( data.options.target == "#setstartscreenpage" ) {


		setupStartScreenPage();
	}
});
function determinStartPage()
{
    window.sessionStorage.setItem('already_initialSetup', true);
    
   	
	//var hideIntro = 'true';//storageGet('hideintro');
	var hideIntro = storageGet('hideintro');
	
	//var alreadyshowedintro = window.sessionStorage.getItem('alreadyshowedintro');
	
	
	
	if((hideIntro && hideIntro == 'true'))// || (alreadyshowedintro && alreadyshowedintro == 'true'))
	{
		
		//based on the settings they chose, open the correct screen
        //settings vs donation vs point of sale
        
        //first make sure we have a donation page set, if not defaule to settings.
        var pageid = getPageID();
        var displayname = getDisplayName();
        //if it is not apple safe, just leave them at the settings page
        if((!(isSearchSet())) || !(getAppleSafe()))
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
function setapplesafe()
{
	
	
	var applesafeversion = storageGet('applesafeversion');
	var applesafestorage = storageGet('applesafestorage');
	
	//only check if ipad and and store
	
	
	var isapple = isApple();
	
	//if it is false, we need to check in case it changed
	//if the two app versions don't match up we need to check
	//if its true and the 2 app version match, we don't need to check	
	
	if(((isapple && (_kiosklicense == 'store')) ) && ( !(applesafestorage == 'true') || !(applesafeversion == _kioskversion) ))
	{
		//if it came in here, we set the flow to false until we know otherwise
		storageSet('applesafestorage', 'false');
		
		//then we need to check the version
		var urltocall = _baseURL + _appCheckURL + "?kioskversion="+_kioskversion;
		$.ajax({
		  url: urltocall,
		  success:function(data){
			
			var result = (data =='true' )?'true':'false';
			
			
			storageSet('applesafeversion', _kioskversion);
			storageSet('applesafestorage', result);
		
			
		  }
		  ,
		  fail:function(data){
			
			
			storageSet('applesafeversion', _kioskversion);
			storageSet('applesafestorage', 'false');
			
			
			
		  }
		});
	
	}
	else
	{
		
		storageSet('applesafestorage', 'true');
			
	}
	

}
function getAppleSafe()
{
	
	var result = true;
	//only check if apple, otherwise its true
	
	var isapple = isApple();
	
	if(isapple && (_kiosklicense == 'store'))
	{
		result = (storageGet('applesafestorage') == 'true')?true:false;
	}
	
	return result;
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
		setPagePaymentInformation(null);
		ajaxCallKioskSetup();
		
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
	alert("here");
	if(cururl.indexOf("donation_prompt") != -1)
	{
        //activate card reader
        activateCardReader();
		
        //startTaskSwipe();
		
		//browserwindow.executeScript({code: "callAlertTest();"});

	}
}
 function iabLoadStartDonation(event) { 
	
	cururl = event.url;
	alert("here");
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
	// browserwindow = window.open('index.html', '_self', 'location=yes');	
}

function iabCloseDonation(event) {	
 
	
	showUnlockKioskPage();	 
	 browserwindow.removeEventListener('loadstop', iabLoadStop);
	 browserwindow.removeEventListener('exit', iabCloseDonation);
	//browserwindow = window.open('index.html', '_self', 'location=yes');	//donation windows should already be at the index any ways
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
	var target = (getAppleSafe())?'_blank':'_system';
	browserwindow = window.open(_kioskURL + _signUpPage, target, 'location=no,closebuttoncaption=settings');
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
        
        storageSet('lastopendonationpageextras', extras);
		var pageid = getPageID();
		var url =_kioskURL + pageid + extras;
		
		//determin if this page should be open in app or not
		//for store ios open in blank
		
		if(getAppleSafe())
		{
			
			browserwindow = window.open(url, '_blank', 'toolbar=no,location=no');	
			browserwindow.addEventListener('exit', iabCloseDonation);
			browserwindow.addEventListener('loadstop', iabLoadStopDonation);
			browserwindow.addEventListener('loadstart', iabLoadStartDonation);
		}
		else
		{	
			
			browserwindow = window.open(url, '_system', 'toolbar=no,location=no');
		}
		
		
		
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
function storageGet(key, defaultval)
{
   
   	//if((!window.localStorage.getItem(key) || /^\s*$/.test(window.localStorage.getItem(key))))
    if(typeof window.localStorage.getItem(key) === 'undefined' )
	{
        
        if((!defaultval ))
        {
            
            return null;
        }
        else
        {
            return defaultval
        }
		
		
	}
    
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
	
	setupKioskOrganizationDisplayName();
	setStepPin();
	setStepSearch();
	setStepStartScreen();
	
	setStepStartRecivingDonations();
	setHelpfullLinks();
	
	setDeviceSpecificClasses();
	
	setStepClaimOrganization();
	
	
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
function setDeviceSpecificClasses()
{
	
	if(isApple())
	{
		$('.appleonly').show();
	}
	else
	{
		
		$('.appleonly').hide();
	
	}
	if(getAppleSafe())
	{
		
		$('.applestoresafe').show();
	}
	else
	{
		
		$('.applestoresafe').hide();
	
	}
}
function setHelpfullLinks()
{
	//if the search is set, we can show these
	if(isSearchSet())
	{
		$('#helpfullinks').show();
	}
	else
	{
		
		$('#helpfullinks').hide();
	
	}
}
function isApple()
{
	
	var devicetype = device.platform;	
	var result = ((devicetype.toLowerCase().indexOf("iphone") >= 0) || (devicetype.toLowerCase().indexOf("ipad") >= 0) || (devicetype.toLowerCase().indexOf("ipod") >= 0) || (devicetype.toLowerCase().indexOf("ios") >= 0));
	
	return result
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
    storageSet('securecanceltime', $.now());
	setTimeout(function() {
		  cancelUnlockKioskIfStateIsCorrect();// Do something after 10 seconds
	}, 10000);
	
	
	 $(':mobile-pagecontainer').pagecontainer('change', '#unlockkioskpage', {
        transition: 'pop',
        changeHash: false,
        reverse: false,
        showLoadMsg: true,
		role: "dialog",
		
    });
	if(environment != 'prod')
	{
		$('#unlockpin').val('123');
	}
	
	
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
	//set
	
	$('#email').val(storageGet('email'));
	$('#name').val(storageGet('name'));	
	$('#phonenumber').val(storageGet('phonenumber'));
	if(storageGet('represents'))
	{
		$('#represents').val(storageGet('represents')).attr("selected", "selected").change();
	}
	//dev stuff to make preset this stuff
	if(environment != 'prod')
	{
		$('#currentpin').val('123');
		$('#securepin').val('123');
		$('#secureconfirmpin').val('123');
		$('#secureconfirmpin').val('123');
		$('#email').val('jesseleewell@yahoo.com');
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
function setupStartScreenPage()
{
	
	setDeviceSpecificClasses();
}
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
			  browserwindow = window.open('intro.html', '_self', 'location=yes');
			  break;
		}
	

}

function loadContactRequest()
{
	var url = _kioskURL + _contactRequestURL;
	browserwindow = window.open(url, '_blank', 'location=no');
	
}
function loadPurchasePage()
{
	var url = _kioskURL + _purchasePageURL;
	var target = (getAppleSafe())?'_blank':'_system';
	browserwindow = window.open(url, target, 'location=no');
}
function loadLearnMorePage()
{
	var target = (getAppleSafe())?'_blank':'_system';
	browserwindow = window.open(_baseURL, target, 'location=no');
}
function loadLockKioskHelp()
{
	var url = _kioskURL + _lockKioskHelpURL;
	browserwindow = window.open(url, '_blank', 'location=no');
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

		//alert(message);
		//return true;
		
        title = title || "default title";
        buttonName = buttonName || 'OK';
		callback = callback || showMessageCallBack;
		 
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
		
		
		jQuery.type( pageinfo );
		if(jQuery.type( pageinfo ) == 'object' && (!pageinfo.userid || pageinfo.userid == 'null'))
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
		if(callback)
		{
			callback();
		}
		
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
	
}
 function isValidEmailAddress(emailAddress) {
	var pattern = new RegExp(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/);
	return pattern.test(emailAddress);
};
function ajaxCallKioskSetup()
{

	
	var pageid = getPageID();
	
	if((!pageid || /^\s*$/.test(pageid)))
	{
		
		pageid = '';
	}
	var urlstring = "&name="+encodeURIComponent(storageGet('name'))+"&email="+encodeURIComponent(storageGet('email'))+"&phonenumber="+encodeURIComponent(storageGet('phonenumber'))+"&represents="+storageGet('represents')+"&kiosktype="+_kiosklicense+"&pageid="+pageid+"&kioskplatform="+encodeURIComponent(window.device.model)+"&kioskversion="+encodeURIComponent(_kioskversion);
	
	var urltocall = _baseURL + _kiosksetupURL + urlstring;
	
	// Assign handlers immediately after making the request,
	// and remember the jqxhr object for this request
	var jqxhr = $.post( urltocall);
}
function setupbyscreensize()
{

	width = $(document).width(); // returns width of HTML document
	
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
		
		
		
	}
}
$( window ).resize(function() {
setupbyscreensize();
});

setupbyscreensize();
/*
 
 Card reader stuff
 */
function activateCardReader()
{
    //onlyu call this if IOS for now
    
    if(isApple() && getAppleSafe())
    {
           //activate sdk and register notification callback
        unimag.activateSDK(function(type) {
            var d = {};
            var E = unimag.NotifEnum;
            d[E.Attach    ]='Attach'; //attached, but haven't connected
            d[E.Detach    ]='Detached'    ; //reader detached
            d[E.Connect   ]='Connected'   ; //reader connected, ready
            d[E.Disconnect]='Disconnected'; //when card reader is first removed
                
            if(d[type] =='Attach' )
            {
                 
                startTaskConnect();
            }
                           /*
           if(!(window.sessionStorage.getItem('already_initialSetup')))
           {
               initialSetup();
           }
                            */
                           
        });
        /*
        //this is dumb, but if the reader is not attached, the callback never gets fired.  So we need to move on
        setTimeout(function(){
                   if(!(window.sessionStorage.getItem('already_initialSetup')))
                   {
                   initialSetup();
                   }
                   
                   },500);
         */
    }
    
   
 
}

function startTaskConnect()
{
    
    unimag.startTaskConnect(function(task, taskNotif, info)
    {
        var E = unimag.TaskNotifEnum;
        switch(taskNotif)
        {
            case E.StartFailed:
            alert(task+' task failed to start: '+info.StartFailedReason);
            break;
            case E.Started:
            //alert('Connecting');
            break;
            case E.Stopped:
            //alert(null);
            if (!info.ok)
            {
                startTaskConnect();
            }
            else
            {
                startTaskSwipe();
            }
            break;
        }
    });
}
function startTaskSwipe()
{
    
    unimag.startTaskSwipe(function(task, taskNotif, info) {
        var E = unimag.TaskNotifEnum;
        switch(taskNotif)
        {
            case E.StartFailed:
                alert(task+' task failed to start: '+info.StartFailedReason);
            break;
            case E.Started:
            //alert('Waiting for Swipe');
            break;
            case E.Stopped:
                //alert(null);
                if(!info.ok)
                {
                    showMessage('Swipe failed please try again', '', " ", "OK");
                    startTaskSwipe();
                }
                else if (info.data)
                {
                    //alert('card swipe:');
                    //alert('raw: """\n'+info.data+'\n"""');
                    //alert('hex: """\n'  +getBase16 (info.data)+'\n"""');
                    //alert('ascii: """\n'+getStrRepr(info.data)+'\n"""');
                    sendCardData(info.data);
                    startTaskSwipe();

                }
            break;
        }
      });

}
function sendCardData(cardData)
{
    
    browserwindow.executeScript({code: "cardSwipeIdTeck('"+ getStrRepr(cardData)+"');"});
}

function parseData(data)
{
   
    cardData = new Object();
    //first get card number
    var start = false;
    var end = false;
    var cardNumber = '';
    for (var i=0; i < data.length; i++)
    {
        if(i > 1 && data.charAt(i -1) == "B" && data.charAt(i -2) == "%")
        {
            start = true;
        }
        if(data.charAt(i) == "^")
        {
            end = true;
        }
        
        if(start && !end)
        {
            cardNumber = cardNumber+data.charAt(i);
        }
        
        
    }
   
    firstfour = cardNumber.substring(0,4);
   
    lastfour = cardNumber.substring(cardNumber.length - 4, cardNumber.length);
     cardData.firstfour = firstfour;
     cardData.lastfour = lastfour;
     cardData.cardnumber = cardNumber;
    //get name
    start = false;
    end = false;
    var cardname = '';
    for (var i=0; i < data.length; i++)
    {
        if(start && data.charAt(i) == "^")
        {
            end = true;
        }
        if(i > 1 && data.charAt(i -1) == "^")
        {
            start = true;
        }
       
        
        if(start && !end)
        {
            cardname = cardname+data.charAt(i);
        }
        
        
    }
    cardData.cardname = cardname;
    start = false;
    end = false;
    var expdate = '';
    //find experatondate
    for (var i=0; i < data.length; i++)
    {
        if(i > 1 && data.charAt(i -1) == "=" )
        {
            start = true;
        }
        if(data.charAt(i-5) == "=")
        {
            end = true;
        }
        
        if(start && !end)
        {
            expdate = expdate+data.charAt(i);
        }
        
        
    }
    
    cardData.expdate = expdate;
    
    //get tracks
    start = true;
    end = false;
    var track1 = '';
    var track2 = '';
    //find experatondate
    for (var i=0; i < data.length; i++)
    {
        if(i > 1 && data.charAt(i) == ";" && !end )
        {
            end = true;
        }
        
        
        if(start && !end)
        {
            track1 = track1+data.charAt(i);
        }
        if(start && end)
        {
            track2 = track2+data.charAt(i);
            
            if(data.charAt(i) == "?")
                break;
        }
        
        
    }
    cardData.track1 = track1;
    cardData.track2 = track2;
    //add extras
    cardData.panlength = cardNumber.length;
    cardData.kssn = cardNumber;
    /*
    alert(firstfour);
    alert(lastfour);
    alert(cardname);
    alert(expdate);
    alert(cardData.track1);
    alert(cardData.track2);
    alert(cardData.panlength);
    alert(cardData.kssn);
    */
    //alert(data);
    return cardData;
    
}

//get base16 encoded string, given unsigned char (byte) array
function getBase16(array) {
    var ret = [], a = array;
    for (var i=0; i<a.length; i++) {
        var hex = a[i].toString(16);
        ret[i] = (hex.length==1?"0":"")+hex;
        if (i%4==3)
            ret[i] += " ";
    }
    return ret.join("");
}
//get ASCII string, with escape chars, from unsigned char (byte) array
function getStrRepr(array) {
    var ret = [], a = array;
    for (var i=0; i<a.length; i++) {
       
        if        (a[i] == '\t'.charCodeAt(0)) {
            ret[i] = "\\t";
        } else if (a[i] == '\n'.charCodeAt(0)) {
            ret[i] = "\\n";
        } else if (a[i] == '\r'.charCodeAt(0)) {
            ret[i] = "\\r";
        } else if (a[i] == '\\'.charCodeAt(0)) {
            ret[i] = "\\\\";
            //printable
        
        }
        
        else if (a[i] >= 0x20 && a[i] <= 0x7E) {
            ret[i] = String.fromCharCode(a[i]);
            //use \hex for all others
        } else {
            var hex = a[i].toString(16);
            ret[i] = "\\"+(hex.length==1?"0":"")+hex; // eg. 0xab => \ab instead of \xab
        }
    }
    return ret.join("");
}


/* -- end card reader--*/

/* ------ start secure kiosk -----*/
function secureKiosk()
{

	//first gather the data they entered
	//do some checking and validating	
	var pinstored = storageGet('pin');
	var oldpinentered = $('#securepin').val();
	var pin = $('#securepin').val();
	var confirmpin = $('#secureconfirmpin').val();
	var email = $('#email').val();
	var name = $('#name').val();	
	var phonenumber = $('#phonenumber').val();
	var represents = $('#represents').val();
	
	//start doing validation
	
	var message = '';
	if(isPinSet())
	{
		//change the redirect flow since they came here with 
		
		if(oldpinentered != pinstored)
		{
			message = message +"Incorrect Pin" + '\n';
		}
		
	}
	
	//make sure pin and confirm pin are the same
	if(!pin || pin != confirmpin)
	{
		message = message +" Pin and Confirm Pin must match." + '\n' ;
	}
	if(!(email)){
		message = message +" Email is required." + '\n' ;
	}
	if(!isValidEmailAddress(email)){
		message = message +" Email must be a valid email." + '\n' ;
	}
	
	if(message != '')
	{
		showMessage(message, '', " ", "OK");
	}
	else
	{
		//store this stuff locally
		storageSet(_storagePin, pin);
		storageSet('email', email);
		storageSet('name', name);
		storageSet('phonenumber', phonenumber);
		storageSet('represents', represents);
		
		ajaxCallKioskSetup();		
		
		//make sure we send them on the correct path.
		//if they have already set their search and this is an edit, then just send them to the edit screen
		if(isSearchSet())
		{
			showMessage("Your Pin changes have been saved.", '', " ", "OK");
			$(':mobile-pagecontainer').pagecontainer('change', '#indexpage', {
				transition: 'pop',
				changeHash: false,
				reverse: true,
				showLoadMsg: true
			});
		}
		else
		{
			showMessage("Your kiosk has been secured.  You can now search for the church, organization, or fundraiser you are setting your kiosk to.", '', " ", "OK");
			openSearchPage();
		
		}
		
	}
	
}
/* ------ end secure kiosk -----*/
/* ------ start unlock kiosk -----*/
function unlockKiosk()
{
	
	//get the pin they entered.  If it is correct, let them go to either search or settings (index) depending on success path
	var successPath = storageGet('securesuccesspath');
	
	var pintyped = $('#unlockpin').val();
	var pinstored = storageGet('pin');
	
	if(pintyped == pinstored)
	{
        //reset the screen to nothing
        $('#unlockpin').val('');
		//set the unlock state to unlocked so that our timer doesn't do a cancel
		storageSet('unlockkioskcurrentstate', 'unlocked');
		if(successPath == 'search')
		{
			showMessage("Your kiosk has been unlocked.  You can now search for the church, organization, or fundraiser you are setting your kiosk to.", '', " ", "OK");
			openSearchPage();
		}
		else
		{
			loadSettingsPage()
			/*
		
			$(':mobile-pagecontainer').pagecontainer('change', '#indexpage', {
				transition: 'pop',
				changeHash: false,
				reverse: false,
				showLoadMsg: true
			});
			*/
			//$.mobile.changePage('#indexkpage','slide');
			//browserwindow = window.open('index.html', '_self', 'location=yes');
		}
	}
	else
	{
		showMessage("Incorrect Pin, please try again.", '', " ", "OK");
		//alert("Sorry, but this is not the correct pin");
	}
	
}

function fogotPin()
{
	
	
	//forgot pin, send email
	//get the pin they entered in storage, and hit our server with the email
	//they have saved.  Then let them know we sent the pin.
	var pin = storageGet('pin');
	var email = storageGet('email');
	
	var urlstring = "&pin="+pin+"&email="+email;
	
	var urltocall = _baseURL + _forgotPinURL + urlstring;	
	var jqxhr = $.post( urltocall);
	showMessage("We have sent your pin to "+email, '', " ", "OK");
	//alert("We have sent your pin to "+email);

	

}
function cancelUnlockKioskIfStateIsCorrect()
{
    //see if the last time we opened the unlock screen was 5 seconds or not, otherwise it hits this multple times if they fail and reopen
    var curtime = $.now();
    setTime = storageGet('securecanceltime', $.now());
    if(curtime - setTime > 9900)
    {
        //check to see what the unlock state is to know if we need to redirect to the whatever the cancel button does.
        var unlockkioskcurrentstate = storageGet('unlockkioskcurrentstate');
        if(unlockkioskcurrentstate == 'unlocked')
        {
            return true; //basically do nothing because they already entered the correct pin
        }
        else
        {
            cancelUnlockKiosk();
        }
    }
    return true; //basically do nothing because it was an older timeout function calling this
}
function cancelUnlockKiosk()
{
    
    //reset the screen to nothing
    $('#unlockpin').val('');
	var securecancelpath = storageGet('securecancelpath');
	if(securecancelpath == 'index')
	{
		loadSettingsPage();
		/*
		$(':mobile-pagecontainer').pagecontainer('change', '#indexpage', {
			transition: 'pop',
			changeHash: false,
			reverse: true,
			showLoadMsg: true
		});
		*/
		//browserwindow = window.open('index.html', '_self', 'location=yes');
	}
	else
	{
        
		openDonationPage(storageGet('lastopendonationpageextras',''));
	}
}
/* ------ end unlock kiosk -----*/