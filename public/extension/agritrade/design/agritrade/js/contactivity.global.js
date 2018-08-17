/**
 * Created by Contactivity, www.contactivity.com
 *
 * Global Javascript functions, like document.ready functions and binding links.
 * @project Agritrade website, redesign 2011
 *
 * @author Terry Duivesteijn <terry@contactivity.com>
 * @copyright Copyright (c) 2011, Contactivity bv, Leiden
 * @license http://opensource.org/licenses/gpl-3.0.html GNU General Public License, version 3 (GPLv3)
 * @version $Id: contactivity.global.js,v 1.0 2011-02-03 18:38
 */


var searchInProgress = false;
var searchWaiting = false;
var baseRssUrl = '';

var delay;

$(document).ready(function(){

	$(document).pngFix();

	$(".box-person").hover(function(){
		var nodeid = $(this).attr('id');
		clearTimeout(delay);
		$(".overlay").hide();
		$(".overlay."+nodeid).show();
	},
	function() {
		log(" start delayed hide ");
		delay = window.setTimeout("hideOverlay()",1500);
	});
	
	$(".ytThumb").hover(function(){
		log("hovering");
		var nodeid = $(this).attr('id');
		clearTimeout(delay);
		$(".overlay").hide();
		$(".overlay."+nodeid).show();
	},
	function() {
		log(" start delayed hide ");
		delay = window.setTimeout("hideOverlay()",1500);
	});

	$(".overlay").hover(function() {
		clearTimeout(delay);
	},
	function() {
		hideOverlay();
	});

	binds();

});



/**
 *
 * @access public
 * @return void
 **/
function hideOverlay(){
	log(" hide overlays ");
	$(".overlay").fadeOut("slow");
}

/*
 * Container for click actions
 * @author Terry Duivesteijn <terry@duivesteijn.com>
 */
function action(){
	if($(this).hasClass('fontsize')) {
		// Change Fontsize
		fontSize(this);

	}

}

/*
 * Container check all
 * @author Stephan Csorba <stephan@contactivity.com>
 */
function checkAll(theForm, cName, status) {
	for (i=0,n=theForm.elements.length;i<n;i++)
		if (theForm.elements[i].className.indexOf(cName) !=-1)
		{
			theForm.elements[i].checked = status;
		}
}

/**
 * Binds elements to a function.
 * @author Terry Duivesteijn <terry@contactivity.com>
 * @category onload
 * @return void
 **/
function binds(){

	/**
	 * deal with placeholders
	 */
	$("input").bind('focus blur',placeholder);
	$("input.set_password_user").bind('focus click',PassLabelHideOnInput);
	$("input.set_password").bind('focus click',PassLabelHide);
	$("input[type=text]").each(function() {
		if($(this).attr("value") == '') {
			$(this).attr("value",$(this).attr("placeholder"));
		}
	});

	/**
	 * Region map
	 */
	$("a.switch_map").bind('mouseover ',switchMap);
	$("#RegionsMap area").bind('mouseover ',switchMap);

	/**
	 * font size adjustment
	 */
	$(".fontBox").show(); // was hidden in case of no JS available
	$("a.fontsize").bind('click',fontSize);
	if($.cookie("fontSize")) {
		setFontSize($.cookie("fontSize"));
	}

	if($.cookie("sitemap")) {
		sitemapFold($.cookie("sitemap"));
	}

	$("footer a.sitemap_toggle").click(function(e){
		e.preventDefault();
		sitemapEvent('smooth');
	});

	$(".block.filter a.heading").click(function(e){
		e.preventDefault();
		if($(this).hasClass("close"))
		{
			$(this).removeClass("close");
			$(this).next("div.section").slideDown().removeClass('closed');
		}
		else
		{
			$(this).addClass("close");
			$(this).next("div.section").slideUp().addClass('closed');
		}

		return false;
	});

	var maxDate=new Date();
	maxDate.setDate(maxDate.getDate()+5);
	var currentDate=new Date();

	$("input[type=date]").dateinput({
		format: 'dd-mm-yyyy',
		firstDay: 1,
		min: '2001-09-30',
		max: maxDate
	});

	$("a[rel^='prettyPhoto']").prettyPhoto({
		default_width: 750,
		default_height: 452
	});


	$("#eyecatcher .slider").easySlider({
		auto: true,
		continuous: true,
		numeric: true,
		hoverPause: false,
		pause: 7000,
		timeoutdelay: 0,
		speed: 1000,
 		fader: 			false
	});

	$("input[name='sortby']").live('change',function() {
		$("#searchfilter_sort").attr('value', $("input[name='sortby']:checked").val());
		updateCheckboxes();
	});

	$('section header .dynamicBrowse').live('click',function(e) {
		e.preventDefault();
		window.location.hash="#page="+$(this).attr('rel');
	});


	$('.style_me').addClass('styled').addClass('unchecked').removeClass('style_me');

	$('#searchform label.styled').click(function(){
		if($(this).find('input:checked').length>0) {
			$(this).addClass('checked').removeClass('unchecked');
		} else{
			$(this).removeClass('checked').addClass('unchecked');
		}
		updateCheckboxes();
	});

	$('#searchform input[name="filter[search]"]').change(function() {
		updateCheckboxes();
	});

	updateCheckboxes(false);

	$("form#editprofile a.submit").click(function(e) {
		e.preventDefault();
		$("form#editprofile").submit();
	});

	checkForHashChange();
}

/*
 *
 * @author Terry Duivesteijn <terry@duivesteijn.com>
 */
function checkForHashChange(){
	var prevHash = '';
	var lang = $("#language").val();
	if(window.location.hash.indexOf('#page=')!=-1) {
		updateDiv('/'+lang+'/Resources/Search-Results'+window.location.hash.substr(6));
	}
	if (("onhashchange" in window) && !($.browser.msie)) {
		$(window).bind( 'hashchange',function(e) {
			if (window.location.hash != prevHash) {
				prevHash = window.location.hash;
				if(window.location.hash.indexOf('#page=')!=-1) {
					updateDiv('/'+lang+'/Resources/Search-Results'+window.location.hash.substr(6));
				}
			}
		});
	} else {
		window.setInterval(function () {
			if (window.location.hash != prevHash) {
				prevHash = window.location.hash;
				if(window.location.hash.indexOf('#page=')!=-1) {
					updateDiv('/'+lang+'/Resources/Search-Results'+window.location.hash.substr(6));
				}
			}
		}, 100);
    }
}

function updateCheckboxes(changeHash){
	var currentFilter = '';
	var spacer = '';
	var filterFrom = $("#filterfrom").val();
	var filterTo = $("#filterto").val();
	var filterSort = $("#searchfilter_sort").val();
	var filterNode = $("#nodeid").val();
	var filterSearch = $("input[name='filter[search]']:checked").val();
	var rssUrl = '/(from)/' + filterFrom + '/(until)/' + filterTo + '/(sortby)/' + filterSort + '/(search)/' + filterSearch + '/(nodeid)/' + filterNode;

  	$('#searchform .styled').each(function() {
		if($(this).find('input:checked').length>0) {
			var theVal = $(this).find('input:checked').val();
			var theFilter = $(this).parent().attr('id').replace("filter_", "");
			if(theFilter != currentFilter){
				currentFilter = theFilter;
				spacer = '';
				rssUrl  = rssUrl +  '/(' + currentFilter + ')/';
			}
			else{
				spacer = '-';
			}
			//alert(theVal);
			rssUrl = rssUrl +  spacer + theVal;
			$(this).addClass('checked').removeClass('unchecked');
		}

		// search against the hash
		var theVal = $(this).find('input').val();
		var theMatch = '/' + theVal + '/';
		if ($(changeHash).text().match(theMatch)){
			$(this).addClass('checked').removeClass('unchecked');
		}
	});



	if(changeHash!==false) {
		window.location.hash="#page="+rssUrl;
	}

	if(baseRssUrl == ''){
		baseRssUrl = $('#rss_feed').attr('href');
	}
	$('#rss_feed').attr('href', baseRssUrl + rssUrl);

}


/*
 * Sitemap toggling
 * @author Terry Duivesteijn <terry@duivesteijn.com>
 */
function sitemapEvent(effect) {
	if($("footer a.sitemap_toggle").hasClass("closed")) {
		sitemapFold('open',effect);
	} else {
		sitemapFold('closed',effect);
	}
}

/*
 * Sitemap closing and opening
 * @author Terry Duivesteijn <terry@duivesteijn.com>
 */
function sitemapFold(type,effect){
	if(type == 'open') {
		$.cookie('sitemap','open', { path: '/' });
		$("footer a.sitemap_toggle").removeClass("closed");

		if(effect=='smooth') {
			$("footer nav").slideDown();
		} else {
			$("footer nav").show();
		}

	} else {
		$.cookie('sitemap','closed', { path: '/' });
		if(effect=='smooth') {
			$("footer nav").slideUp(function(){
				$("footer a.sitemap_toggle").addClass("closed");
			});
		} else {
			$("footer nav").hide(function(){
				$("footer a.sitemap_toggle").addClass("closed");
			});
		}

	}
	return false;
}

/*
 * Switches input from text to password
 * @author Terry Duivesteijn <terry@duivesteijn.com>
 */
function PassLabelHideOnInput(){
	$(this).removeClass('set_password_user');
	$("input.set_password").attr('autocomplete','on').prev().hide();
}
function PassLabelHide(){
	$(this).removeClass('set_password').attr('autocomplete','on').prev().hide();
}

/**
 * Delete default value when focussed on input. Restore value on blur.
 * @html5 Fallback for HTML5-placeholder
 * @author Terry Duivesteijn <terry@contactivity.com>
 * @category functionality
 * @return void
 **/
function placeholder(event){
	if(event.type == 'focus') {
		if($(this).attr('value') == $(this).attr('placeholder')) {
			$(this).attr('value','');
		}
	} else if(event.type == 'blur') {
		if($(this).attr('value') == '') {
			$(this).attr('value',$(this).attr('placeholder'));
		}
	}
}

/**
 * Check for available attribute (HTML5)
 * it's recommended to use Modernizr instead
 * e.g. if (!Modernizr.input.placeholder){
 * @author Terry Duivesteijn <terry@contactivity.com>
 * @category core
 * @return bool
 **/
function available(attribute, element){
	if ((attribute in document.createElement(element))) {
		return true;
	}
	return false;
}

/**
 * Enable debuggin in Firebug for example.
 * @author Terry Duivesteijn <terry@contactivity.com>
 * @category core
 */
function log() {
	if (window.console && window.console.log)
		window.console.log('debug: ' + Array.prototype.join.call(arguments,' '));
}

/**
 * Email friends
 * @author Stephan Csorba <stephan@contactivity.com>
 **/
function popitup(url) {
	var width  = 500;
	var height = 600;
	var left   = (screen.width  - width)/2;
	var top    = (screen.height - height)/2;
	var params = 'width='+width+', height='+height;
	params += ', top='+top+', left='+left;
	params += ', directories=no';
	params += ', location=no';
	params += ', menubar=no';
	params += ', resizable=no';
	params += ', scrollbars=no';
	params += ', status=no';
	params += ', toolbar=no';
	newwin=window.open(url,'windowname5', params);
	if (window.focus) {newwin.focus()}
	return false;
}

/**
 * Regions map switching
 * @author Terry Duivesteijn <terry@duivesteijn.com>
 */

function switchMap(e){
	e.preventDefault();
	$("#regions_map ul.maps li").removeClass('show');
	$("#regions_map ul.maps li."+$(this).attr('rel')).addClass('show');
}

/*
 * Set Font size
 * @author Terry Duivesteijn <terry@duivesteijn.com>
 */
function fontSize(){
	setFontSize($(this).attr('rel'));
}
/*
 * Change font-size for accessibility
 * @author Terry Duivesteijn <terry@duivesteijn.com>
 */
function setFontSize(size){
	var proceed=false;
	if(size == 'small') {
		$("body").css({fontSize: '12px'});
		proceed=true;
	} else if(size == 'medium') {
		$("body").css({fontSize: '14px'});
		proceed=true;
	} else if(size == 'big') {
		$("body").css({fontSize: '16px'});
		proceed=true;
	}

	if(proceed==true) {
		$('a.fontsize').parent().removeClass('active');
		$('a.fontsize[rel='+size+']').parent().addClass('active');
		$.cookie('fontSize',size, { path: '/' });
	}
}

/*
 * Print the page
 * @author David Ennis
 */
function printMe(url) {
	var width = Math.round(770);
	var height = Math.round(screen.availHeight - 40);
	var left = (screen.width - width) / 2;
	var top = 10;
	var params = 'width=' + width + ', height=' + height;
	params += ', top=' + top + ', left=' + left;
	params += ', directories=no';
	params += ', location=no';
	params += ', menubar=no';
	params += ', resizable=no';
	params += ', scrollbars=yes';
	params += ', status=no';
	params += ', toolbar=yes';
	newwin = window.open(url, 'windowname5', params);
	newwin.focus();
	//newwin.print();
	//newwin.close();
	return true;
}

var searchformControl;
var searchformControl2;


function handleSearchFormSubmit(){

	/*
	if ($('#searchresults').length>0) {
		if(searchformControl){
			searchformControl.abort();
      }

		$('#searchresults').addClass('invisible');
		$('.searchindicator').addClass('throbber');
		searchformControl = $.ajax({ // create an AJAX call...
				data: $("#searchform").serialize(), // get the form data
				type: $("#searchform").attr('method'), // GET or POST
				url: $("#searchform").attr('action') +'?include=true', // the file to cal
				success: function(response) {
					searchInProgress = false;
					writeDiv(response);
				}
			});
	}
	*/


	// smoethingspecialfor the sidebar
	if ($('#relatedcontentblock').length>0) {
		if(searchformControl2){
			searchformControl2.abort();
		}

		var rightside = $('#relatedcontentblock').find('div').first();

		//$(rightside).addClass('invisible');
		//$('.searchindicator').addClass('throbber');
		searchformControl2 = $.ajax({ // create an AJAX call...
				data: $("#searchform").serialize(), // get the form data
				type: $("#searchform").attr('method'), // GET or POST
				url: $("#searchform").attr('action'), // the file to cal
				success: function(response) {
					searchInProgress = false;
					rightside.html(response);
				}
			});
	}





}

/*
 * Compatibility for html5
 * @author Terry Duivesteijn <terry@duivesteijn.com>
 */
function writeDiv(result){
	var sect = "<section><article>"+result+"</article></section>";
	$('#searchresults').html(
		$(innerShiv(
			sect,
			false
		))
	);

	throbberoff();
	$('#searchresults').removeClass('invisible');
}
function throbberoff(){
	$('.searchindicator').removeClass('throbber');
}

function updateDiv(url){
	$('#searchresults').addClass('invisible');
	$('.searchindicator').addClass('throbber');

	/*
	$.get(url,{},function(result) {
		writeDiv(result);
	});
	*/

	if(searchformControl){
		searchformControl.abort();
	}
	searchformControl = $.ajax({
			url: url,
			success: function(response) {
				writeDiv(response);
			}
	});

}

/*** DHTML MENU'S ***/

var dmTimeOut='';
var oActiveMenu='';


function dOpen(menuId) { // (c)SpuyMore v1.0
  oActiveMenu=menuId;
  if((obj=MM_findObj(menuId).style).display!='block'){
  	obj.display='block';
  	obj.zIndex='1000';
  }
  dCloseNow();
}

function dClose() { // (c)SpuyMore v1.0
  dmTimeOut=setTimeout('dCloseNow()',300);
}

function dCloseNow() { // (c)SpuyMore v1.0
  clearTimeout(dmTimeOut);
  var i=0;
  while(o=MM_findObj(m="hmenu"+i)){ // close horizontal menu's, if not active
    if(oActiveMenu!=m){
    	o.style.display='none';
 	  	o.style.zIndex='300';
 	  }
    i++;
  };
  var i=0;
  while(o=MM_findObj(m="vmenu"+i)){ // close vertical menu's, if not active
    if(oActiveMenu!=m){
    	o.style.display='none';
 	  	o.style.zIndex='300';
 	  }
    i++;
  };
  oActiveMenu='';
}


var swapmem=new Array();
function swapElement(id,context,defid) {
if (!context) context="default";
if (!swapmem[context] && defid) {
	swapmem[context] = defid;
}
if (swapmem[context] && document.getElementById(swapmem[context])) {
	document.getElementById(swapmem[context]).style.display="none";
}
if (swapmem[context]!=id) {
	if (id && document.getElementById(id)) {
		document.getElementById(id).style.display="block";
		swapmem[context]=id;
	}
} else {
	swapmem[context]=null;
}
}

/**
 *
 * @access public
 * @return void
 **/
function initialize(){
	void(0);
}

/**
 *
 * @access public
 * @return void
 **/
function switchBox(obj,hide){
	$("div"+hide).hide();
	$("li"+hide).removeClass('active');

	$("#"+$(obj).attr("rel")).show();
	$("."+$(obj).attr("rel")).addClass('active');
}

/*
 * Open the loginbox
 * @author Terry Duivesteijn <terry@duivesteijn.com>
 */
function loginBox(){
	jQuery('#login-box-popup').toggle();
}
