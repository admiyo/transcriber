/* main (document onready event handler) */


$(function() {


    var top_staff =  transcriber({
        container: $('#top'),
        radius: 8,
        clef: 'g',
        border: {
            left: 30,
            right: 100,
            top: 0
        }});

    var mid_staff =     transcriber({
        container: $('#middle'),
        radius: 16,
        clef: 'g',
        editable: true,
        border: {
            left: 30,
            right: 100,
            top: 0
        }});

var bot_staff =    transcriber({
        container: $('#bottom'),
        radius: 8,
        clef: 'g',
        border: {
            left: 30,
            right: 100,
            top: 0
        }});

    var left_staff = [];

    for (var i = 0; i < 20; i+=1){

        var div = $('<div></div>',{
            id: 'staff_i',
            'class' : 'staff',
            style: '{height: 50; width: 200; }'
        }).appendTo($('#leftnav'));

        left_staff.push(  transcriber({
            container: div,
            radius: 2,
            clef: 'g',
            border: {
                left: 0,
                right: 0,
                top: 0
            }}));
    }

    $('#load').click(function(){
        top_staff.load('file:music.json');
	mid_staff.load('file:music.json');
	left_staff[0].load('file:music.json');
    });

    $('#clear').click(function(){
        mid_staff.clear();
    });

    $('#save').click(function(){
        top_staff.save('saveurl');
    });
})



function transcriber(spec){


    var container = spec.container;
    var radius = spec.radius;

    var diameter = 2*radius;

    var that = {};
    var top_line = radius * 8 + spec.border.top;
    var bottom_line = top_line + (4*diameter);
    var width =  parseInt(container.css('width')) - spec.border.right;//  1100;


    var next_note;
    var notes=[];

    function  reset(){
        next_note = spec.border.left;
        notes=[];
    }
    reset();

    function drawIntro(svg) {
        that.offsetLeft = this.offsetLeft;
        that.offsetTop = this.offsetTop;
        var g = svg.group({stroke: 'black', strokeWidth: 2});

        var i;
        for (i = 0; i < 5 ; i += 1){
            svg.line(g, diameter, diameter*i+top_line, width, diameter*i+top_line);
        }
        that.svg = svg;

        that.svg.script("function circle_click(evt) {\n  var circle = evt.target;\n  circle.setAttribute(\"fill\", \"blue\");\n}", "text/ecmascript");

    }


    container.svg({onLoad: drawIntro});


     function quantize_y(center_y){
        var steps;
        note_y = top_line;
        if (top_line > center_y){
            steps =  (top_line - center_y) / (radius);
            for (i = 0; i < steps; i += 1){
                note_y -= radius;
            }
        }else{
            steps =  (top_line - center_y) / (radius)+1;

            for (i = 0; i > steps; i -= 1){
                note_y += radius;
            }
        }
         return note_y;
    }


    function quantize_x(center_x){
        var steps;
        note_x = diameter;
        if (diameter < center_x){
            steps =  (center_x - diameter) / (radius);
            for (i = 0; i < steps; i += 1){
                note_x += radius;
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
        }
        var note_y =quantize_y(center_y);
        redo_vert(center_x);
        add_note(note_y);
    })
    };


    function draw_sharp(g,note_y){
        that.svg.line(
            g,
            next_note-( 2 *radius), note_y+radius/2+1,
            next_note+( 2 *radius), note_y+radius/2-1);
        that.svg.line(
            g,
            next_note-( 2 *radius), note_y-radius/2+1,
            next_note+( 2 *radius), note_y-radius/2-1);

        that.svg.line(
            g,
            next_note-(radius/2), note_y+2*radius-1,
            next_note-(radius/2), note_y-2*radius+1);
        that.svg.line(
            g,
            next_note+(radius/2), note_y+2*radius-1,
            next_note+(radius/2), note_y-2*radius+1);
        next_note += diameter * 2;
    };


    function draw_flat(g,note_y){
        that.svg.line(
            g,
            next_note-(radius/2), note_y+2*radius-1,
            next_note-(radius/2), note_y-2*radius+1);
        var path = that.svg.createPath();

        that.svg.path(g, path.move(next_note-(radius/2), note_y+2*radius+1).
                 curveC(next_note+diameter, note_y+radius,
                        next_note+radius, note_y,
                        next_note-(radius/2) , note_y+2*radius/3),{fill:'none'
                        });

        next_note += diameter * 2;
    };



    /*
       note_y is vertical position
       accidental is null, for none, 's' for sharp, 'f' for flat
    */
    function add_note(note_y,accidental) {

        var g = that.svg.group({stroke: 'black',
                                strokeWidth: 2,
                                'class':'notes'});
        var i;
        var note_id = "note_"+note_count;
        note_count +=1;
        if (accidental === 's'){
            draw_sharp(g,note_y);
        }
        if (accidental === 'f'){
            draw_flat(g,note_y);
        }

        var note = that.svg.circle(
            g,next_note, note_y, radius,
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

    var sharp_offsets =  [7,7,6,5,5,4,4,3,2,2,1,1];
    var flat_offsets  =  [7,6,6,5,4,4,3,3,2,1,1,0];
    var accidentals =  [0,1,0,0,1,0,1,0,0,1,0,1];

    function is_accidental(pitch){
        return accidentals[pitch % 12];
    }

    /*set go_flat to true if you want to represent accidentals as flats*/
    function pitch_to_y(pitch, go_flat){
        var octave = Math.floor(pitch / 12);
        var pitch_first_octave = pitch % 12;
        var note_y = top_line + Math.floor(radius * 5);
        var offsets = sharp_offsets;

        if (go_flat){
            //note_y  -=  Math.floor(2 * radius);
            offsets = flat_offsets;
        }

        var steps;
        steps =  ((4 - octave ) * 7)   + offsets[pitch_first_octave];
        note_y += (radius * steps);

        return note_y;
    }

    var sharp_keys = { g:1,d:2,a:3,e:4,b:5,"f#":6,"c#":7};
    var flat_keys = { f:1, "b-":2,"e-":3,"a-":4,"d-":5,"g-":6};

    that.load = function(url){
        that.clear();
        function success_handler(response){
            var note_y = top_line;
            var note;
            var pitch;

            var accidental = null;
            accidental =  (sharp_keys[response.key]) ? 's' : 'f';

            for (var i = 0 ; i < response.notes.length; i += 1){
                note =  response.notes[i];
                pitch = note[0];
                var y = pitch_to_y(pitch,true);
                add_note(y, is_accidental(pitch) ? accidental : null );
            }
        }


        function error_handler(resp){
            alert('error');
        }

        var ajax_options = {
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            async: true,
            processData: false
        };
        $.ajaxSetup(ajax_options);
        var request = {
            url: url,
            success: success_handler,
            error: error_handler
        };

        $.ajax(request);

    }

    that.clear = function(){
        $("g.notes",container).remove();
        reset();
    }

    that.save = function(url){
        alert('saving '+url);
    }

    return that;
};

