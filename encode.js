/*There are many ASCII based formates for storing music, but most are optmized for user readability.  We need a format that makes it easy to do math. We need to be able to transcribe music in multiple Clefs, at a minimum both Bass and G clef, so we can't really use something like the offset from the top or bottom line.

There are 88 Keys on a Piano Keyboard.  Rare is the music that uses a tone outside this range.  Thus, we'll use the offset from the bottom of the keyboard as the index into an array, from 0-87.

To transpose up an octave, add 12, the number of notes in a Chromatic scale.
Lowest A is 0.  88/12 = 7 remander 4.  Thus, there are 7 Octaves, plus four notes on the Keyboard.  THe highest note is C=87


Middle C is 4 Octaves Above the Lowest C on the Keyboard.12X4=48.  The lowest C on the Keyboard is Offset 3 From the lowest note.  Thus, MIddle C is 51.



The intervals for a standard major triad of Maj 3rd and fifth would be  +4 and +7. A Fourth is +5

For a G Clef, The lowest Line is E above middle C, or 51+4=55
The top line is F two above middle C.  51+5+12=68.

For intevals, we distinguish between the distance between notes as
Whole = W   = 2
Half = H = 1


The Major scale is the set of intervals:

W W H W W W H

or

2 2 1 2 2 2 1

The A Major scale is:

A B C# D E F# G# A.  This is  the set of notes:

0 2 4  5 7 9  11 12.

For placing pitches on the page, we need to know what key to display the note in.  For example, 1 Could either be A# or Bb.  Ignoring for now the accidentals, lets assume we want to display all pitches that would be accidentals as their sharp equivalents.  Assuming also a G Clef.  To display middle C, pitch 51, we want to target the first ledger line below the staff.  52 would have the same offset.  53 and 54 would share an offset as well.  E  55  would not be sharped, and so 56  would be the next offset up.


On the piano, this pattern is illustrated by the Black keys.  The are arrayed in a repeasting pattern of 3 Whole steps, a minor third,  two whole steps and another minor third.  If we transpose the note to the first Octave, we apply accidentals on 1 4 6 9 11.  For flats, we match down, so that 1 is displayed the same as 0.  For sharps, we match up, so that 1 is displayed the same as 2.


We calculate note Y position offsets from the top line.  Thus In G clef, F is top_line.  E is top_line + radius, D is top_line + 2 * Radius, and so on.  Middle C is topline + 10 * radius.



For Duration, we want to avoid floating point operations.  If the smallest we can reasonably expect someone to write usic is 1/64 note, and we assume away the numerator, then a quarter note becomes 1/4 * 64 = 16.  A Whole note is 64.
*/


function note (pitch, duration){
    var that{
        pitch: pitch,
        duration: duration
    }
    return that;
}


/*
  ABC is a musical notation that uses commans and apostrophes to indicate 
  tranascribing up or down an ocatave
*/
var abc_notes = [
    "a,,,,","as,,,,","b,,,,",
    "c,,,","cs,,,","d,,,","ds,,,","e,,,","f,,,","fs,,,","g,,,","a,,,","as,,,","b,,,",
    "c,,","cs,,","d,,","ds,,","e,,","f,,","fs,,","g,,","a,,","as,,","b,,",
    "c,","cs,","d,","ds,","e,","f,","fs,","g,","a,","as,","b,",
    "c","cs","d","ds","e","f","fs","g","a","as","b",
    "c'","cs'","d'","ds'","e'","f'","fs'","g'","a'","as'","b'",
    "c''","cs''","d''","ds''","e''","f''","fs''","g''","a''","as''","b''",
    "c'''","cs'''","d'''","ds'''","e'''","f'''","fs'''","g'''","a'''","as'''","b'''",
    "c''''"
];