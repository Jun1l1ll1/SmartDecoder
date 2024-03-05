
import DATA from './data.json' assert { type: 'json' };
import EN_WORDS from './word_dictionaries/EN_words.json' assert { type: 'json' }; //NOTE: .I and .Y is the same words

const ALPHABETH = "abcdefghijklmnopqrstuvwxyz";
const NO_ALPHA = "æøå"; //TODO: add a norwegian mode



document.getElementById("decode_btn").addEventListener("click", (event) => {
    smartDecode();
});



function unDecoded(input) {
    let output = [];
    let validity = checkValidity(input);
    if (validity) {
        output.push({
            "output": input,
            "percent": validity,
            "methode": ["Not decoded"]
        })
    }

    return output;
}

function alphabethSift(input) {
    let outputs = [];
    let NO = /æ|ø|å/.test(input); //TODO: use this
    console.log(NO);
    for (let i = 1; i < 26; i++) { // Loop all the shifts
        let new_sentence = "";
        for (let char of input) {
            if (ALPHABETH.indexOf(char.toLowerCase()) == -1) {
                new_sentence += char;
            } else {
                if (char === char.toUpperCase()) { // Is upper case
                    new_sentence += ALPHABETH[
                        ALPHABETH.indexOf(char.toLowerCase()) + i - (ALPHABETH[ALPHABETH.indexOf(char.toLowerCase()) + i] == undefined ? ALPHABETH.length : 0)
                    ].toUpperCase();
                } else {
                    new_sentence += ALPHABETH[
                        ALPHABETH.indexOf(char.toLowerCase()) + i - (ALPHABETH[ALPHABETH.indexOf(char.toLowerCase()) + i] == undefined ? ALPHABETH.length : 0)
                    ];
                }
            }
        }

        let validity = checkValidity(new_sentence);
        if (validity) {
            let shift_text = i <= Math.abs(i-ALPHABETH.length) ? i+" shifts right" : Math.abs(i-ALPHABETH.length)+" shifts left";
            outputs.push({
                "output": new_sentence,
                "percent": validity,
                "methode": ["Caesar cipher", shift_text]
            })
        }
    }
    return outputs;
}



function smartDecode() {
    let input = document.getElementById("code_input").value.replace(/ +/g, " ");
    showOutputs([...unDecoded(input), ...alphabethSift(input)], input);
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

    output_cont.innerHTML = "";

    for (let output of outputs) {
        let accuracy_class = (output.percent >= 95 ? "very_accurate" : output.percent >= 75 ? "bit_accurate" : output.percent >= 50 ? "meh_accurate" : "not_accurate");
        output_cont.innerHTML += `
            <div class="output_item `+accuracy_class+`">
                <p class="solution">`+output.output+`</p>
                <p>`+Math.round(output.percent*100)/100+`% certainty</p>
                <p>`+String(output.methode).replace(",", " | ")+`</p>
            </div>
        `;
    }
}

function checkValidity(sentence) {
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
    if (valid_word/sentence.split(" ").length >= 0.5) { // Only show if above 50% are words
        return valid_word/sentence.split(" ").length*100;
    }

    return false;
}
