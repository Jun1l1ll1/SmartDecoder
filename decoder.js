
import DATA from './data.json' assert { type: 'json' };

const ALPHABETH = "abcdefghijklmnopqrstuvwxyz";
const NO_ALPHA = "æøå";

console.log(DATA.EN_words);
alphabethSift(document.getElementById("code_input").value);


function alphabethSift(input) {
    for (let char of input) {
        console.log(char.toLowerCase());
    }
}
