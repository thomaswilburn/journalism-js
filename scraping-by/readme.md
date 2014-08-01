Scraping By
===========

Introduction
------------

Downloading webpages may seem unglamorous, but when faced with an uncooperative "open" data source - such as a government site that hides its documents behind redirects and forms - being able to programmatically scrape a website for data can be a serious time-saver. Sure, it takes a little time to write the scraper itself, but that's far easier (and more interesting) than clicking on hundreds of links manually. Plus, if you ever need that information again, the hard work is done already.

Given its rich support for handling many I/O operations simultaneously, and its library support for handling common network tasks, Node makes a great web scraper. Today we'll write a script to process a search page and download all the listed PDF files, even though they're hidden behind a form. 

In This Tutorial
----------------

* scraper.js - our NodeJS script

Crossing That Bridge
--------------------

Here's the scenario for our page scraping, based on an actual script I wrote for the Seattle Times: we want to download all the files the NTSB has filed for the Skagit River bridge collapse. Unfortunately, the links are hidden to force people to download them manually, which we would like to avoid (there's roughly 140 of them). In fact, the site is structured as follows:

1. The table of contents contains a list of links to various permutations on `document.cfm`, each of which is a page with metadata about the actual file we want
2. There's no link to the file on the document pages. Instead, there's a hidden input named "src" that contains the file's ID as a URI-encoded path.
3. When the form is submitted, we get redirected to the file. Luckily, it turns out that the URI-encoded ID is just a path from the root of the website - if we decode it and request that URL, we'll get the actual PDF file.

As scraping goes, this is frustrating because the information is hidden in forms instead of semantic link tags, but it's not that hard. Downloading each PDF in the table of contents will require three stages of HTTP requests:

1. Request the table of contents, and find all the document pages
2. Request each document page, look for the hidden input, and decode the file URL from it.
3. Request the actual file and save it to disk.


Finally, Some Code
------------------

After you've run `npm install` to get the dependencies from `package.json` and install them for this script, you should see the following installed libraries:

* `async` - A utility for performing asynchronous operations, such as collection processing
* `jsdom` - Wraps up an HTML parser with a browser-like interface
* `request` - Easily makes HTTP requests, including following redirects

We'll also be using the `url`, `path`, and `fs` modules that come with Node. Let's get our dependencies registered, and also set up some URLs strings we'll need later (found by inspecting the source of a few sample ages):

```js
var async = require("async");
var jsdom = require("jsdom");
var request = require("request");

var fs = require("fs");
var path = require("path");
var url = require("url");

//base domain
var domain = "http://dms.ntsb.gov/";
//all searches
var searchURL = domain + "pubdms/search/";
//table of contents
var tocURL = searchURL + "hitlist.cfm?docketID=55219&CurrentPage=1&EndRow=200&StartRow=0&order=1&sort=0&TXTSEARCHT=";
```

Next we're going to make sure there's a directory to hold our downloaded files. Since this is a small, simple operation, we'll use Node's synchronous file system operations for it.

```js
if (!fs.existsSync("downloads")) fs.mkdirSync("downloads");
```

Everything else in our script is asynchronous, meaning that it requires us to pass in a callback function that gets the results when the operation completes. We start by downloading the table of contents with the `request` library, and feeding the body text into jsdom's `html()` function, which returns a "document" with all the familiar DOM methods. It's complete enough that you can even use jQuery to search it, but we're just going to rely on the `querySelectorAll` method instead.

```js
request(tocURL, function(err, response, body) {
  //create a document and look for links to "document.cfm"
  var document = jsdom.html(body);
  var links = document.querySelectorAll("a[href*='document.cfm']");
  console.log("Found document links: ", links.length);
});
```

Once we've got our links, we'll process them using the `async` library's `each()` function, which takes three arguments: an array or object, a iterator function to be called for each array item, and an optional callback that will be executed when all the items have been processed. The iterator is passed two values: an array item, and a callback to let `async` know its work is done. This is a typical Node pattern: the first argument of a callback is an optional error flag, and the last is always a callback to signal completion.

```js
async.each(links, function(a, c) {
    //download the page
    var page = url.resolve(searchURL, a.getAttribute("href"));
    console.log("Requesting page:", page);
    //signal completion for this link
    c();
    });
  }, function() {
    //when all links are done...
    console.log("All done!");
  });
```

With the document page downloaded, we can find the hidden input containing the actual file path, decode it, and then download the file itself. This code replaces the call to `c()` in the code above:

```js
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
  //download the file, calling c() when done
  var r = request(download, c).pipe(output);
});
```

That penultimate line is interesting, because it uses Node's "pipes" to route the download directly to a file on disk. We still pass our async callback function, `c`, to the `request` function as a second parameter - once the download completes, it'll be called to tell the `async.each()` function we're done with that particular item from `links`.

All together, our code looks like this now:

```js
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
```

Run this code with `node scraper`, and you should see it work its way through the page list, download the hidden PDF files, and store them in the `downloads/` folder. Piece of cake! All told, we needed a little less than 50 lines of code to grab those files, which can easily be adapted for our next scraping task as well.

Conclusion
----------

Compared to a language like Python, where HTTP requests and other I/O operations "pause" the script, Node's asynchronous operations are slightly more complicated, but they're also faster: since we don't have to wait for each request to finish before starting the next, our code processes each link as fast as the network can return results. Most of our time during these kinds of scripts is spent waiting on the response from the remote server, but in Node we can make our requests in parallel instead of serial. It's the difference between having one person perform many tasks one after another, versus having many people take on individual tasks simultaneously.

Newcomers to Node are often confused by the way that asynchronous operations are handled, since it means the order of your code isn't simply "top to bottom" anymore. However, as we see above, libraries like `async` and `request` can make it a series of asynchronous tasks much more readable. Once you get used to the Node way of writing code, it's surprisingly usable: web scraping is only the start of what we can do.