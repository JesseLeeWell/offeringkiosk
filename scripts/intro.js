document.addEventListener("deviceready", onDeviceReady, false);
//this is for testing on a browser, make sure it is removed 
$( document ).ready(function() {
	onDeviceReady();		
			 
});
function onDeviceReady() { 
	setupbyscreensize();
	/*
	$(function () {
    $('.tlt').textillate({ in: { effect: 'fadeInDownBig'} });
		
	})
	*/
	
	
	setTimeout(function() {
		 $( ".fadein1" ).fadeIn( "slow", function() {
				 
			}).css("display","inline-block");// Do something after 5 seconds
			$('html,body').animate({scrollTop: $("#"+'scrolltofadein1').offset().top},'slow');
	}, 2000);
	setTimeout(function() {
		  $( ".fadein2" ).fadeIn( "slow", function() {
				 
			}).css("display","inline-block"); 
			$('html,body').animate({scrollTop: $("#"+'scrolltofadein2').offset().top},'slow');// Do something after 5 seconds
	}, 4000);
	setTimeout(function() {
		  $( ".fadein3" ).fadeIn( "slow" ).css("display","inline-block"); 
		   $('html,body').animate({scrollTop: $("#"+'scrolltofadein3').offset().top},'slow');
	}, 6000);
	setTimeout(function() {
		  $( ".fadein4" ).fadeIn( "slow" ).css("display","inline-block");
		   $('html,body').animate({scrollTop: $("#"+'scrolltofadein4').offset().top},'slow');
	}, 8000);
	setTimeout(function() {
		  $( ".fadein5" ).fadeIn( "slow" ).css("display","block");
		  $('html,body').animate({scrollTop: $("#"+'scrolltofadein5').offset().top},'slow');
	}, 13000);
	setTimeout(function() {
		  $( "#swipeformore" ).fadeIn( "slow" ).css("display","block");
		  $('html,body').animate({scrollTop: $("#"+'swipeformore').offset().top},'slow');
	}, 14000);
	 
			

}

function fadeInFunction()
{
	alert("Hi");
}
//$('.tlt').textillate({ in: { effect: 'rollIn' } });

$(document).on('pageinit', function(event){
	$('div.ui-page').unbind();
  $('div.ui-page').on("swipeleft", function () { 
    var nextpage = $(this).next('div[data-role="page"]');
      if (nextpage.length > 0) {
       // $.mobile.changePage(nextpage, "slide", false, true);
	  event.stopImmediatePropagation();
		$(':mobile-pagecontainer').pagecontainer('change', nextpage, {
			transition: 'slidefade',
			changeHash: false,
			reverse: false,
			showLoadMsg: true
		});
		return false;
      }
  });

  $('div.ui-page').on("swiperight", function () { 
	
    var prevpage = $(this).prev('div[data-role="page"]');
    if (prevpage.length > 0) {
     // $.mobile.changePage(prevpage, { transition: "slide", reverse: true }, true, true);
	 event.stopImmediatePropagation();
	  $(':mobile-pagecontainer').pagecontainer('change', prevpage, {
			transition: 'slidefade',
			changeHash: false,
			reverse: true,
			showLoadMsg: true
		});
		return false;
    }
  });
  

 
});

function closeIntro()
{
	//loadSettingsPage();
	appwindow = window.open('index.html', '_self', 'location=yes');

}
function closeIntroPerminataly()
{
	//storageSet('hideintro', 'true');
	window.localStorage.setItem('hideintro', 'true');
	//loadSettingsPage();
	appwindow = window.open('index.html', '_self', 'location=yes');
}

function setupbyscreensize()
{

	width = $(document).width(); // returns width of HTML document
	//alert(width);
	if(width < 720)
	{
		$('.mobile_hide').css('display','none');
		 $('#pagebody').addClass('smallScreen');	
		 $('#largeScreenIntroPage1').hide();
		 $('#smallScreenIntroPage1').show();
	}
	else
	{
		$('.mobile_hide').css('display','block');
		$('#pagebody').removeClass('smallScreen');
		$('#smallScreenIntroPage1').hide();
		$('#largeScreenIntroPage1').show();
		
		//$('#donation_prompt_div').addClass('inline_block');
		
	}
}
$( window ).resize(function() {
setupbyscreensize();
});

setupbyscreensize();
