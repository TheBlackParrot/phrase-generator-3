const lists = require("./lists.json");
const vowels = ["a", "e", "i", "o", "u"];
const hs = ["ch", "sh"];
const es = ["o", "x", "s"];
const articles = ["a", "the"];
const marks = ["?", "!", "."];

//
//
//
//
//			TURN ALL OF THE ELEMENTS INTO CLASSES!!!
//			EXTREME FRINGE CASE: "a vast keyboards died slowly"
//			need to check for plural nouns in articles where the noun isn't immediately following an article, e.g. "article adjective noun"
//			would probably help with other stuff in the long run too i suppose
//
//
//
//

// actually just turn the lists into objects fuck it ugh fuck english
// ... nouns are probably ok, verbs are not, turn verbs into objects: {"present": "run", "past": "ran", "ing": "running", "s": "runs"}

class Word {
	constructor(word, mods = [], ending = "") {
		this.word = word;
		this.ending = ending;
		this.mods = mods;
	}
}

class Noun extends Word {
	constructor(word, type = "common", mods = [], ending = "") {
		super(word, mods, ending);

		this.plural = false;
		this.possessive = false;
		this.type = type;

		this.final = word.replace("!", "");

		if(mods.length) {
			let _ = this;
			mods.map(function(mod) {
				_.modify(mod);
			});
		} else {
			if(word.indexOf("/") != -1) {
				this.final = word.split("/")[0];
			}			
		}

		this.ending = "";
	}

	modify(mod) {
		let word = this.final;

		switch(mod) {
			case "plural":
				this.plural = true;

				if(word.indexOf("/") != -1) {
					this.final = word.split("/")[1]; // has a special plural form
					return this.final;
				}

				if(word.indexOf("!") != -1) {
					this.final = word.replace("!", ""); // plural is the same as singular
					return this.final;
				}

				var lastChar = word.slice(-1);
				var last2Chars = word.slice(-2);

				if(hs.indexOf(last2Chars) != -1 || es.indexOf(lastChar) != -1) {
					word += "es";
				} else if(lastChar == "y") {
					if(vowels.indexOf(word.slice(-2, -1)) != -1) {
						word += "s";
					} else {
						word = word.slice(0, -1) + "ies";
					}
				} else {
					word += "s";
				}

				this.final = word;
				break;

			case "possessive":
				this.possessive = true;

				var lastChar = word.slice(-1);
				var secondToLastChar = word.slice(-2, -1);

				if(lastChar == "s" && vowels.indexOf(secondToLastChar) != -1) {
					this.final = word + "'";
					return this.final;
				}

				this.final = word + "'s";
				return this.final;
				break;
		}		
	}
}

class Verb extends Word {
	constructor(word, mods = [], ending = "") {
		super(word, mods, ending);

		this.final = word;
		this.tense = "present";

		if(mods.length) {
			let _ = this;
			mods.map(function(mod) {
				_.modify(mod);
			});
		}
	}

	modify(mod) {
		switch(mod) {
			case "s":
			case "past":
			case "ing":
			case "future":
				this.tense = mod;
				this.final = lists.verbs[this.word][mod];
				return this.final;
				break;

			default:
				return this.final;
				break;
		}
	}
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

function getNoun(mods, type) {
	let chosen = "";
	let list = [];

	switch(type) {
		case "person":
			list = lists.propers.people.concat(lists.propers.fictional_people);
			break;

		case "fictional_person":
			list = lists.propers.fictional_people;
			break;

		case "real_person":
			list = lists.propers.people;
			break;

		case "place":
			list = lists.propers.places.concat(lists.propers.fictional_places);
			break;

		case "fictional_place":
			list = lists.propers.fictional_places;
			break;

		case "real_place":
			list = lists.propers.places;
			break;

		case "item":
			list = lists.propers.items;
			break;

		default:
			type = "common";
			list = lists.nouns;
			break;
	}
	chosen = new Noun(list[getRandomInt(0, list.length)], type, mods);

	return chosen;
}

function getAdjective() {
	// ez clap
	return lists.adjectives[getRandomInt(0, lists.adjectives.length)];
}

function getAdverb() {
	// too ez
	return lists.adverbs[getRandomInt(0, lists.adverbs.length)];
}

function getVerb(mods) {
	let verbs = Object.keys(lists.verbs);
	let chosen = new Verb(verbs[getRandomInt(0, verbs.length)], mods);

	return chosen;
}

function getAmount() {
	// plz
	return lists.amounts[getRandomInt(0, lists.amounts.length)];
}

function parseElement(element) {
	let ending = "";
	if(marks.indexOf(element.slice(-1)) != -1) {
		ending = element.slice(-1);
		element = element.slice(0, -1);
	}

	let mods = element.split(":");

	switch(mods[0]) {
		case "person":
		case "place":
		case "item":
		case "noun":
			return getNoun(mods.slice(1), mods[0]).final + ending;
			break;

		case "article":
			return "=article";
			break;

		case "adjective":
			return getAdjective() + ending;
			break;

		case "adverb":
			return getAdverb() + ending;
			break;

		case "verb":
			return getVerb(mods.slice(1)).final + ending;
			break;

		case "amount":
			return getAmount() + ending;
			break;

		default:
			return element + ending;
			break;
	}
}

function reparseElements(elements) {
	// articles need to be done after the rest of the conversion

	for(let idx = 0; idx < elements.length; idx++) {
		let element = elements[idx];

		if(element == "=article") {
			let chosen = articles[getRandomInt(0, articles.length)];

			if(chosen == "a") {
				// articles should never be last or next together, should be fine to ignore those checks
				let next = elements[idx+1];
				if(vowels.indexOf(next.slice(0, 1)) != -1) {
					// unsure of a way to check sounds, this should be ok *for now*
					chosen = "an";
				} else if(next.slice(-1) == "s") {
					chosen = "the";
				}
			}

			elements[idx] = chosen;
		}
	}

	return elements;
}

function getPhraseElements() {
	let choices = [];
	lists.phrases.map(function(phraseData) {
		choices = choices.concat(Array(phraseData.chance).fill(phraseData.choices)); // wew
	});

	let set = choices[getRandomInt(0, choices.length)];
	return set[getRandomInt(0, set.length)].split(" ");
}

function getPhrase() {
	let elements = getPhraseElements();
	let preFinal = [];
	var final = "";
	
	elements.map(function(element) {
		preFinal.push(parseElement(element))
	});

	final = reparseElements(preFinal).join(" ");

	if(!getRandomInt(0, 200)) {
		let newFinal = "";
		for(let idx = 0; idx < final.length; idx++) {
			newFinal += idx % 2 ? final.charAt(idx).toUpperCase() : final.charAt(idx);
		}
		final = newFinal;
	}

	return final;
}

for(let x = 0; x < 30; x++) {
	console.log(getPhrase());
}