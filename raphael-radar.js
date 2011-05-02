// ono/raphael-rader.js v.0.1
// https://github.com/ono/raphael-radar
(function() {
  // Draws a Polygon.
  Raphael.fn.polygon = function(points)
  {
     // Initial parameter makes an effect... mysterious...
     var path_string = "M 100 100";
     for( var i = 0; i < points.length; i++){
       var x = points[i].x;
       var y = points[i].y;
       var s;
       s = (i == 0) ? "M " + x + " " + y + " " : "L " + x + " " + y + " ";
       if( i == points.length - 1) s += "L " + points[0].x + " " + points[0].y + " ";
       path_string += s;
     }
     var poly = this.path(path_string);

     return poly;
  };

  // Gets a position on a radar line.
  function lined_on( origin, base, bias)
  {
    return origin + (base - origin) * bias;
  };

  // Gets SVG path string for a group of scores.
  function path_string( center, points, scores)
  {
     vertex = [];
     for( var i = 0; i < points.length; i++){
       var s = "";
       var x = lined_on( center.x, points[i].x, scores[i]);
       var y = lined_on( center.y, points[i].y, scores[i]);
       vertex.push( "" + x + " " + y);
     }
     return "M " + vertex.join("L ") + "L " + vertex[0];
  };

  // Draws a radarchart.
  //
  // cx, cy: coodinates of center
  // radius: radius of the radar chart. you may need more height and width for labels.
  // labels: labels of axes. e.g. ["Speed", "Technic", "Height", "Stamina", "Strength"]
  // max_score: maximum score.
  // score_groups: groups has 1+ group(s) of scores and name. please see bellow for the detail.
  //  e.g.
  //    score_groups = [
  //      {title: "Messi 2008", scores: [ 5, 5, 2, 2, 3]},
  //      {title: "Messi 2010", scores: [ 5, 5, 2, 4, 4]}
  //    ]
  //
  //  -or- the 'labels' attribute can be automatically queried on a score_group object
  //    if the score_group object does not respond to 'scores'. It will look for both the
  //    label value as well as lowercase/underscore versions e.g."Car Height" => "car_height"
  //
  //  e.g.
  //    score_groups = [
  //      { title: "Messi 2008", speed: 5, technic: 5, height: 2, stamina: 2, strength: 3 },
  //      { title: "Messi 2010", speed: 5, technic: 5, height: 2, stamina: 4, strength: 4 }
  //    ]
  //    labels = ["Speed", "Technic", "Height", "Stamina", "Strength"]
  //
  // old interface.
  // Raphael.fn.radarchart = function (x, y, radius, sides, params, score, labels, ids, max)
  Raphael.fn.radarchart = function (cx, cy, radius, labels, max_score, score_groups, user_draw_options)
  {
    var center = {x:cx,y:cy};
    var x,y,x1,y1,x2,y2;
    var chart = {};
    var sides = labels.length;
    
    var global_draw_defaults = {
      text: { fill: '#222', 'max-chars': 10, 'key': true },
    }
    var global_draw_options = $.extend( true, global_draw_defaults, user_draw_options);

    // Genarates points of the chart frame
    var angle = -90;
    var points = [], rads = [];
    var bottom = 0;
    for (var i=0; i<sides; i++) {
      var rad = (angle / 360.0) * (2 * Math.PI);
      x = cx + radius * Math.cos(rad);
      y = cy + radius * Math.sin(rad);
      points.push({x:x,y:y});
      rads.push(rad);
      angle += 360.0 / sides;

      if (y>bottom) bottom = y;
    }

    // Draws measures of the chart
    var measures=[], rulers=[];
    for (var i = 0; i < points.length; i++) {
      x = points[i].x, y = points[i].y;
      measures.push( this.path("M " + cx + " " + cy + " L " + x + " " + y).attr("stroke", "#777") );

      // Draws ruler
      rulers.push([]);
      var r_len = 0.025;
      for (var j = 1; j < 5; j++) {
        x1 = lined_on( cx, points[i].x, j * 0.20 - r_len);
        y1 = lined_on( cy, points[i].y, j * 0.20 - r_len);
        x2 = lined_on( cx, points[i].x, j * 0.20 + r_len);
        y2 = lined_on( cy, points[i].y, j * 0.20 + r_len);
        var cl = this.path("M " + x1 + " " + y1 + " L " + x2 + " " + y2).attr({"stroke":"#777"});
        cl.rotate(90);
        rulers[i].push(cl);
      }
    }
    chart['measures'] = measures;
    chart['rulers'] = rulers;

    // Draws a frame of the chart and sets styles it
    var frame = this.polygon(points).attr({"stroke":"#777"});
    chart['frame'] = frame;

    // Draws scores
    chart['scores'] = []
    for (var i=0; i<score_groups.length; i++) {
      var default_draw_options = { points: {'fill':'#333','stroke-width':'0', 'size': 4.5},
                                    text: {'fill':"#222",'text-anchor':'start'},
                                    lines: {'stroke-width':'1' } };
                                    
      draw_options = $.extend(true, default_draw_options, score_groups[i]['draw_options'] );

      // Regularises scores
      var scores = [];

      // If a score_groups object doesn't respond to 'scores',
      // loop through the labels attribute to try querying the
      // keys on the object
      if(score_groups[i].scores) {
         for (var j=0; j<score_groups[i].scores.length; j++)
           scores.push(score_groups[i].scores[j] / max_score);
      } else {
         for(var j=0; j<labels.length; j++) {
            var value = score_groups[i][labels[j]] || score_groups[i][labels[j].toLowerCase().replace(" ","_")];
            scores.push( value / max_score);
         }
      }
              
      var title = score_groups[i].title;
      var vector = {};
      var line = this.path( path_string( center, points, scores) ).attr(draw_options['lines']);
      vector['line'] = line;
      
      // Draws points for chart
      var v_points = [];
      for (var j=0; j<scores.length; j++) {
        var x = lined_on( cx, points[j].x, scores[j]);
        var y = lined_on( cy, points[j].y, scores[j]);

        var point = this.circle(x,y,draw_options['points']['size']).attr(draw_options['points']);
        v_points.push(point);
      }
      vector['points'] = v_points;

      // title with line sample
      if (title && global_draw_options['text']['key']) {
        var x1 = cx - 50, y1 = bottom + 30 + 20*i;
        var x2 = cx, y2 = y1;
        var line = this.path("M " + x1 + " " + y1 + " L " + x2 + " " + y2).attr(draw_options['lines']);
        var point = this.circle(x1,y1,draw_options['points']['size']).attr(draw_options['points']);
        var text = this.text( x2+10, y2, title).attr(draw_options['text'])
        vector['title'] = {line:line,point:point,text:text};
      }
      chart['scores'].push(vector);
    }

    // Draws labels 
    if (labels) {
      chart['labels'] = [];
      for (var i = 0; i < points.length; i++) {
        x = lined_on( cx, points[i].x, 1.1);
        y = lined_on( cy, points[i].y, 1.1);
        var anchor = "middle";
        if (x>cx) anchor = "start";
        if (x<cx) anchor = "end";

        var label = labels[i];
        if (label.length > global_draw_options['text']['max-chars']) label = label.replace(" ", "\n");
        var text = this.text( x, y, label).attr($.extend(true, global_draw_options['text'], {'text-anchor': anchor }));
        chart['labels'].push(text);
      }
    }

    return chart;
  };
})();