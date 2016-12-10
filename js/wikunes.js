$(document).ready(function()
{
	//By default the (searching..) spinner-icon is hidden
	$(".fa-spinner").hide();
	
	//Initiate a sample result and populate the #results section..
	$("#txtQuery").val("Book of Optics");
	requestResults("Book_of_Optics");
	
	//Listen for the keyUp event(key pressed then released)
	$("#txtQuery").keyup(function(e)
	{
		//if the pressed key is ENTER
		if(e.keyCode==13)
		{
			var searchKey=$("#txtQuery").val();
			requestResults(searchKey);
		}
	});	
});

var appendStyledResult= function(resultData)
{
	// Each result element will have an "result-n" HTML id (#result-1, #result-2, etc.)
	var divId="result-"+resultData.id;
	
	//Check Bootstrap's Media component for more information
	var resultHTMLTemplate=
	'<div class="row">'
	+'<div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3 ">'
	+'<div id="'+divId+'"class="media">'
	+'<a class="media-left media-middle" href="#" target="_blank">'
	+'<img class="media-object" src="" alt="Wikipedia image!">'
	+'</a>'
	+'<div class="media-body">'
	+'<h4 class="media-heading"></h4>'
	+'<p></p>'
	+'</div>'
	+'</div>'
	+'</div>'
	+'</div>';
	
	//Append an empty "template"
	$("#results").append(resultHTMLTemplate);
	
	// Set the different elements of the result div
	$("#"+divId+" a").attr("href",resultData.linkHref);
	$("#"+divId+" img").attr("src",resultData.imgSrc);
	$("#"+divId+" h4").text(resultData.titleText);
	$("#"+divId+" p").text(resultData.descText);
};

// Make an AJAX call to Wikipedia API to get data of a single article then render them.
var fetchSingleResult=function(wikiData,i)
{
	var resultData={};
	// id: a key ordering field
	resultData.id=i+1; 
	
	// linkHref: A Hyperlink to the wikipedia article
	resultData.linkHref=wikiData[3][i]; 
	
	// titleText: The title of the wikipedia article
	resultData.titleText=wikiData[1][i]; 
	
	// descText: A short description of the wikipedia article
	resultData.descText=wikiData[2][i];
	
	// We will grab suitable images by requesting wikipedia API calls on each returned article (result)
	$.ajax(
	{
		// To bypass CORS errors.
		dataType: "jsonp",
		
		// A Wikipedia/API call for a single article defined by its title.
		url: "https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&page="+ resultData.titleText, 
		
		// Use the HTTP GET method.
		type: "GET",
		
		// Called when the data is completely received successfully
		success: function(pageHtml)
		{
			//See wikipedia's API documentation for more information about the response format
			var htmlData=pageHtml['parse']['text']['*'];    
			
			//Get src attributes of all images that exist in the article.
			var images = $(htmlData).find('img').map(function() { return this.src; }).get();
			console.log(htmlData);
			//If there is at least one image in the list, choose the first as a representative one
			if(typeof images[0]!=='undefined' && images[0]!==null)
			{	
				//We replace the "npx" in the URI by a "100px" to get a good resolution, then set it to imgSrc
				resultData.imgSrc=images[0].replace(/\d+px/,"100px");	
			}
			else
			{
				// If no Image has been found, a default Wikipedia logo will be set instead
				resultData.imgSrc="http://icons.iconarchive.com/icons/danleech/simple/512/wikipedia-icon.png";
			}
			// Render the resultData;
			appendStyledResult(resultData);
		}
		
	});
};	
var requestResults=function(searchKey)
{
	//Clear the previous search result
	$("#results").empty();
	
	//Show the (searching..) spinner-icon as we'll start AJAX resuests.
	$(".fa-spinner").show();
	
	$.ajax(
	{	
		// To resolve CORS bugs
		dataType: "jsonp", 
		
		// A Wikipedia/API call to get a list of articles based on a search key
		url: "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search="+ searchKey, 
		
		//Use the HTTP GET method
		type: "GET",
		
		// Called when the whole data is received successfully.
		success: function(wikiData)
		{
			
			//Number of returned results
			var numResults=wikiData[1].length;
			
			//Create the resultData Object and set its default value to error fields.
			var resultData={
				// id: a key ordering field (only one field in here)
				id:1,
				
				// linkHref: A Hyperlink to the wikipedia article (dead link here)
				linkHref:"#",
				
				// imgSrc: the URI of the image related to the wikipedia article (Wikipedia logo here) 
				imgSrc:"http://icons.iconarchive.com/icons/danleech/simple/512/wikipedia-icon.png",
				
				// titleText: The title of the wikipedia article (Sorry message here)
				titleText:"Sorry, no search results!",
				
				// descText: A short description of the wikipedia article (Error description message)
				descText:"The search on the Wikipedia encyclopedia returned no results. Please try with different terms."
			};
			
			// If no results,return the error resultData and exit the AJAX call
			if (numResults === 0)
			{	
				// Render the resultData;
				appendStyledResult(resultData); 
			}
			//If we are here, then the number of results is not zero.
			else
			{
				// Loop through the returned data
				for(var i=0;i<numResults;i++)
				{
					// Get data of a single article then render them.
					fetchSingleResult(wikiData,i);
				}
			}
			// All the job is done, so please stop spinning!
			$(".fa-spinner").hide();
		}	
	});
};