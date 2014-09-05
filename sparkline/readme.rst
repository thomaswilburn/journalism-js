Sparklines
==========

If you want to graph large or complex datasets in the browser, you're
going to end up using the HTML5 canvas eventually. SVG is well and good,
but it becomes sluggish when loaded with a lot of nodes, and support on
mobile is weaker (particularly on older versions of Android). However,
the ``<canvas>`` tag comes with its own problems, as well. It's not as
good with handling events, and its API is more difficult. For this
reason, you'll probably use a library like EaselJS for interacting with
it--but that doesn't mean you can't learn the basics of drawing to
canvas anyway.

As a way of familiarizing ourselves with the canvas API, we'll work on a
"sparkline." The term comes from visualization guru Edward Tufte, and
they take the form of small, simple graphs that can be shown inline to
describe a trend. They don't have axes or labels, and they don't require
any interaction, so they're perfect for our tutorial.

In This Tutorial
----------------

-  index.html - The index page with our ``<canvas>`` tag and some styles
-  script.js - The script to load data and do the actual drawing

The Setup
---------

Our ``index.html`` file contains a canvas tag with an ID of ``buffer``.
You'll notice that the canvas tag must have a separate closing tag--this
is so that any fallback code, for browsers that don't support canvas,
can be placed inside. Currently, there are very few browsers where
canvas won't work, but it's still good to put a note inside for those
unlucky few.

.. code:: html

    <canvas id="buffer">
      (sparkline)
    </canvas>

Although we talk about drawing to the canvas tag, the fact is that we
actually draw to a "context" associated with that tag, and not the tag
itself. Unfortunately, you can't get the context from an element that's
wrapped up using jQuery, so we'll have to use
``document.querySelector()`` to find it. However, if you're used to
jQuery, you'll find that the syntax of ``querySelector()`` and its
partner, ``querySelectorAll()``, are familiar.

.. code:: js

    var canvas = document.querySelector("#buffer");
    var context = canvas.getContext("2d");

With our context retrieved, we can write a function that draws a
sparkline from a list of values. All drawing on a canvas requires a
series of steps:

1. For each separate line or shape, we call ``beginPath()``.
2. We move the "pen" to our starting position, then draw lines from
   there
3. Once the shape is complete, we call ``stroke()`` to draw along the
   path we've described in step #2

If we forget any of these steps, there won't be any output, so it's
important to make sure that we don't leave any of them out.

Let's start our ``render()`` function by finding the highest and lowest
values in the list--after scaling, these will be at the top and bottom
of the sparkline. We're going to use a little JavaScript trick for the
``Math.max()`` and ``Math.min()`` functions. Normally, these functions
take a number of individual arguments, and return the highest or lowest.
``apply()`` "unwraps" our array before feeding it to the function, so
that ``Math.max.apply(null, [1, 2, 3])`` is the same as
``Math.max(1, 2, 3)``.

.. code:: js

    var max = Math.max.apply(null, values);
    var min = Math.min.apply(null, values);

We also need some information about the canvas: namely, how tall it is,
and how widely spaced our points should be to fit into its width. It's
worth noting that the height and width of the canvas, as set from
JavaScript or from the tag attributes, only defines the size of the
bitmap onto which we're going to draw. The actual canvas size on-screen
may be different, according to the CSS that's applied to it. In this
case, we have a canvas that's 20 pixels tall internally, but squished
into 16 pixels tall (to fit with a line of text).

.. code:: js

    var xStep = canvas.width / (values.length - 1);
    var height = canvas.height;

Drawn Together
--------------

Now we'll begin a path (i.e., our line), and walk through our list of
values, moving the "pen" as we go.

.. code:: js

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

The math inside this loop is not actually that complicated, but it may
be intimidating if you've never done any graphics programming before. It
starts by finding the value of ``scaled``, which is the position of the
current value between the minimum and maximum values. ``scaled`` should
be between 0 and 1. Multiplying ``scaled`` by ``height`` gives us the
position of this value within the height of the canvas. Finally, we
subtract this Y coordinate from the height: on a canvas, Y coordinates
start with 0 at the top and increase as they move down the screen, so
our ``y`` is actually the distance in pixels from the top of the canvas.

On the first point of the line, we need to move the drawing "pen" of the
canvas to its starting position. After that, we use the ``lineTo()``
function to draw a line connecting the previous point to the current
one. The conditional statement above (``if (i) { ... }``) takes
advantage of JavaScript's "falsey" values, one of which is ``0``. Since
the index of the first item is ``0``, our code calls ``moveTo()`` for
the start of the line, and ``lineTo()`` for each point after that.

Finally, we have to draw the line. The ``stroke()`` function actually
draws the line we've been defining since our first ``beginPath()``.
Before we draw, however, we'll set the color and width of the line. You
can do this any time before ``stroke()``, and only the last setting of
``strokeStyle`` and ``strokeWidth`` actually take effect.

.. code:: js

    context.strokeStyle = "orange";
    context.strokeWidth = 2;
    context.stroke();

Putting it all together, our function looks like so:

.. code:: js

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

Our demo generates some simple numbers, feeds them to ``render()``, and
*voila*: we have a sparkline in our text.

Conclusion
----------

Just as with other complex UI tasks, you'll often use a library for
canvas in order to manage events, complex shapes, and animation. But
it's still worth knowing how the canvas tag works, just as it's useful
to know how the DOM works, even if we spend most of our time using
jQuery instead. There's a lot more to the API: fills, images, and
blending modes, to start. But a sparkline serves as a useful
introduction--and perhaps it will inspire some other ideas for your
interactive graphics.
