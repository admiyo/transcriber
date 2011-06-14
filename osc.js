


var freqs ={ a : 220.00  , b :  246.94  , c :  261.63  , d : 293.66 , e : 329.63, f: 349.23 , g : 392.00  };




function playToneOsc(freq) {

    var oscillator =  new Oscillator(22050);
    var output = new Audio();
    output.mozSetup(1, 44100 );

    oscillator.frequency =  freq;//

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
    output.mozWriteAudio(buffer);
}

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




function Oscillator(samplerate, freq)
{
	var	self		= this,
		phase		= 0,
		p		= 0,
		FullPI		= Math.PI * 2,
		wavetable	= new Float32Array(1);
	this.frequency = 440;
	if (freq){
		this.frequency = freq;
	}
	this.phaseOffset = 0;
	this.pulseWidth = 0.5;
	this.waveShape = 0; // ['Sine', 'Triangle', 'Pulse', 'Sawtooth', 'Invert Sawtooth', 'Square']
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
		switch(this.waveShape){
			case 1:
				return this.triangle();
				break;
			case 2:
				return this.pulse();
				break;
			case 3:
				return this.sawtooth();
				break;
			case 4:
				return this.invSawtooth();
				break;
			case 5:
				return this.square();
				break;
			default:
				return this.sine();
		}
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
	this.triangle = function(){
		if (p < 0.5){
			return 4 * p - 1;
		}
		return 3 - 4 * p;
	};
	this.square = function(){
		return (p < 0.5) ? -1 : 1;
	};
	this.sawtooth = function(){
		return 1 - p * 2;
	};
	this.invSawtooth = function(){
		return p * 2 - 1;
	};
	this.pulse = function(){
		if (p < 0.5){
			if (p < 0.25){
				return p * 8 - 1;
			} else {
				return 1 - (p - 0.25) * 8;
			}
		}
		return -1;
	};
	this.wavetable = function(){
		return wavetable[Math.floor(p * wavetable.length)];
	};
}


var output = new Audio();
output.mozSetup(1, 44100 );

var pitches = {};

var notes = ['a','b','c','d','e','f' ,'g'];

for ( var i =0; i < notes.length; i +=1){
    var curr = notes[i];
    pitches[curr] = genPitch(freqs[curr]);
}

function playNote(note) {

    var buffer = pitches[note];
    output.mozWriteAudio(buffer);
    var millis = 1000;
    var date = new Date();
    var curDate = null;
    do { curDate = new Date(); }
    while(curDate-date < millis);

}



function playTones(){
    var notes = ['c','c','f','f','g','g' ,'f'];
    for (var i = 0; i < notes.length; i +=1){
        playNote(notes[i]);
    }
}