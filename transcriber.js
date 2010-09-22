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


     function quantize(center_y){
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

    var last_circle;
    $('#svgintro').mousemove(function(evt){
        var center_y = evt.layerY-this.offsetTop;
        var center_x=evt.layerX-this.offsetLeft;
        if (last_circle){
            that.svg.remove(last_circle);
        }


        last_circle =   that.svg.circle(center_x, center_y, radius,
                        {fill: 'none', stroke: 'black', strokeWidth: 3});
    });

    $('#svgintro').click(function(evt){
        div = this;
        var g = that.svg.group({stroke: 'black', strokeWidth: 2});
        var center_y = evt.layerY-this.offsetTop;
        var center_x=evt.layerX-this.offsetLeft;
        var i;
        //for now, short circuit the function.  Later, we'll use this test to decide if we are adding new notes or adjusting previous.
        if (next_note > center_x) return;

        note_y =quantize(center_y);

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