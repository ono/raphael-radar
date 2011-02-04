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
  // labels: labels of axises. e.g. ["Speed", "Technic", "Height", "Stamina", "Strength"]
  // max_score: maximum score.
  // score_groups: groups has 1+ group(s) of scores and name. please see bellow for the detail.
  //  e.g.
  //    score_groups = [
  //      {title: "Messi 2008", scores: [ 5, 5, 2, 2, 3]},
  //      {title: "Messi 2010", scores: [ 5, 5, 2, 4, 4]}
  //    ]
  //
  // old interface.
  // Raphael.fn.radarchart = function (x, y, radius, sides, params, score, labels, ids, max)
  Raphael.fn.radarchart = function (cx, cy, radius, labels, max_score, score_groups)
  {
    var center = {x:cx,y:cy};
    var x,y,x1,y1,x2,y2;
    var chart = {};
    var sides = labels.length;

    // Genarates points of the chart frame
    var angle = -90;
    var points = [], rads = [];
    for (var i=0; i<sides; i++) {
      var rad = (angle / 360.0) * (2 * Math.PI);
      x = cx + radius * Math.cos(rad);
      y = cy + radius * Math.sin(rad);
      points.push({x:x,y:y});
      rads.push(rad);
      angle += 360.0 / sides;
    }

    // Regularises scores
    for (var i=0; i<score_groups.length; i++) {
      for (var j=0; j<score_groups[i].scores.length; j++) {
        score_groups[i].scores[j] /= max_score;
      }
    }

    var st = this.set(); // A set to compose elements of a frame

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
      var scores = score_groups[i].scores;
      var title = score_groups[i].title;
      var vector = {};
      var line = this.path( path_string( center, points, scores));
      vector['line'] = line;

      // Draws points for chart
      var v_points = [];
      for (var j=0; j<scores.length; j++) {
        var x = lined_on( cx, points[j].x, scores[j]);
        var y = lined_on( cy, points[j].y, scores[j]);

        var point = this.circle(x,y,4.5).attr({'fill':'#333','stroke-width':'0'});
        v_points.push(point);
      }
      vector['points'] = v_points;

      // title with line sample
      if (title) {
        var x1 = cx - 50, y1 = cy + radius * 1.05 + 20*i;
        var x2 = cx, y2 = y1;
        var line = this.path("M " + x1 + " " + y1 + " L " + x2 + " " + y2)
        var point = this.circle(x1,y1,4.5).attr({'fill':'#333','stroke-width':'0'});
        var text = this.text( x2+10, y2, title).attr({fill:"#222",'text-anchor':'start'})
        vector['title'] = {line:line,point:point,text:text};
      }
      chart['scores'].push(vector);
    }

    if (labels) {
      chart['labels'] = [];
      for (var i = 0; i < points.length; i++) {
        x = lined_on( cx, points[i].x, 1.1);
        y = lined_on( cy, points[i].y, 1.1);
        var anchor = "center";
        if (x>cx) anchor = "start";
        if (x<cx) anchor = "end";

        var label = labels[i];
        if (label.length>10) label = label.replace(" ", "\n");
        var text = this.text( x, y, label).attr({fill:"#222", 'text-anchor':anchor});
        chart['labels'].push(text);
      }
    }

    return chart;
  };
})();

