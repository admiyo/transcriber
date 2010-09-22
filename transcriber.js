/* main (document onready event handler) */


$(function() {

    //something is not right here, Mr. Downes.
    var radius=10;
    var diameter = 25;

    var that = this;
    var next_note = 30;
    var top_line = 125
    var bottom_line = top_line + (4*diameter);
    var offsetLeft =  0;
    var offsetTop = 0;
    var width = 1100;

    var notes=[];

    function drawIntro(svg) {

        offsetLeft = this.offsetLeft;
        offsetTop = this.offsetTop;

        var g = svg.group({stroke: 'black', strokeWidth: 2});

        var i;
        for (i = 0; i < 5 ; i += 1){
            svg.line(g, diameter, diameter*i+top_line, width, diameter*i+top_line);
        }
        that.svg = svg;
        that.notes = notes;
    }

    $('#moveit').click(function(){
    });

    $('#svgintro').svg({onLoad: drawIntro});


     function quantize_y(center_y){
        var steps;
        note_y = top_line;
        if (top_line > center_y){
            steps =  (top_line - center_y) / (diameter/2);
            for (i = 0; i < steps; i += 1){
                note_y -= diameter/2;
            }
        }else{
            steps =  (top_line - center_y) / (diameter/2)+1;

            for (i = 0; i > steps; i -= 1){
                note_y += diameter/2;
            }
        }
         return note_y;
    }



    function quantize_x(center_x){
        var steps;
        note_x = diameter;
        if (diameter < center_x){
            steps =  (center_x - diameter) / (diameter/2);
            for (i = 0; i < steps; i += 1){
                note_x += diameter/2;
            }
        }else{
            note_x = diameter;
        }
         return note_x;
    }


    var last_horiz;
    var last_vert;

    function redo_vert(center_x){
        if (last_vert){
            that.svg.remove(last_vert);
            last_vert = null;
        }
        if ( center_x >= next_note){
            last_vert = that.svg.line( next_note, 0 , next_note, 800,
                                      {stroke: 'yellow', strokeWidth: 4});
        }else{
            center_x = quantize_x(center_x);
            last_vert = that.svg.line( center_x, 0 , center_x, 800,
                                       {stroke: 'yellow', strokeWidth: 4});
        }
    }

    function redo_horiz(center_y){
        if (last_horiz){
            that.svg.remove(last_horiz);
            last_horiz = null;
        }
        var line_y =quantize_y(center_y);
        last_horiz = that.svg.line(diameter, line_y, width, line_y,
                                   {stroke: 'yellow', strokeWidth: 4});
    }

    $('#svgintro').mousemove(function(evt){
        var center_y = evt.layerY-this.offsetTop;
        var center_x=evt.layerX-this.offsetLeft;
        redo_vert(center_x);
        redo_horiz(center_y);
    });



    $('#svgintro').click(function(evt){
        div = this;
        var g = that.svg.group({stroke: 'black', strokeWidth: 2});
        var center_y = evt.layerY-this.offsetTop;
        var center_x=evt.layerX-this.offsetLeft;
        var i;
        //for now, short circuit the function.  Later, we'll use this test to decide if we are adding new notes or adjusting previous.
        if (next_note > center_x) return;

        note_y =quantize_y(center_y);

        redo_vert(center_x);

        that.svg.circle(g,next_note, note_y, radius,
                        {fill: 'none', stroke: 'black', strokeWidth: 3});

        if (note_y < top_line){
            for (i = top_line - diameter; i >= note_y; i -= diameter){
                that.svg.line(g, next_note-(diameter/2), i, next_note+(diameter/2), i);
            }
        }

        if (note_y > bottom_line){
            for (i = bottom_line + diameter; i <= note_y; i += diameter){
                that.svg.line(g, next_note-(diameter/2), i, next_note+(diameter/2), i);
            }
        }
        notes[notes.length] = g;
        next_note += 30;

    });
});