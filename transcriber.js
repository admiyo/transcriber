/* main (document onready event handler) */


$(function() {

    transcriber({
        container: $('#top'),
        radius: 8,
        clef: 'g',
        border: {
            left: 30,
            right: 100,
            top: 0
        }});

    transcriber({
        container: $('#middle'),
        radius: 16,
        clef: 'g',
        editable: true,
        border: {
            left: 30,
            right: 100,
            top: 0
        }});

    transcriber({
        container: $('#bottom'),
        radius: 8,
        clef: 'g',
        border: {
            left: 30,
            right: 100,
            top: 0
        }});


    for (var i = 0; i < 20; i+=1){

        var div = $('<div></div>',{
            id: 'staff_i',
            'class' : 'staff',
            style: '{height: 50; width: 200; }'
        }).appendTo($('#leftnav'));

        transcriber({
        container: div,
        radius: 2,
        clef: 'g',
        border: {
            left: 0,
            right: 0,
            top: 0
        }});


    }
})

function transcriber(spec){


    var container = spec.container;
    var radius = spec.radius;

    var diameter = 2*radius;

    var that = {};
    var next_note = spec.border.left;
    var top_line = radius * 8 + spec.border.top;
    var bottom_line = top_line + (4*diameter);
    var width =  parseInt(container.css('width')) - spec.border.right;//  1100;

    var notes=[];

    function drawIntro(svg) {
        that.offsetLeft = this.offsetLeft;
        that.offsetTop = this.offsetTop;
        var g = svg.group({stroke: 'black', strokeWidth: 2});

        var i;
        for (i = 0; i < 5 ; i += 1){
            svg.line(g, diameter, diameter*i+top_line, width, diameter*i+top_line);
        }
        that.svg = svg;
        that.notes = notes;

        that.svg.script("function circle_click(evt) {\n  var circle = evt.target;\n  circle.setAttribute(\"fill\", \"blue\");\n}", "text/ecmascript"); 

    }


    container.svg({onLoad: drawIntro});


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

    

    var note_count=0;

    if (spec.editable){

    container.mousemove(function(evt){
        var center_y = evt.layerY;//-this.offsetTop;
        var center_x=evt.layerX;//-this.offsetLeft;
        redo_vert(center_x);
        redo_horiz(center_y);
    });
        
    container.click(function(evt){
        div = this;
        var g = that.svg.group({stroke: 'black', strokeWidth: 2});
        var center_y = evt.layerY;//-that.offsetTop;
        var center_x=evt.layerX;//-that.offsetLeft;
        var i;
        //for now, short circuit the function.  Later, we'll use this test to decide if we are adding new notes or adjusting previous.
        if (next_note > center_x) {
            return;
        }else{
            //refactor this to function add_note()
            note_y =quantize_y(center_y);
            redo_vert(center_x);
            var note_id = "note_"+note_count;
            note_count +=1;
            var note = that.svg.circle
            (g,next_note, note_y, radius,
             {
                 id:  note_id,
                 fill: 'clear',
                 stroke: 'black',
                 strokeWidth: 3});
            //var svg = container.svg('get');

            /*
              These two functions have to be scoped in the same function where 
              the div tag is definied as they access the 'note' variable
              that is linked with the div tag */

            function  select_note(evt){
                $(this).css({
                    left:(div_left-radius) +"px",
                    top: (div_top-radius)  +"px",
                    height: (2*diameter) +"px",
                    width: (2*diameter)+ "px",
                    border: "3px coral solid"
                });
                $(this).click(unselect_note);
            }

            function  unselect_note(evt){
                $(this).css({
                    left:div_left +"px",
                    top: div_top  +"px",
                    height: diameter +"px",
                    width: diameter+ "px",
                    border: 'none'
                });
                $(this).click(select_note);
            }

            var div_top =(note_y+this.offsetTop - radius);
            var div_left =(next_note+ this.offsetLeft - radius)
            var div = $('<div/>',{
                css:{
                    position:'absolute',
                    left:div_left +"px",
                    top:div_top+"px",
                    height: diameter +"px",
                    width: diameter+ "px",
                },
                border: 1,
                click: select_note,
                nate: note
            }).appendTo($('body'));

            function note_staves(g, next_note, i){
                that.svg.line(g, next_note-(1.5 *radius), i, next_note+( 1.5 *radius), i);
            }

            if (note_y < top_line){
                for (i = top_line - diameter; i > note_y - radius; i -= diameter){
                    note_staves(g, next_note, i);
                }
            }else  if (note_y > bottom_line){
                for (i = bottom_line + diameter; i < note_y + radius; i += diameter){
                    note_staves(g, next_note, i);
                }
            }
            notes[notes.length] = note;
            next_note += diameter * 2;
        }
    })
    };
};