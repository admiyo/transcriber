/* main (document onready event handler) */


$(function() {

    var delta = 25;

    var that = this;
    var next_note = 30;
    var top_line = 75
    var offsetLeft =  0;
    var offsetTop = 0;
    var width = 1100;

    function drawIntro(svg) {

        offsetLeft = this.offsetLeft;
        offsetTop = this.offsetTop;

        var g = svg.group({stroke: 'black', strokeWidth: 2});

        var i;
        for (i = 0; i < 5 ; i += 1){
            svg.line(g, delta, delta*i+top_line, width, delta*i+top_line);
        }
        that.svg = svg;
    }

    $('#svgintro').svg({onLoad: drawIntro});


    $('#svgintro').click(function(evt){
        div = this;
        var g = that.svg.group({stroke: 'black', strokeWidth: 2});
        var centerY = evt.layerY-this.offsetTop;
        var centerX=evt.layerX-this.offsetLeft;
        var radius=10;
        var i;

        //alert("add in a rounding function so  (top_line - centerY) / delta is either 0 or delta ");

        var steps;
        steps =  (top_line - centerY) / (delta/2) +1 ;
        noteY = top_line;
        if (top_line > centerY){
            for (i = 0; i < steps; i += 1){
                noteY -= delta/2;
            }
        }else{
            for (i = 0; i > steps; i -= 1){
                noteY += delta/2;
            }
        }

        that.svg.circle(next_note, noteY, radius,
                        {fill: 'none', stroke: 'black', strokeWidth: 3});

        if (noteY > top_line){
            for (i = top_line + 2*delta; i <= noteY; i += (2*delta)){
                that.svg.line(g, next_note-delta, i, next_note+delta, i);
            }
        }

        next_note += 30;
    });
});