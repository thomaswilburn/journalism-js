//declare our module for the application
var app = angular.module("sortableDemo", []);

//our controller needs access to its own scope
app.controller("tableController", ["$scope", function($scope) {
  
  //set up some demo data for this to use
  var table = [
    { name: "Alice", age: 33, title: "Editor" },
    { name: "Bob", age: 44, title: "Reporter" },
    { name: "Chuck", age: 23, title: "Intern" }
  ];
  //assign that data to the controller scope
  $scope.table = table;
  
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
  
}]);

//add an indicator for the sort, based on parent scope
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