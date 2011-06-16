/* main (document onready event handler) */


$(function() {

    var staff = {
        top:transcriber({
        container: $('#top'),
        radius: 8,
        clef: 'g',
        border: {
            left: 30,
            right: 100,
            top: 0
        }}),

        mid:    transcriber({
        container: $('#middle'),
        radius: 16,
        clef: 'g',
        editable: true,
        border: {
            left: 30,
            right: 100,
            top: 0
        }}),
        bot:   transcriber({
        container: $('#bottom'),
        radius: 8,
        clef: 'g',
        border: {
            left: 30,
            right: 100,
            top: 0
        }})
    };

    var left_staff = [];

    for (var i = 0; i < 20; i+=1){

        var div = $('<div></div>',{
            id: 'staff_'+i,
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
        staff.top.load('file:music.json');
        staff.mid.load('file:music.json');

        left_staff[0].load('file:music.json');
    });

    $('#clear').click(function(){
        var i;
        for (i in staff){
            staff[i].clear();
        }
        for (i = 0; i < left_staff.length; i +=1 ){
            left_staff[i].clear('file:music.json');
        }

    });

    $('#save').click(function(){
        staff.mid.save('saveurl');
    });

    $('#play').click(function(){
        staff.mid.play();
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
        next_note = spec.border.left + radius * 8;
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

//        that.svg.script("function circle_click(evt) {\n  var circle = evt.target;\n  circle.setAttribute(\"fill\", \"blue\");\n}", "text/ecmascript");

    }

    that.draw_intro = drawIntro;

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

     function y_to_pitch(center_y){
         var steps;
         var note_y = top_line;
         if (top_line > center_y){
             steps =  (top_line - center_y) / (radius);
         }else{
             steps =  (top_line - center_y) / (radius);
         }
         //top line is F4  or 56 notes from the bottom
         steps += 56;
         return steps;
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
                                       {stroke: 'red', strokeWidth: 4});
        }
    }

    function redo_horiz(center_y,center_x){
        if (last_horiz){
            that.svg.remove(last_horiz);
            last_horiz = null;
        }
        var line_y =quantize_y(center_y);
        var stroke_color = 'red';
        if ( center_x >= next_note){
            var stroke_color = 'yellow';
        }


        last_horiz = that.svg.line(diameter, line_y, width, line_y,
                                   {stroke: stroke_color, strokeWidth: 4});
    }

    var note_count=0;

    if (spec.editable){
        container.mousemove(function(evt){
            redo_vert(evt.layerX);
            redo_horiz(evt.layerY,evt.layerX);
        });

        container.click(function(evt){
            //for now, short circuit the function.
            //Later, we'll use this test to decide if we are adding new notes
            // or adjusting previous.
            if (next_note > evt.layerX) {
                return;
            }
            var note_y =quantize_y(evt.layerY);
            redo_vert(evt.layerX);
            add_note(note_y);
            redo_vert(evt.layerX);
            redo_horiz(evt.layerY,evt.layerX);
            synth.playKey(y_to_pitch(note_y));
        })
    };


    function draw_flag(g, note_y, duration){
        if (duration >= 128) return;
        that.svg.line(
            g,
            next_note+radius, note_y,
            next_note+radius, note_y-6*radius);
    }

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
    function add_note(note_y,accidental,duration) {

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

        var fill = 'white';

        if (duration < 64){
            fill = 'black';
        }

        var note = that.svg.circle(
            g,next_note, note_y, radius,
            {
                id:  note_id,
                fill: fill,
                stroke: 'black',
                strokeWidth: 1,
                click:select_note

            });
            //var svg = container.svg('get');

            /*
              These two functions have to be scoped in the same function where
              the div tag is definied as they access the 'note' variable
              that is linked with the div tag */

        function  select_note(evt){
            $(this).css({
                border: "3px coral solid",
            });

            $(this).find('img').css('display','inline');

            $(this).click(unselect_note);
        }

        function  unselect_note(evt){
            $(this).css({
                border: 'none'
            });
            $(this).find('img').css('display','none');

            $(this).click(select_note);
        }

        draw_flag(g, note_y, duration);


        var div_top =(note_y+that.offsetTop - diameter);
        var div_left =(next_note+ that.offsetLeft - diameter)
        var div = $('<div/>',{
            'class':'note_edit',
            css:{
                position:'absolute',
                left: next_note -diameter  +'px',
                top: note_y -diameter + 'px',
                height: 2*diameter +"px",
                width: 2*diameter+ "px",

            },
            click: select_note,
            note: note
        }).appendTo(container);

        function shorter(){
            alert('make note shorter');
            return false;
        }

        function longer(){
            alert('make note longer');
            return false;
        }
        function higher(){
            alert('make note higer');
            return false;
        }
        function lower(){
            alert('make note lower');
            return false;
        }
        function back(){
            alert('move note back');
            return false;
        }

        function forward(){
            alert('move note forward');
            return false;
        }

        var images = [
            {name:"back.svg",x:-0.5,y:2.5,action: back},
            {name:"next.svg",x:2.5,y:2.5,action:forward},
            {name:"b_up.svg",x:1,y:-0.5,action:higher},
            {name:"b_down.svg",x:1,y:3,action:lower},
            {name:"b_minus.svg",x:-0.5,y:0,action:shorter},
            {name:"b_plus.svg",x:2.5,y:0,action:longer}];


        for ( var i = 0; i < images.length; i+= 1){
            var image = images[i];
            div.append($('<img />',{
                src:image.name,
                width: 30,
                height: 30,
                click: image.action,
                css:{
                    position:'absolute',
                    left: ( image.x * radius ) + 'px',
                    top:  ( image.y * radius ) +'px',
                    display:'none'
                }
            }));
        }



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


            var clef = that.svg.load(response.clef+'_clef.svg');
            that.draw_intro(that.svg);

        var paths = $('path', this);


            for (var i = 0 ; i < response.notes.length; i += 1){
                note =  response.notes[i];
                pitch = note[0];
                var y = pitch_to_y(pitch,true);
                add_note(y, is_accidental(pitch) ? accidental : null,note[1] || 64 );
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
        $('.note_edit',container).remove();
        reset();
    }

    that.save = function(url){
        alert('saving '+url);
    }

    that.play = function(){
        alert('playing');
    }


    return that;
};
