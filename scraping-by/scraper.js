var async = require("async");
var cheerio = require("cheerio");
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
  var $ = cheerio(body);
  var links = $.find("a[href*='document.cfm']");
  console.log("Found document links: ", links.length);
  
  //process each link asynchronously
  async.each(links.toArray(), function(a, c) {
    //download the page
    var $a = cheerio(a);
    var page = url.resolve(searchURL, $a.attr("href"));
    console.log("Requesting page:", page);
    
    request(page, function(err, response, body) {
      var $page = cheerio(body);
      //find the hidden input
      var input = $page.find("input[name='src']");
      
      //if missing, exit early
      if (!input.length) return c();
      
      //get URL and download the file
      var download = url.resolve(domain, decodeURIComponent(cheerio(input).val()));
      var title = $a.html().replace(/\W/g, "").slice(0, 60) + "-" + Date.now();
      var output = fs.createWriteStream("downloads/" + title + ".pdf")
      console.log("Downloading file: ", download);
      var r = request(download, c).pipe(output);
    });
  }, function() {
    //when all links are done...
    console.log("All done!");
  });
});
