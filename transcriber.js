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


    function drawIntro(svg) {

        offsetLeft = this.offsetLeft;
        offsetTop = this.offsetTop;

        var g = svg.group({stroke: 'black', strokeWidth: 2});

        var i;
        for (i = 0; i < 5 ; i += 1){
            svg.line(g, diameter, diameter*i+top_line, width, diameter*i+top_line);
        }
        that.svg = svg;
    }

    $('#svgintro').svg({onLoad: drawIntro});


     function quantize(centerY){
        var steps;
        note_y = top_line;
        if (top_line > centerY){
            steps =  (top_line - centerY) / (diameter/2);
            for (i = 0; i < steps; i += 1){
                note_y -= diameter/2;
            }
        }else{
            steps =  (top_line - centerY) / (diameter/2)+1;

            for (i = 0; i > steps; i -= 1){
                note_y += diameter/2;
            }
        }
         return note_y;
    }

    $('#svgintro').click(function(evt){
        div = this;
        var g = that.svg.group({stroke: 'black', strokeWidth: 2});
        var centerY = evt.layerY-this.offsetTop;
        var center_x=evt.layerX-this.offsetLeft;
        var i;
        //for now, short circuit the function.  Later, we'll use this test to decide if we are adding new notes or adjusting previous.
        if (next_note > center_x) return;

        note_y =quantize(centerY);

        that.svg.circle(next_note, note_y, radius,
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


        next_note += 30;
    });
});