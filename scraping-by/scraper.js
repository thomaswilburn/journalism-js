var async = require("async");
var jsdom = require("jsdom");
var request = require("request");

var fs = require("fs");
var url = require("url");

var domain = "http://dms.ntsb.gov/";
var searchURL = domain + "pubdms/search/";
var tocURL = searchURL + "hitlist.cfm?docketID=55219&CurrentPage=1&EndRow=200&StartRow=0&order=1&sort=0&TXTSEARCHT=";

if (!fs.existsSync("downloads")) fs.mkdirSync("downloads");

//start with the table of contents
console.log("Requesting table of contents");
request(tocURL, function(err, response, body) {
  //create a document and look for links to "document.cfm"
  var document = jsdom.html(body);
  var links = document.querySelectorAll("a[href*='document.cfm']");
  console.log("Found document links: ", links.length);
  
  //process each link asynchronously
  async.each(links, function(a, c) {
    //download the page
    var page = url.resolve(searchURL, a.getAttribute("href"));
    console.log("Requesting page:", page);
    
    request(page, function(err, response, body) {
      var document = jsdom.html(body);
      //find the hidden input
      var input = document.querySelector("input[name='src']");
      
      //if missing, exit early
      if (!input) return c();
      
      //get URL and download the file
      var download = url.resolve(domain, decodeURIComponent(input.value));
      var title = a.innerHTML.replace(/\W/g, "");
      var output = fs.createWriteStream("downloads/" + title + ".pdf")
      console.log("Downloading file: ", download);
      var r = request(download, c).pipe(output);
    });
  }, function() {
    //when all links are done...
    console.log("All done!");
  });
});
