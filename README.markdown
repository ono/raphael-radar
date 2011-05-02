ono/raphael-radar
=================

ono/raphael-radar is a refactored version of
[Raphael-Radar](https://github.com/tnzk/Raphael-Radar)

![Screen Shot](https://github.com/ono/raphael-radar/raw/master/example/images/screenshot.png)

The objectives of refactoring are...

* Work with the latest version of Raphaël.
* Easy customization. Especially for cosmetic changes.
* Fix some bugs.
* Support multiple groups of scores.
* Remove unnessesary code from the library and put the idea into example.
* Make the code simpler.

Please note that there is no compatibility with the original version.

Example
-------

Raphael-Radar now has the option to maintain all content & style options through the objects passed to radarchart, instead of using a separate 'scores' array or manually manipulating the Raphaël chart.

Style options are maintained through the draw_options object. See `default_draw_options` in raphael-radar.js for defaults. All attributes are passed directly to Raphaël via `attr()` so you can set pretty much whatever attributes you'd like on lines, points and text.

The following chart can be created using the code below it, and you no longer need to edit the lines and points manually.

![Screen Shot](https://github.com/ono/raphael-radar/raw/master/example/images/screenshot.png)
    
    var objects = [
        { title: "Real Madrid C.F.", 
          offense: 8,
          defense: 9,
          technique: 7,
          strategy: 9,
          physicality: 7,
          mentality: 6,
          draw_options: {
            lines: {'stroke-width':'2', 'stroke':'#39b549','stroke-dasharray':'- '},
            points: {'fill':'#39b549','stroke-width':'0'},
            text: {}
          }
        },
        { title: "FC Barcelona", 
          offense: 10,
          defense: 7,
          technique: 10,
          strategy: 7,
          physicality: 6,
          mentality: 8,
          draw_options: {
            lines: {'stroke-width':'4','stroke':'#0070bb','stroke-opacity':0.7,'fill':'#f7d2a8','fill-opacity':0.6},
            points: {'fill':'#f05a23','stroke-width':'1.5','stroke':'#333', 'size': 6},
            text: {}
          }
        }
    ];

    var paper = Raphael( "id_of_some_div", 460, 360);
    paper.radarchart( 221, 160, 120, labels, 10, objects);
    
**Note: While the example below works great, I (jsoma) would recommend looking at the most recently updated on under /examples in this project**

Seeing example is always the best way to understand how it works. Here is an
[example code](http://o1123.com/raphael-radar/example/index.html).

I am thinking of making the page nicer and adding an example to handling events
on the chart near future.

TODO
----

* Better example page with code view.
* License information.

Special Thanks to
-----------------

* KURAZEKO Kyohe for original version.
* Yoshihide Tsuda for designing a rich version of sample chart.

