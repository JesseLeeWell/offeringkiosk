
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
		var urlstring = "&name="+name+"&email="+email+"&phonenumber="+phonenumber+"&represents="+represents;
		
		var urltocall = _baseURL + _kiosksetupURL + urlstring;
		//store this stuff locally
		storageSet(_storagePin, pin);
		storageSet('email', email);
		storageSet('name', name);
		storageSet('phonenumber', phonenumber);
		storageSet('represents', represents);
		
		// Assign handlers immediately after making the request,
		// and remember the jqxhr object for this request
		var jqxhr = $.post( urltocall);
		
		
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