
import DATA from './data.json' assert { type: 'json' };
import EN_WORDS from './word_dictionaries/EN_words.json' assert { type: 'json' }; //NOTE: .I and .Y is the same words

const ALPHABETH = "abcdefghijklmnopqrstuvwxyz";
const NO_ALPHA = "æøå"; //TODO: add a norwegian mode



showOutputs(alphabethSift(document.getElementById("code_input").value));



function alphabethSift(input) {
    let outputs = [];
    for (let i = 0; i < 26; i++) { // Loop all the shifts
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
        let valid_word = 0;
        for (let word of new_sentence.split(" ")) {
            if (EN_WORDS[word[0].toUpperCase()].includes(word.replace(/[^a-zA-Z\d\s]/, "").toLowerCase())) { // Check if in dictionary
                valid_word += 1;
            }
        }
        if (valid_word/new_sentence.split(" ").length >= 0.5) { // Only show if above 50% are words
            outputs.push({
                "output": new_sentence,
                "percent": valid_word/new_sentence.split(" ").length*100
            })
        }
    }
    return outputs;
}



function showOutputs(outputs=[]) {
    outputs.sort((a, b) => b.percent - a.percent);

    let output_cont = document.getElementById("output_cont");
    output_cont.innerHTML = "";
    for (let output of outputs) {
        output_cont.innerHTML += `
            <div class="output_item">
                <p>`+output.output+`</p>
                <p>`+Math.round(output.percent*100)/100+`% certainty</p>
            </div>
        `;
    }
}
