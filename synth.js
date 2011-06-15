
/*
 * The oscillator and the code to generate the pitches is from
 https://developer.mozilla.org/en/Creating_a_simple_synth 
 by Jussi Kalliosksoski
*/
function Oscillator(samplerate, freq)
{
    var	phase		= 0,
    p		= 0,
    FullPI		= Math.PI * 2,
    wavetable	= new Float32Array(1);
    this.frequency = 440;
    if (freq){
        this.frequency = freq;
    }
    this.phaseOffset = 0;
    this.pulseWidth = 0.5;
    this.samplerate = samplerate;
    this.generate = function(/* FM1, FM2, ... FMX */){
        var	f	= this.frequency + 0,
        pw	= this.pulseWidth,
        i, l	= arguments.length;
        for (i=0; i<l; i++){
            f += f * arguments[i];
        }
        phase += f / this.samplerate / 2;
        phase = phase % 1;
        p = (phase + this.phaseOffset) % 1;
        if (p < pw){
            p = p / pw;
        } else {
            p = (p-pw) / (1-pw);
        }
    };
    this.getMix = function(){
        return this.sine();
    };
    this.getPhase = function(){
        return p;
    }; // For prototype extensions, otherwise use the p variable
    this.reset = function(){
        phase = 0.0;
    };
    this.setWavetable = function(wt){
        if (!wt instanceof Float32Array){
            return false;
        }
        wavetable = wt.slice(0);
        return true;
    };
    this.sine = function(){
        return Math.sin(p * FullPI);
    };

    this.wavetable = function(){
        return wavetable[Math.floor(p * wavetable.length)];
    };
}

function Synthesizer(){

var freqs ={ a : 220.00  , b :  246.94  , c :  261.63  , d : 293.66 , e : 329.63, f: 349.23 , g : 392.00  };

var frequencies = [
    16.352, 17.324, 18.354, 19.445, 20.602, 21.827, 23.125, 24.500, 25.957,
    27.500, 29.135, 30.868, 32.703, 34.648, 36.708, 38.891, 41.203, 43.654,
    46.249, 48.999, 51.913, 55.000, 58.270, 61.735, 65.406, 69.296, 73.416,
    77.782, 82.407, 87.307, 92.499, 97.999, 103.83, 110.00, 116.54, 123.47,
    130.81, 138.59, 146.83, 155.56, 164.81, 174.61, 185.00, 196.00, 207.65,
    220.00, 233.08, 246.94, 261.63, 277.18, 293.66, 311.13, 329.63, 349.23,
    369.99, 392.00, 415.30, 440.00, 466.16, 493.88, 523.25, 554.37, 587.33,
    622.25, 659.26, 698.46, 739.99, 783.99, 830.61, 880.00, 932.33, 987.77,
    1046.5, 1108.7, 1174.7, 1244.5, 1318.5, 1396.9, 1480.0, 1568.0, 1661.2,
    1760.0, 1864.7, 1975.5, 2093.0, 2217.5, 2349.3, 2489.0, 2637.0, 2793.8,
    2960.0, 3136.0, 3322.4, 3520.0, 3729.3, 3951.1, 4186.0, 4434.9, 4698.6,
    4978.0, 5274.0, 5587.7, 5919.9, 6271.9, 6644.9, 7040.0, 7458.6, 7902.1,
    8372.0, 8869.8, 9397.3, 9956.1, 10548.1, 11175.3, 11839.8, 12543.9,
    13289.8, 14080.0, 14917.2, 15804.3, 16744.0, 17739.7, 18794.5, 19912.1,
    21096.2, 22350.6, 23679.6, 25087.7, 26579.5, 28160.0, 29834.5, 31608.5];



var oscillator =  new Oscillator(22050);

    function genPitch(freq) {

        oscillator.frequency =  freq;
        var buffer = new Float32Array(22050);
        var i, l = buffer.length;
        // Iterate through the buffer
        for (i=0; i<l; i++){
            // Advance the oscillator angle, add some flavor with Math.random noise.
            oscillator.generate((Math.random() * 2 - 1) * 0.3);
            // Set the sample for both channels to oscillator's output,
            // and multiply that with 0.2 to lower the volume to a less
            // irritating/distorted level.
            buffer[i] = buffer[++i] = oscillator.getMix() * 0.2;
        }

        return buffer;
    }

    var output = new Audio();
    output.mozSetup(1, 44100 );

    var keyboard = [];

    for ( i =0; i < frequencies.length; i +=1){
        var curr = frequencies[i];
        keyboard.push( genPitch(curr) );
    }

    function playKey(key) {
        var buffer = keyboard[key];
        output.mozWriteAudio(buffer);
    }

    this.playKey = playKey;

    function playKeys(keys){
        var i = 0;
        function playNextKey(){
            playKey(keys[i]);
            i += 1;
            if ( i < keys.length){
                setTimeout(playNextKey,1000);
            }
        }
        playNextKey();
    }

    this.playKeys = playKeys;

    return this;
}

var synth = new Synthesizer();

function playTones(){
    var keys = [ 44,46,48,49,51,53,55,56 ];

    synth.playKeys(keys);

}
