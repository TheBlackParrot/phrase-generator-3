//const lists = require("./lists.json");
const lists = {
	nouns: require("./nouns.json"),
	verbs: require("./verbs.json"),
	adjectives: require("./adjectives.json"),
	adverbs: require("./adverbs.json"),
	propers: require("./propers.json"),
	amounts: require("./amounts.json"),
	phrases: require("./phrases.json")
}
const vowels = ["a", "e", "i", "o", "u"];
const hs = ["ch", "sh"];
const es = ["o", "x", "s"];
const articles = ["a", "the"];
const marks = ["?", "!", ".", ","];

class Word {
	constructor(word, mods = [], ending = "") {
		this.word = word;
		this.final = word;
		this.ending = ending;
		this.mods = mods;
	}

	get modified() {
		return this.final + this.ending;
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

class Adjective extends Word {
	constructor(word, ending = "") {
		super(word, [], ending);
	}
}

class Adverb extends Word {
	constructor(word, ending = "") {
		super(word, [], ending);
	}
}

class Amount extends Word {
	constructor(word, ending = "") {
		// these aren't really words but it'll work fine
		super(word, [], ending);
	}
}

class Article extends Word {
	constructor(word, ending = "") {
		super(word, [], ending);
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

	return new Noun(list[getRandomInt(0, list.length)], type, mods);
}

function getAdjective() {
	return new Adjective(lists.adjectives[getRandomInt(0, lists.adjectives.length)]);
}

function getAdverb() {
	return new Adverb(lists.adverbs[getRandomInt(0, lists.adverbs.length)]);
}

function getVerb(mods) {
	let verbs = Object.keys(lists.verbs);
	return new Verb(verbs[getRandomInt(0, verbs.length)], mods);
}

function getAmount() {
	return new Amount(lists.amounts[getRandomInt(0, lists.amounts.length)]);
}

function parseElement(element) {
	let ending = "";
	if(marks.indexOf(element.slice(-1)) != -1) {
		ending = element.slice(-1);
		element = element.slice(0, -1);
	}

	let mods = element.split(":");
	let part;

	switch(mods[0]) {
		case "person":
		case "place":
		case "item":
		case "noun":
			part = getNoun(mods.slice(1), mods[0]);
			break;

		case "article":
			part = "=article";
			break;

		case "adjective":
			part = getAdjective();
			break;

		case "adverb":
			part = getAdverb();
			break;

		case "verb":
			part = getVerb(mods.slice(1));
			break;

		case "amount":
			part = getAmount();
			break;

		case "number":
			part = new Word(getRandomInt(0, 10000).toString());
			break;

		default:
			part = new Word(element);
			break;
	}

	if(ending) {
		part.ending = ending;
	}
	return part;
}

function reparseElements(elements) {
	// articles need to be done after the rest of the conversion
	for(let idx = 0; idx < elements.length; idx++) {
		let element = elements[idx];

		if(typeof element === "string") {
			if(element == "=article") {
				let art = elements[idx] = new Article(articles[getRandomInt(0, articles.length)]);
				if(art.word == "a") {
					// loop through all elements for plural nouns, set to "the" if any are found
					for(let idxx = 0; idxx < elements.length; idxx++) {
						if(elements[idxx].constructor.name == "Noun") {
							if(elements[idxx].plural) {
								art.word = art.final = "the";
							}
						}
					}

					if(art.word != "the") {
						if(vowels.indexOf(elements[idx+1].final.slice(0, 1)) != -1) {
							art.word = art.final = "an";
						}
					}
				}
			}
			continue;
		}
	}

	return elements;
}

function getPhraseElements() {
	let choices = [];
	lists.phrases.map(function(phraseData) {
		choices = choices.concat(Array(phraseData.chance).fill(phraseData)); // wew
	});

	return choices[getRandomInt(0, choices.length)];
}

function getPhrase() {
	let data = getPhraseElements();
	let elements = data.choices[getRandomInt(0, data.choices.length)].split(" ");
	let parts = [];

	elements.map(function(element) {
		parts.push(parseElement(element));
	});

	parts = reparseElements(parts);

	let mods = [];
	if("modifiers" in data) {
		mods = data.modifiers;
	}

	if(mods.indexOf("capitalize") != -1) {
		parts.map(function(element) {
			element.final = element.final.slice(0, 1).toUpperCase() + element.final.slice(1);
		});
	}

	let final = [];
	parts.map(function(part) {
		final.push(part.modified);
	});

	if("prepend" in data) {
		final = [data.prepend].concat(final);
	}

	if(mods.indexOf("nospace") != -1) {
		final = final.join("");
	} else {
		final = final.join(" ");
	}

	if(!getRandomInt(0, 200)) {
		let newFinal = "";
		for(let idx = 0; idx < final.length; idx++) {
			newFinal += idx % 2 ? final.charAt(idx).toUpperCase() : final.charAt(idx);
		}
		final = newFinal;
	}

	return final;
}

console.log(getPhrase());