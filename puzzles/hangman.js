/**
 * Hangman Puzzle for Puzzledeck
 * © ericw9079 2024
 */

const fs = require("fs");
const letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

let words = [];
let word = "";
let lives = 0;
let wordState = [];
let guessed = [];

/** 
 * Called whenever the puzzle is loaded
 */
const init = () => {
	const files = fs.readdirSync("./words", {encoding:'utf-8',withFileTypes:true});
	files.forEach(file => {
		if (file.isFile() && file.name.endsWith(".txt")) {
		const data = fs.readFileSync(`./words/${file.name}`,{encoding:'utf-8'});
			words = words.concat(data.trim().split("\n").filter(word => word.split("").every(l => letters.includes(l.toUpperCase()))));
		}
	});
};

/**
 * Called whenever a puzzle is started
 * @param {ChatContext} context - Chat context for the start command
 */
const start = (context) => {
	const ind = Math.floor(Math.random() * words.length);
	word = words[ind];
	lives = 9;
	context.running = true;
	wordState = Array(word.length).fill("_",0); // Initiate the display
	guessed = []; // Clear guessed
	context.say(`Hangman is starting. Use "!guess letter" to make a guess. ❤️x${lives} Current word: ${wordState.join(" ")}`);
};

/**
 * Called whenever a puzzle is ended (Cannot be relied on for shutdown)
 * @param {ChatContext} context - Chat context for the end command
 */
const end = (context) => {
	context.say(`The word was: ${word}. Hangman has ended`);
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
			context.reply(`please enter the letter or ${word.length()} letter word you'd like to guess following !guess`);
			return;
		}
		const guess = context.args[0].trim();
		
		if (!guess.split("").every(l => letters.includes(l.toUpperCase()))) {
			context.reply(`guesses can only contain letters`);
			return;
		}
		
		if (guess.length == 1) {
			// Letter guess
			if (guessed.includes(guess.toUpperCase())) {
				context.say(`Looks like "${guess.toUpperCase()}" was already guessed. ❤️x${lives} Current word: ${wordState.join(" ")}`);
				return;
			}
			guessed.push(guess.toUpperCase());
			if (!word.toUpperCase().includes(guess.toUpperCase())) {
				// Not in word lose a life
				lives--;
				if (lives <= 0) {
					context.say(`💔 Oh No! Looks like ${guess} isn't in the word. You have run out of lives. The word was ${word}`);
					context.running = false;
				}
				else {
					context.say(`💔 Oh No! Looks like "${guess.toUpperCase()}" isn't in the word. ${lives} lives remain. Current word: ${wordState.join(" ")}`);
				}
			}
			else {
				// In word update wordState
				const wordLetters = word.toUpperCase().split("");
				for (let i = 0; i < word.length; i++) {
					if (guess.toUpperCase() == wordLetters[i].toUpperCase()) {
						wordState[i] = wordLetters[i];
					}
				}
				if (wordState.includes('_')) {
					context.say(`❤️x${lives} Current word: ${wordState.join(" ")}`);
				}
				else {
					context.say(`🎉 CONGRATULATION! 🎉 @${context.displayName} has successfully guessed the word ${word} with ${lives} lives remaining. Hangman has ended`);
					context.running = false;
				}
			}
		}
		else if (guess.length == word.length) {
			// Word guess
			if (guess.toUpperCase() == word.toUpperCase()) {
				// Correct finish
				context.say(`🎉 CONGRATULATION! 🎉 @${context.displayName} has successfully guessed the word ${word} with ${lives} lives remaining. Hangman has ended`);
				context.running = false;
			}
			else {
				// Incorrect lose a life
				lives--;
				if (lives <= 0) {
					context.say(`💔 Oh No! Looks like ${guess} wasn't right. You have run out of lives. The word was ${word}`);
					context.running = false;
				}
				else {
					context.say(`💔 Oh No! Looks like ${guess} wasn't right. ${lives} lives remain. Current word: ${wordState.join(" ")}`);
				}
			}
		}
		else {
			context.reply(`please enter the letter or ${word.length} letter word you'd like to guess following !guess`);
		}
	}
	else if (commandName == "!guessed") {
		context.reply(`${guessed.join(', ')} have already been guessed so far`);
	}
};

/**
 * Called whenever someone requests the how-to guide for the puzzle
 * @param {ChatContext} context - Chat context for the how to play command
 */
const howToPlay = (context) => {
	const howTo = "Work together to guess the word before you run out of lives (❤️). Use !guess to guess a letter, or try for the entire word.";
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