//create some noisy fake data
var data = [];
for (var i = 0; i < 20; i++) {
  data.push(Math.sin(i) + Math.cos(i * 3));
}

var canvas = document.querySelector("#buffer");
var context = canvas.getContext("2d");

//set the size of the canvas buffer--display size (as set by CSS) may differ
canvas.width = 100;
canvas.height = 20;

//our function for rendering a sparkline
var render = function(values) {
  //find the max and min values
  var max = Math.max.apply(null, values);
  var min = Math.min.apply(null, values);
  //how widely spaced are our points?
  var xStep = canvas.width / (values.length - 1);
  var height = canvas.height;
  //start our line
  context.beginPath();
  //draw all the points
  values.forEach(function(value, i) {
    var scaled = (value - min) / (max - min);
    var x = i * xStep;
    var y = height - scaled * height;
    //Move or draw, depending on the position of the point
    if (i) {
      context.lineTo(x, y);
    } else {
      context.moveTo(x, y);
    }
  });
  //set the style, then draw the line
  context.strokeStyle = "orange";
  context.strokeWidth = 2;
  context.stroke();
};

//pass our data to the function to draw
render(data);