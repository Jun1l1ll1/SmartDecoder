
import DATA from './data.json' assert { type: 'json' };
import EN_WORDS from './word_dictionaries/EN_words.json' assert { type: 'json' }; //NOTE: .I and .Y is the same words

const ALPHABETH = "abcdefghijklmnopqrstuvwxyz";
const NO_ALPHA = "æøå"; //TODO: add a norwegian mode

const SYMBOL_REGEX = /-|,|\.|:|;|"|!|#|¤|%|&|\/|\(|\)|=|\?|<|>|_|\^|'|\*\s/;

// Using: https://detectlanguage.com/private 
const apiKey = '41fd820477f21824ffad8f7e44e44b3e';
const request = {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({q: 'Test'})
};



document.getElementById("decode_btn").addEventListener("click", (event) => {
    smartDecode();
});



function unDecoded(input) {
    let output = [];

    // Check confidence
    request.body = JSON.stringify({q: input});
    fetch('https://ws.detectlanguage.com/0.2/detect', request)
        .then(res => res.json())
        .then(data => {
            console.log(data.data.detections, input);
            if (data.data.detections.length > 0 && data.data.detections[0].isReliable && data.data.detections[0].confidence >= 3) {
                output.push({
                    "output": input,
                    "percent": data.data.detections[0].confidence,
                    "methode": ["Not decoded"],
                    "lang": data.data.detections[0].language
                })
            }
        })
        .catch(err => {
            console.error(err);
        });

    return output;
}

function alphabethSift(input) {
    function loopAlpha(lang, already_run_en=false) {
        let alphabeth = "";
        if (lang == "no") {
            alphabeth = ALPHABETH+NO_ALPHA;
        } else {
            alphabeth = ALPHABETH;
        }

        for (let i = 1; i < alphabeth.length; i++) { // Loop all the shifts
            
            let new_sentence = "";
            let ignored = "";
            for (let char of input) {
                if (alphabeth.indexOf(char.toLowerCase()) == -1) {
                    new_sentence += char;
                    if (!SYMBOL_REGEX.test(char)) {
                        ignored += char;
                    }
                } else {
                    if (char === char.toUpperCase()) { // Is upper case
                        new_sentence += alphabeth[
                            alphabeth.indexOf(char.toLowerCase()) + i - (alphabeth[alphabeth.indexOf(char.toLowerCase()) + i] == undefined ? alphabeth.length : 0)
                        ].toUpperCase();
                    } else {
                        new_sentence += alphabeth[
                            alphabeth.indexOf(char.toLowerCase()) + i - (alphabeth[alphabeth.indexOf(char.toLowerCase()) + i] == undefined ? alphabeth.length : 0)
                        ];
                    }
                }
            }
    
            // Check confidence
            if (((lang != "en" || checkOnDictionary(new_sentence)) && (lang != "no" || !already_run_en || (/æ|ø|å/).test(new_sentence))) ) {
                console.log(lang, !already_run_en, (/æ|ø|å/).test(new_sentence));
                request.body = JSON.stringify({q: new_sentence});
                fetch('https://ws.detectlanguage.com/0.2/detect', request)
                    .then(res => res.json())
                    .then(data => {
                        console.log(data.data.detections, new_sentence);
                        if (data.data.detections.length > 0 && data.data.detections[0].isReliable && data.data.detections[0].confidence >= 3) {
                            let shift_text = i <= Math.abs(i-ALPHABETH.length) ? i+" shifts left" : Math.abs(i-ALPHABETH.length)+" shifts right";
                            outputs.push({
                                "output": new_sentence,
                                "percent": data.data.detections[0].confidence,
                                "methode": ["Caesar cipher", shift_text, "Ignored "+ignored],
                                "lang": data.data.detections[0].language
                            })
                        }
                    })
                    .catch(err => {
                        console.error(err);
                    });
            }
        }
    }

    let outputs = [];
    let EN = document.getElementById("en").checked;
    let NO = document.getElementById("no").checked;
    console.log(EN, NO);

    if (EN) {
        loopAlpha("en");
    }
    if (NO) {
        loopAlpha("no", EN);
    }

    return outputs;
}



function smartDecode() {
    function waitFor() {
        if ((
                shift_outputs.length > 0 
                && shift_outputs.length > 0
            )
            || times_waited >= 25) { // 50 trys and 6,25 sec
                showOutputs([
                    ...undecoded_output,
                    ...shift_outputs
                ], input);
        } else {
            times_waited += 1;
            setTimeout(waitFor, 250);
        }
    }
    // Hide last results and make decode button gone (so noone is spamming)
    document.getElementById("decode_btn").className = "disappear";
    document.getElementById("prompt_cont").innerHTML = "";
    document.getElementById("output_cont").innerHTML = "";

    let input = document.getElementById("code_input").value.replace(/ +/g, " ");

    let undecoded_output = unDecoded(input);
    let shift_outputs = alphabethSift(input);
    
    let times_waited = 0;
    waitFor();
}

function showOutputs(outputs=[], input) {
    outputs.sort((a, b) => b.percent - a.percent);

    let prompt_cont = document.getElementById("prompt_cont");
    let output_cont = document.getElementById("output_cont");

    prompt_cont.innerHTML = `
        <div class="prompt">
            <p>Showing results for:</p>
            <p>`+input+`</p>
        </div>
    `;

    for (let output of outputs) {
        let accuracy_class = (output.percent >= 10 ? "very_accurate" : output.percent >= 6.5 ? "bit_accurate" : output.percent >= 5 ? "meh_accurate" : "not_accurate");
        output_cont.innerHTML += `
            <div class="output_item `+accuracy_class+`">
                <p class="solution">`+output.output+`</p>
                <p>Certainty: `+Math.round(output.percent*100)/100+`</p>
                <p>Language: `+output.lang+`</p>
                <p>`+String(output.methode).replaceAll(",", " | ")+`</p>
            </div>
        `;
    }
    
    // Show decode button for further use
    document.getElementById("decode_btn").className = "";
}

function checkOnDictionary(sentence) {
    let valid_word = 0;
    for (let word of sentence.split(" ")) { // Remove duplicate spaces
        if (word == "") {
            sentence[sentence.length-1] == " " ? sentence = sentence.substring(0, sentence.length - 1) : '';
            continue;
        }
        if (EN_WORDS[word[0].toUpperCase()].includes(word.replace(/[^a-zA-Z\d\s]/, "").toLowerCase())) { // Check if in dictionary
            valid_word += 1;
        }
    }
    if (valid_word/sentence.split(" ").length >= 1/3) { // Only show if above 33.3% are words
        return valid_word/sentence.split(" ").length*100;
    }

    return false;
}
