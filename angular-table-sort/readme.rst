Angular Table Sort
==================

Introduction
------------

For journalists, Angular is a fantastic resource: it lets us create
reactive documents, which update live based on the backing data. By
altering that data (or, better yet, giving users UI for altering it
themselves), the document will automatically adjust itself to match.
There's probably no better demonstration of this simple but powerful
binding than a sortable table. We'll also use this opportunity to
explore Angular directives--a method for defining custom attributes and
elements.

In This Tutorial
----------------

-  index.html - The page and template for the application
-  sortable.js - JavaScript app logic

App Organization
----------------

Angular apps are organized around *modules*, to which we attach the
various parts of the app. So to start, in our ``sortable.js`` file,
we'll set up a module for our application:

.. code:: js

    var app = angular.module("sortableDemo", []);

When Angular loads on our page, it'll bootstrap our application into a
DOM element based on an ``ng-app`` attribute. In ``index.html``, we set
up a ``section`` tag to host our app:

.. code:: html

    <section ng-app="sortableDemo">

By itself, our app doesn't do much. We need to create a controller now,
which links data on the JavaScript side to HTML elements via our
template. Our controller starts pretty simple: we'll create some dummy
data and attach it to the controller's ``$scope`` variable, which makes
it available to the template.

.. code:: js

    app.controller("tableController", ["$scope", function($scope) {
      
      //set up some demo data for this to use
      var table = [
        { name: "Alice", age: 33, title: "Editor" },
        { name: "Bob", age: 44, title: "Reporter" },
        { name: "Chuck", age: 23, title: "Intern" }
      ];
      //assign that data to the controller scope
      $scope.table = table;
      
    }]);

Unlike other frameworks like Ractive, Angular doesn't require us to
write and load separate templates. Instead, we just write HTML into the
page the way we want it to render. Special ``ng-`` attributes control
how it's interpreted. For example, in this page, we'll create a table
with a row for each item in our array, using the ``ng-repeat``
attribute.

.. code:: html

    <table ng-controller="tableController" ng-cloak>
      <thead>
        <tr>
          <th>Name
          <th>Title
          <th>Age
      </thead>
      <tbody>
        <tr ng-repeat="row in table">
          <td>{{row.name}}
          <td>{{row.title}}
          <td>{{row.age}}
      </tbody>
    </table>

You'll see within the body, we use ``ng-repeat="row in table"`` to loop
through our data. Then, within each row, we can use the ``{{ }}``
expression syntax to place each row's data into the page. Expressions
like this, where we just provide the values we want for output, are the
simplest kind of Angular expressions. It's possible to do much more
elaborate filtering and evaluation, but simple templates are the
meat-and-potatoes of data visualization.

Sort by Sortwest
----------------

Now we need to tell our table to sort. On our scope, we'll declare some
tracking variables, and a ``sort`` function that the page can call.

.. code:: js

    //track the sort and direction
    $scope.sortOn = "name";
    $scope.sortDesc = false;

    //actually trigger sort
    $scope.sort = function(prop) {
      //is this descending sort?
      if (prop == $scope.sortOn) {
        $scope.sortDesc = !$scope.sortDesc;
      } else {
        $scope.sortDesc = false;
      }
      //actually sort the table
      $scope.table.sort(function(a, b) {
        var result = 0;
        if (a[prop] < b[prop]) result = -1;
        if (b[prop] < a[prop]) result = 1;
        if (result && $scope.sortDesc) result *= -1;
        return result;
      });
      //save this for next time
      $scope.sortOn = prop;
    };

Triggering this sort function is easy. Instead of setting up our events
via JavaScript, which would require us to attach/detach event listener
functions as the page was updated, we can declare event bindings via
more ``ng-`` attributes. Here's our table header with an attribute that
will call ``sort()`` on the scope when it's clicked.

.. code:: html

    <th ng-click="sort('name')">Name

If you set up ``ng-click`` attributes on all the headers, then click
them, the following takes place:

1. The expression in the ``ng-click`` attribute is evaluated.
2. As a result, ``sort()`` is called with the specified value.
3. The table is sorted, and the scope is updated.
4. Angular notices the change to the ``table`` array, and re-renders the
   page.

The power of Angular comes from this two-way binding: we change the
page, and it can update the data. We change the data, and it updates the
page. Angular makes it easy to manipulate our data and get results,
instead of spending our time writing boilerplate for listening to events
and rendering templates the way we might in Backbone or jQuery. And that
means, where data journalism is concerned, we can get more done on
deadline.

Our table is sortable now, but it'd be good to give users some
indication of the way our table is currently sorted. Let's add a new
attribute that defines sort indicator behavior. Angular lets us create
custom attributes and elements that supplement the existing HTML5
behaviors. In this case, we'll create a directive for a ``sort-column``
attribute, which reacts to the ``sortOn`` and ``sortDesc`` attributes on
the controller's ``$scope``.

Here's our JavaScript defining this directive. Note that in our HTML,
it's ``sort-column``, but in the Angular definition, it's
``sortColumn``.

.. code:: js

    app.directive("sortColumn", function() {
      return {
        //this is an attribute
        restrict: "A",
        //add functionality to the element
        link: function($scope, element, attrs) {
          //what are we checking against?
          var prop = attrs.sortColumn;
          //when the scope undergoes change, check the state of the sort
          $scope.$watch(function(scope) {
            element.toggleClass("sorted", prop == scope.sortOn);
            element.toggleClass("desc", prop == scope.sortOn && scope.sortDesc);
          });
        }
      }
    });

This directive is for an attribute (that's what ``restrict: "A"`` tells
us), and the ``link`` function is called when the element is first
processed. Inside that linking function, we get the value of the
``sort-column`` attribute from the argument, and set up a ``$watch``
function, which is called when something on the ``$scope`` object
changes. Then we use the jQuery-light functions to toggle classes based
on those values, and (based on those classes) add ``::after``
pseudo-elements to the header with up and down arrows. Adding this
behavior to an element is as easy as adding the attribute to the HTML:

.. code:: html

    <th ng-click="sort('name')" sort-column="name">Name

If the current sort column matches the property specified, it'll get the
classes added to it.

Summing Up
----------

Let's review: we set up an Angular application that links data to the
page via the ``$scope`` variable. Then we used ``ng-click`` to trigger a
sort on that data whenever the user selects one of the headers. Finally,
we created a new attribute that adds sort indicators to those headers.
In less than 60 lines of JavaScript, our sortable table is fully
operational, and we're in a good place to extend it with new
functionality: filtering, formatting, and more.
