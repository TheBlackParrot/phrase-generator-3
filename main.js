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

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

function modifyNoun(noun, mod) {
	switch(mod) {
		case "plural":
			if(noun.indexOf("/") != -1) {
				return noun.split("/")[1]; // has a special plural form
			}

			if(noun.indexOf("!") != -1) {
				return noun.replace("!", ""); // plural is the same as singular
			}

			var lastChar = noun.slice(-1);
			var last2Chars = noun.slice(-2);

			if(hs.indexOf(last2Chars) != -1 || es.indexOf(lastChar) != -1) {
				noun += "es";
			} else if(lastChar == "y") {
				if(vowels.indexOf(noun.slice(-2, -1)) != -1) {
					noun += "s";
				} else {
					noun = noun.slice(0, -1) + "ies";
				}
			} else {
				noun += "s";
			}

			return noun;
			break;

		case "possessive":
			// hmmm
			var lastChar = noun.slice(-1);
			var secondToLastChar = noun.slice(-2, -1);

			if(lastChar == "s" && vowels.indexOf(secondToLastChar) != -1) {
				return noun + "'";
			}

			return noun + "'s";
			break;
	}
}

function modifyVerb(verb, mod) {
	switch(mod) {
		case "ing":
			if(verb.indexOf("/") != -1) {
				verb = verb.split("/")[0]
			}

			if(verb.slice(-1) == "e") {
				if(vowels.indexOf(verb.slice(-2, -1)) != -1) {
					return verb.slice(0, -2) + "ying";
				} else {
					return verb.slice(0, -1) + "ing";
				}
			} else if(vowels.indexOf(verb.slice(-2, -1)) != -1 && vowels.indexOf(verb.slice(-1)) == -1) {
				if(verb.slice(-1) == "r") {
					return verb + "ing";
				} else if(verb.slice(-1) == "c") {
					return verb + "king";
				} else {
					// christ
					if(vowels.indexOf(verb.slice(-3, -2)) != -1) {
						return verb + "ing";
					} else {
						return verb + verb.slice(-1) + "ing";
					}
				}
			}

			return verb + "ing";
			break;

		case "past":
			if(verb.indexOf("/") != -1) {
				return verb.split("/")[1];
			}

			if(verb.slice(-1) == "e") {
				return verb + "d";
			} else if(verb.slice(-1) == "y" && vowels.indexOf(verb.slice(-2, -1)) == -1) {
				return verb.slice(0, -1) + "ied";
			} else if(verb.slice(-1) == "c") {
					return verb + "ked";
			} else if(vowels.indexOf(verb.slice(-1)) == -1 && vowels.indexOf(verb.slice(-2, -1)) != -1) {
				if(verb.slice(-3, -2) == verb.slice(-4, -3) || (vowels.indexOf(verb.slice(-3, -2)) != -1 && verb.slice(-3, -2) == verb.slice(-2, -1))) {
					// extreme fringe case: the game, the movie
					return verb + "ed";
				} else {
					return verb + verb.slice(-1) + "ed";
				}
			}

			return verb + "ed";
			break;

		case "s":
			if(hs.indexOf(verb.slice(-2)) != -1) {
				return verb + "es";
			}

			return verb + "s";
			break;

		case "future":
			return "will " + verb;
			break;
	}
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
			list = lists.nouns;
			break;
	}
	chosen = list[getRandomInt(0, list.length)];
	//console.log("NOUN: " + chosen);

	if(!mods.length) {
		if(chosen.indexOf("/") != -1) {
			return chosen.split("/")[0];
		} else {
			return chosen.replace("!", "");
		}
	}

	mods.map(function(mod) {
		//console.log("MOD: " + mod);
		chosen = modifyNoun(chosen, mod);
	});

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
	let chosen = lists.verbs[getRandomInt(0, lists.verbs.length)];

	if(!mods.length) {
		if(chosen.indexOf("/") != -1) {
			return chosen.split("/")[0];
		} else {
			return chosen.replace("!", "");
		}
	}

	mods.map(function(mod) {
		//console.log("MOD: " + mod);
		chosen = modifyVerb(chosen, mod);
	});

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
			return getNoun(mods.slice(1), mods[0]) + ending;
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
			return getVerb(mods.slice(1)) + ending;
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