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
        title: "Condominium",
        type: "residence_type",
        keywords: {
            thaiKeywords: ["คอนโด","ห้องชุด","คอนโดหรู","ห้องเฟอนิเจอร์ครบ"],
            engKeywords: ["condominium","condo"]
        }
    },
    {
        title: "Town Home",
        type: "residence_type",
        keywords: {
            thaiKeywords: ["ทาวน์โฮม","ออฟฟิต","โฮมออฟฟิต","เปิดบริษัท" ],
            engKeywords: ["Town Home","Home Office"]
        }
    },
    {
        title: "Shop House",
        type: "residence_type",
        keywords: {
            thaiKeywords: ["อาคารพานิชย์","อาคารชุด","ขายของ","ช็อปเฮ้าส์","เปิดธุรกิจ" ],
            engKeywords: ["Shop House"]
        }
    },
    {
        title: "Single House",
        type: "residence_type",
        keywords: {
            thaiKeywords: ["บ้านเดี่ยว","บ้าน","บ้านพร้อมเฟอร์นิเจอร์"],
            engKeywords: ["Single House"]
        }
    },
    {
        title: "1-3 MB",
        type: "price_range",
        keywords: {
            thaiKeywords: ["ราคาถูก","ไม่เกินสามล้าน", "1", "2", "3"],
            engKeywords: ["1MB", "2MB", "3MB", "one million", "two million", "tree million", "1 million", "2 million", "3 million"]
        }
    },
    {
        title: "3-6 MB",
        type: "price_range",
        keywords: {
            thaiKeywords: ["4","5","6","ปานกลาง"],
            engKeywords: ["4MB", "5MB", "6MB", "4 million", "5 million", "6 million", "four million", "five million", "six million"]
        }
    },
    {
        title: "6-9 MB",
        type: "price_range",
        keywords: {
            thaiKeywords: ["7", "8", "9","ปานกลาง"],
            engKeywords: ["7MB", "8MB", "9MB", "7 million", "8 million", "9 million", "seven million", "eight million", "nine million"]
        }
    },
    {
        title: "9-12 MB",
        type: "price_range",
        keywords: {
            thaiKeywords: ["10", "11", "12","กว้างขวาง"],
            engKeywords: ["10MB", "11MB", "12MB", "10 million", "11 million", "12 million", "ten million", "eleven million", "twelve million"]
        }
    },
    {
        title: "12-15 MB",
        type: "price_range",
        keywords: {
            thaiKeywords: ["13 ล้าน", "14 ล้าน", "15 ล้าน", "รวย","หรูหรา","หรู"],
            engKeywords: ["13MB", "14MB", "15MB", "13 million", "14 million", "15 million", "thirteen million", "fourteen million", 
                "fifteen million"]
        }
    },
    {
        title: "ท่าพระ",
        type: "location",
        keywords: {
            thaiKeywords: ["ท่าพระ"],
            engKeywords: ["Trapra"]
        }
    },
    {
        title: "บางแค",
        type: "location",
        keywords: {
            thaiKeywords: ["บางแค"],
            engKeywords: ["Bangkea"]
        }
    },
    {
        title: "วุฒากาศ",
        type: "location",
        keywords: {
            thaiKeywords: ["วุฒากาศ"],
            engKeywords: ["Wutthakat"]
        }
    },
    {
        title: "ลพบุรี",
        type: "location",
        keywords: {
            thaiKeywords: ["ลพบุรี"],
            engKeywords: ["Lopburi"]
        }
    },
    {
        title: "สุขุมวิท101",
        type: "location",
        keywords: {
            thaiKeywords: ["สุขุมวิท101"],
            engKeywords: ["Sukhumvit 101"]
        }
    },
    {
        title: "สุขุมวิท",
        type: "location",
        keywords: {
            thaiKeywords: ["สุขุมวิท"],
            engKeywords: ["Sukhumvit"]
        }
    },
    {
        title: "BTS บางหว้า",
        type: "transport_link",
        keywords: {
            thaiKeywords: ["บางหว้า", "BTS บางหว้า"],
            engKeywords: ["Bangwa"]
        }
    },
    {
        title: "BTS วงเวียนใหญ่",
        type: "transport_link",
        keywords: {
            thaiKeywords: ["BTS วงเวียนใหญ่","วงเวียนใหญ่"],
            engKeywords: ["BTS Wongwian yai"]
        }
    },
    {
        title: "BTS บางจาก",
        type: "transport_link",
        keywords: {
            thaiKeywords: ["BTS บางจาก","บางจาก"],
            engKeywords: ["BTS Bangjak"]
        }
    },
    {
        title: "BTS ปุณณวิถี",
        type: "transport_link",
        keywords: {
            thaiKeywords: ["BTS ปุณณวิถี","ปุณณวิถี"],
            engKeywords: ["BTS Punnawithi"]
        }
    },
    {
        title: "Ready to move",
        type: "project_status",
        keywords: {
            thaiKeywords: ["พร้อมอยู่", "เข้าอยู่ได้เลย"],
            engKeywords: ["Ready"]
        }
    },
    {
        title: "Sold",
        type: "project_status",
        keywords: {
            thaiKeywords: ["ขายแล้ว", "หมดแล้ว"],
            engKeywords: ["Sold"]
        }
    },
    {
        title: "New",
        type: "project_status",
        keywords: {
            thaiKeywords: ["ใหม่"],
            engKeywords: ["New"]
        }
    }
];

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
            let tokenizeWord = tokenize(data.results[0].alternatives[0].transcript).join('|');
            console.log("token : ",tokenizeWord);
            fuseText(tokenize(data.results[0].alternatives[0].transcript).join('|'));
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