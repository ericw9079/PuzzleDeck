/**
 * Wordle puzzle for Puzzledeck
 * © ericw9079 2024
 */
const fs = require("fs");

let words = [];
let word = "";
let guesses = 0;

/** 
 * Called whenever the puzzle is loaded
 */
const init = () => {
	const data = fs.readFileSync("./words/5.txt",{encoding:'utf-8'});
	words = data.trim().split("\n");
};

/**
 * Called whenever a puzzle is started
 * @param {ChatContext} context - Chat context for the start command
 */
const start = (context) => {
	context.say('Wordle is starting. Use "!guess word" to make a guess.');
	const ind = Math.floor(Math.random() * words.length);
	word = words[ind];
	guesses = 0;
	context.running = true;
};

/**
 * Called whenever a puzzle is ended (Cannot be relied on for shutdown)
 * @param {ChatContext} context - Chat context for the end command
 */
const end = (context) => {
	context.say(`The word was: ${word}. Wordle has ended`);
	context.running = false;
};

/**
 * Called to handle commands
 * @param {ChatContext} context - Chat context for the command
 */
const handleCommand = (context) => {
	if (!context.running) {
		return;
	}
	const commandName = context.command;
	
	if (commandName == "!guess") {
		if (!context.args[0]) {
			context.reply("please enter the 5 letter word you'd like to guess following !guess");
			return;
		}
		const guess = context.args[0].trim();
		if (guess.length != 5) {
			context.reply(`All guesses must consist of 5 letters.`);
			return;
		}
		if (!/[a-z]{5}/i.test(guess)) {
			context.reply("please enter the 5 letter word you'd like to guess following !guess");
			return;
		}
		const guessLetters = guess.toUpperCase().split("");
		const wordLetters = word.toUpperCase().split("");
		let result = "";
		let correct = 0;
		guesses++;
		for (let i = 0; i < 5; i++) {
			if(result) {
				result += " ";
			}
			if (guessLetters[i] == wordLetters[i]) {
				// Right letter Right spot
				result += guessLetters[i];
				correct++;
			}
			else if (wordLetters.includes(guessLetters[i])) {
				// Right letter Wrong spot
				result += "*";
			}
			else {
				// Wrong letter Wrong spot (aka not in word)
				result += "_";
			}
		}
		if (correct == 5) {
			let guessString = `after ${guesses} guesses`;
			if (guesses == 1) {
				guessString = `in a single guess`;
			}
			context.say(`🎉 CONGRATULATION! 🎉 @${context.displayName} has successfully guessed the word ${word} ${guessString}. The wordle has ended`);
			context.running = false;
		}
		else {
			context.say(`The guess of ${guess.toUpperCase()} resulted in ${result}`);
		}
	}
};

/**
 * Called whenever someone requests the how-to guide for the puzzle
 * @param {ChatContext} context - Chat context for the how to play command
 */
const howToPlay = (context) => {
	const howTo = "Use !guess to make a guess. All guesses must be 5 letters in length. The result is encoded as * = right letter wrong spot, _ = letter isn't in the word, or letter = right letter right spot.";
	context.say(howTo);
};

// Without the export the bot won't be able to use the puzzle
module.exports = {
	init,
	handleCommand,
	start,
	end,
	howToPlay
};