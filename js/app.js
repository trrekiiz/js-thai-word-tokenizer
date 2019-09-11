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
            thaiKeywords: ["บ้าน","บ้านชุด","เลี้ยงสัตว์"],
            engKeywords: ["House","Home"]
        }
    },
    {
        title: "1-3 MB",
        keywords: {
            thaiKeywords: ["ราคาถูก","ไม่เกินสามล้าน", "1 ล้าน", "2 ล้าน", "3 ล้าน","ราคาถูกมาก"],
            engKeywords: ["1MB", "2MB", "3MB", "one million", "two million", "tree million", "1 million", "2 million", "3 million"]
        }
    },
    {
        title: "3-6 MB",
        keywords: {
            thaiKeywords: ["สี่ล้าน","ห้าล้าน","หกล้าน","สามถึงหกล้าน", "ไม่เกินหกล้าน", "ห้าหกล้าน", "น้อยกว่าเจ็ดล้าน", "4 ล้าน", "5 ล้าน", "6 ล้าน"],
            engKeywords: ["4MB", "5MB", "6MB", "4 million", "5 million", "6 million", "four million", "five million", "six million"]
        }
    },
    {
        title: "6-9 MB",
        keywords: {
            thaiKeywords: ["เจ็ดล้าน","แปดล้าน","เก้าล้าน", "ไม่เกินเก้าล้าน", "ไม่ถึงสิบล้าน", "น้อยกว่าสิบล้าน", "7 ล้าน", "8 ล้าน", "9 ล้าน"],
            engKeywords: ["7MB", "8MB", "9MB", "7 million", "8 million", "9 million", "seven million", "eight million", "nine million"]
        }
    },
    {
        title: "9-12 MB",
        keywords: {
            thaiKeywords: ["สิบล้าน", "สิบเอ็ดล้าน", "สิบสองล้าน", "สิบสามล้าน", "เก้าถึงสิบล้าน", "ไม่เกินสิบสองล้าน", "ประมาณสิบล้าน" ,
                "ไม่ถึงสิบสามล้าน", "10 ล้าน", "11 ล้าน", "12 ล้าน"],
            engKeywords: ["10MB", "11MB", "12MB", "10 million", "11 million", "12 million", "ten million", "eleven million", "twelve million"]
        }
    },
    {
        title: "12-15 MB",
        keywords: {
            thaiKeywords: ["สิบสามล้าน","สิบสี่ล้าน", "สิบห้าล้าน", "ไม่ถึงสิบหกล้าน", "สิบสองถึงสิบห้าล้าน", "3 ล้าน", "14 ล้าน", "15 ล้าน"],
            engKeywords: ["13MB", "14MB", "15MB", "13 million", "14 million", "15 million", "thirteen million", "fourteen million", 
                "fifteen million"]
        }
    },
    {
        title: "15-20 MB",
        keywords: {
            thaiKeywords: ["สิบหกล้าน","สิบเจ็ดล้าน", "สิบแปดล้าน", "สิบเก้าล้าน", "ยี่สิบล้าน", "สิบห้าถึงยี่สิบล้าน", "16 ล้าน", "17 ล้าน", "18 ล้าน", "19 ล้าน", "20 ล้าน"],
            engKeywords: ["16MB", "17MB", "18MB", "19MB", "20MB", "16 million", "17 million", "18 million", "19 million", "20 million",
                 "sixteen million", "seventeen million", "eighteen million", "nineteen million", "twenty million"]
        }
    },
    {
        title: "20-30 MB",
        keywords: {
            thaiKeywords: ["ยี่สิบล้าน","ยี่สิบเอ็ดล้าน", "ยี่สิบสองล้าน", "ยี่สิบสามล้าน", "ยี่สิบสี่ล้าน", "ยี่สิบห้าล้าน", "ยี่สิบหกล้าน", "ยี่สิบเจ็ดล้าน", 
                "ยี่สิบแปดล้าน", "ยี่สิบเก้าล้าน", "สามสิบล้าน", "ถึงสามสิบล้าน", "21 ล้าน", "22 ล้าน", "23 ล้าน", "24 ล้าน", "25 ล้าน", 
                "26 ล้าน", "27 ล้าน", "28 ล้าน", "29 ล้าน", "30 ล้าน","ใหญ่ๆ","หรูหรา"],
            engKeywords: ["21MB", "22MB", "23MB", "24MB", "25MB", "26MB", "27MB", "28MB", "29MB", "30MB", 
                "21 million", "22 million", "23 million", "24 million", "25 million", "26 million", "27 million", "28 million", 
                "29 million", "30 million"]
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
        title: "Siam",
        keywords: {
            thaiKeywords: ["สยาม"],
            engKeywords: ["Siam"]
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
            thaiKeywords: ["เอ็มอาร์ที","รถไฟฟ้าเอมอาร์ที", "รถไฟใต้ดิน", "รถไฟฟ้าใต้ดิน"],
            engKeywords: ["MRT"]
        }
    },
    {
        title: "Ready to move in",
        keywords: {
            thaiKeywords: ["พร้อมอยู่", "เข้าอยู่ได้เลย"],
            engKeywords: ["Ready"]
        }
    },
    {
        title: "New",
        keywords: {
            thaiKeywords: ["ใหม่"],
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
            document.getElementById("tokenize").innerHTML= tokenize(data.results[0].alternatives[0].transcript).join(' ');
            fuseText(tokenize(data.results[0].alternatives[0].transcript).join(' '));
		});
	 };
}

function fuseText(voiceText) {
	var options = {
		id: "title",
		shouldSort: true,
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