//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 								//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording

var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext;

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");

var voice = ""

var types = [
    {
        title: "Condo",
        keywords: {
            thaiKeywords: ["คอนโด","ห้องชุด","คอนโดหรู","ห้องเฟอนิเจอร์ครบ","อาคารชุด" ],
            engKeywords: ["condominium","condo"]
        }
    },
    {
        title: "Home",
        keywords: {
            thaiKeywords: ["บ้าน","บ้านชุด" ],
            engKeywords: ["House","Home"]
        }
    },
    {
        title: "1-3 MB",
        keywords: {
            thaiKeywords: ["หนึ่งล้าน","สองล้าน","สามล้าน","หนึ่งถึงสองล้าน","ราคาถูก"],
            engKeywords: ["1MB"]
        }
    },
    {
        title: "3-6 MB",
        keywords: {
            thaiKeywords: ["สี่ล้าน","หน้าล้าน","หกล้าน","สามถึงหกล้าน"],
            engKeywords: ["3MB"]
        }
    },
    {
        title: "6-9 MB",
        keywords: {
            thaiKeywords: ["หกล้าน","เจ็ดล้าน","แปดล้าน","เก้าล้าน"],
            engKeywords: ["6MB"]
        }
    },
    {
        title: "Saladaeng",
        keywords: {
            thaiKeywords: ["ศาลาแดง"],
            engKeywords: ["Saladaeng"]
        }
    },
    {
        title: "Sukhumvit",
        keywords: {
            thaiKeywords: ["สุขุมวิท"],
            engKeywords: ["Sukhumvit"]
        }
    },
    {
        title: "BTS",
        keywords: {
            thaiKeywords: ["บีทีเอส","รถไฟฟ้าบีทีเอส"],
            engKeywords: ["BTS"]
        }
    },
    {
        title: "MRT",
        keywords: {
            thaiKeywords: ["เอ็มอาร์ที","รถไฟฟ้าเอมอาร์ที"],
            engKeywords: ["MRT"]
        }
    },
    {
        title: "Ready to move in",
        keywords: {
            thaiKeywords: ["พร้อมอยู่"],
            engKeywords: ["Ready"]
        }
    },
    {
        title: "New",
        keywords: {
            thaiKeywords: ["ใหม่","กำลังสร้าง"],
            engKeywords: ["New"]
        }
    }
]
buildThaiDictionary();
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);

function startRecording() {
    var constraints = { audio: true, video:false }
	recordButton.disabled = true;
	stopButton.disabled = false;

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		audioContext = new AudioContext();
		gumStream = stream;
		input = audioContext.createMediaStreamSource(stream);
		rec = new Recorder(input,{numChannels:1,sampleRate: 48000});
		rec.record();
	}).catch(function(err) {
    	recordButton.disabled = false;
    	stopButton.disabled = true;
	});
}


function stopRecording() {
	stopButton.disabled = true;
	recordButton.disabled = false;
	rec.stop();
	gumStream.getAudioTracks()[0].stop();
	rec.exportWAV(createTextFromVoice);
}

function createTextFromVoice(blob) {
	var reader = new FileReader();
	reader.readAsDataURL(blob);
	reader.onloadend = function() {
		base64data = reader.result;
		requestFetch = {
			"audio": {
				"content": base64data.substr(base64data.indexOf(',') + 1)
			}
			,"config": {
				"enableAutomaticPunctuation": true,
				"sampleRateHertz": 48000,
				"encoding": "LINEAR16",
				"languageCode": "th-TH",
				"model": "default"
			}
		};

		var urlGoogleFetch = "https://speech.googleapis.com/v1p1beta1/speech:recognize?key=AIzaSyCJeVzrVnxnVxBiVAfVjMuNpNJpQ1Uu9FQ";
		//console.log("requestFetch > ",JSON.stringify(requestFetch));
		fetch(urlGoogleFetch, {
			method: 'post',
			body: JSON.stringify(requestFetch)
		}).then(function(response) {
				return response.json();
		}).then(function(data) {
			// console.log(data.results[0].alternatives[0].transcript);
            document.getElementById("recordingsResult").innerHTML= data.results[0].alternatives[0].transcript
            document.getElementById("tokenize").innerHTML= tokenize(data.results[0].alternatives[0].transcript).join('|');
            fuseText(tokenize(data.results[0].alternatives[0].transcript).join('|'));
		});
	 };
}

function fuseText(voiceText) {
	var options = {
		id: "title",
		shouldSort: true,
		tokenize: true,
		threshold: 0.8,
		location: 0,
		distance: 800,
		maxPatternLength: 500,
		minMatchCharLength: 1,
		keys: [
		  "title",
		  "keywords.thaiKeywords",
		  "keywords.engKeywords"
		]
	  };
	  var fuse = new Fuse(types, options);
	  var result = fuse.search(voiceText);
	  document.getElementById("searchResult").innerHTML= result
}