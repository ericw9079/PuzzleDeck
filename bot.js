/*
 * Main Puzzledeck bot
 * © ericw9079 2022
 */
const tmi = require('tmi.js');
const fs = require('fs');
const logger = require('@ericw9079/logger');
const chatResponder = require("./chatResponder.js");
const ChatContext = require('./ChatContext.js');
const liveChecker = require('./liveChecker.js');

// Config for connecting to twitch (to keep from accidentally leaking on stream)
const configFile = "./config.json";
const config = require(configFile);

// If the config option is provided by environment variable use that instead of config
// This prevents accidental config overwrites
const token = process.env.TOKEN ?? config.twitchToken;
const userId = process.env.USER ?? config.twitchUser;
const channel = process.env.CHANNEL ?? config.twitchChannel;

// Update the environment variables to reflect current config
process.env.TOKEN = token;
process.env.USER = userId;
process.env.CHANNEL = channel;

// Define configuration options
const opts = {
	connection: {
		secure: true
	},
	identity: {
		username: `${userId}`,
		password: `${token}`
	},
	channels: [
		channel
	]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('chat', onTwitchChatHandler);
client.on('connected', onTwitcConnectedHandler);
client.on('disconnected', onTwitchDisconnectedHandler);

// Connect to Twitch
client.connect();

// Currently loaded puzzle
let puzzle = "";
let running = false;

// emergency mod lockout control
let isLockedOut = false;

// General cooldown details
let isOnCooldown = false;
const COOLDOWN_TIME = 30000; // 30 second cooldown
const cooldown = () => {
	// Set the cooldown flag
	isOnCooldown = true;
	// Schedule expiry
	setTimeout(() => {
		isOnCooldown = false;
	}, COOLDOWN_TIME);
}

// Auto mode flag
let isAutoMode = false;

let lastMessage = undefined;
let shutdownTimeout = undefined;
const LAST_MESSAGE_TIMEOUT = 300000; // How long to wait after the last message was sent before shutting down. Prevents bot from shutting down while in use even if liveChecker says to
const offlineHandler = () => {
	if (Date.now() - (lastMessage ?? 0) > LAST_MESSAGE_TIMEOUT) {
		client.say(channel, "Channel went offline, shutting down");
		logger.info("Shutdown triggered by offline channel");
		shutdownTimeout = undefined;
		isAutoMode = false;
		const context = ChatContext.createDummy(running);
		if (running && puzzle) {
			try{
				require(`./puzzles/${puzzle}.js`).end(context);
			}
			catch (e) {
				logger.error(e.message);
				console.log(e); // Log the error
				files.splice(files.indexOf(`${puzzle}.js`),1); // Remove the puzzle from the list (since it errored while ending)
				puzzle = ""; // Unload the puzzle
			}
			running = context.running;
		}
	} else {
		// Try again later
		shutdownTimeout = setTimeout(offlineHandler, LAST_MESSAGE_TIMEOUT);
	}
};

const onlineHandler = () => {
	if (shutdownTimeout) {
		clearTimeout(shutdownTimeout);
	}
	shutdownTimeout = undefined;
	client.say(channel, `@${channel}, ${userId} is live and ready to go. Use !auto to enable auto mode.`);
	logger.info("Channel online");
}

liveChecker.on('online', onlineHandler);
liveChecker.on('offline', offlineHandler);

// List of available puzzles
const files = fs.readdirSync('./puzzles');
files.splice(files.indexOf("null.js"),1);

const loadPuzzle = (context, newPuzzle) => {
	if (newPuzzle == "null") {
		context.say(`Unloading ${puzzle}`);
		puzzle = "";
		running = false;
		return true;
	}
	else if (files.includes(newPuzzle+".js")) {
		const oldPuzzle = puzzle;
		try {
			puzzle = newPuzzle;
			require(`./puzzles/${puzzle}.js`).init();
			running = false;
			context.say(`Loading ${puzzle}. Use !startpuzzle to start.`);
			return true;
		} catch (e) {
			console.log(e); // Log the error
			context.say(`An Error Occurred while loading ${puzzle}`); // Report there was an error
			files.splice(files.indexOf(`${puzzle}.js`),1); // Remove the puzzle from the list (since it errored on load)
			puzzle = oldPuzzle; // Restore the old puzzle
		}
	}
	else {
		context.say(`Cannot load ${newPuzzle} as it does not exist`);
	}
	return false;
};

const loadRandomPuzzle = (context) => {
	const ind = Math.floor(Math.random() * files.length);
	newPuzzle = files[ind].replace('.js', '');
	return loadPuzzle(context, newPuzzle);
};

const startPuzzle = (context) => {
	if (context.running) {
			context.reply("Unable to start puzzle as a puzzle is already running. Please stop it with !endpuzzle before restarting.")
	} else if (!puzzle) {
		context.say("Unable to start puzzle as no puzzle is loaded. Please load one first with !puzzle puzzle");
	}
	else {
		try {
			require(`./puzzles/${puzzle}.js`).start(context);
			if (context.running != true && isAutoMode) {
				setTimeout((con) => con.say(`Warning!! ${puzzle} doesn't support auto mode puzzle will not auto restart!`), 350, context);
			}
			return true;
		}
		catch (e) {
			logger.error(e.message);
			console.log(e); // Log the error
			context.say(`An Error Occurred while starting ${puzzle}`); // Report there was an error
			files.splice(files.indexOf(`${puzzle}.js`),1); // Remove the puzzle from the list (since it errored while starting)
			puzzle = ""; // Unload the puzzle
		} finally {
			running = context.running;
		}
	}
	return false;
};

// Called every time a message comes in
function onTwitchChatHandler (target, tags, msg, self) {
	if (self) { return; } // Ignore messages from the bot
	
	lastMessage = Date.now();
	
	// Create an instance of the ChatContext for passing to response modules
	const context = ChatContext.create(client, target, tags, msg, running);
	
	// Call the message handler
	onMessage(context);
}

function onMessage(context) {
	const commandName = context.command;
	const isMod = context.isMod;
	
	const canManage = isMod || (!isLockedOut && !isOnCooldown);
	
	if (context.isBotMentioned && chatResponder(context)) {
		return;
	}
	
	if (!context.isCommand) {
		return;
	}
	
	if (commandName == "!puzzle") {
		if (context.args[0] && canManage) {
			const newPuzzle = context.args[0].trim().toLowerCase();
			const loadResult = loadPuzzle(context, newPuzzle);
			if (loadResult && !isMod) {
				cooldown();
			}
		}
		else if (puzzle) {
			context.say(`Current: Puzzle ${puzzle}`);
		}
		else {
			context.say(`No puzzle loaded,${isLockedOut ? " have a mod" : ""} load one with !puzzle puzzle`);
		}
		return;
	}
	
	if (commandName == "!puzzlelist" || commandName == "!listpuzzles" || commandName == "!puzzles" || commandName == "!listpuzzle") {
		if(files.length > 0) {
			context.say(`Available Puzzles: ${files.join(', ').replaceAll('.js','')}`);
		}
		else {
			context.say(`No puzzles available :(`);
		}
		return;
	}
	
	if (commandName == "!howtoplay" || commandName == "!htp") {
		if (puzzle) {
			try {
				require(`./puzzles/${puzzle}.js`).howToPlay(context);
			}
			catch(e) {
				logger.error(e.message);
				console.log(e); // Log the error
				context.say(`An Error Occurred while fetching the how-to guide for ${puzzle}`); // Report there was an error
			}
			running = context.running;
		}
	}
	
	if (canManage && (commandName == "!puzzlestart" || commandName == "!startpuzzle")) {
		const startResult = startPuzzle(context);
		if (startResult && !isMod) {
			cooldown();
		}
		return;
	}
	
	if (canManage && (commandName == "!puzzleend" || commandName == "!endpuzzle")) {
		if (!context.running) {
			context.say("Unable to end puzzle as no puzzle is running. Please start one with !startpuzzle");
		} else if (!puzzle) {
			context.say("Unable to end puzzle as no puzzle is loaded. Please load one first with !puzzle puzzle");
		}
		else {
			try{
				require(`./puzzles/${puzzle}.js`).end(context);
				if (!isMod) {
					cooldown();
				}
			}
			catch (e) {
				logger.error(e.message);
				console.log(e); // Log the error
				context.say(`An Error Occurred while ending ${puzzle}`); // Report there was an error
				files.splice(files.indexOf(`${puzzle}.js`),1); // Remove the puzzle from the list (since it errored while ending)
				puzzle = ""; // Unload the puzzle
			}
			running = context.running;
		}
		return;
	}
	
	if (isMod && commandName == "!lockout") {
		isLockedOut = !isLockedOut;
		if (isLockedOut) {
			context.say("Management commands now restricted to Mods only");
		} else {
			context.say("Management commands are no longer restricted to Mods only");
		}
		return;
	}
	
	if (isMod && commandName == "!auto") {
		isAutoMode = !isAutoMode;
		if (isAutoMode) {
			context.say("Auto mode activated");
			setTimeout((con) => {
				if (!puzzle && !loadRandomPuzzle(context)) {
					return;
				}
				setTimeout((c) => {
					try {
						require(`./puzzles/${puzzle}.js`).start(c);
					}
					catch (e) {
						logger.error(e.message);
						console.log(e); // Log the error
						c.say(`An Error Occurred while starting ${puzzle}`); // Report there was an error
						files.splice(files.indexOf(`${puzzle}.js`),1); // Remove the puzzle from the list (since it errored while starting)
						puzzle = ""; // Unload the puzzle
					}
					running = context.running;
				}, 1000, con);
			}, 1000, context);
		} else {
			context.say("Auto mode disabled");
		}
		return;
	}
	
	if (isMod && commandName == "!status") {
		const stautsResults = [
			`Current Puzzle ${puzzle ?: "None"}.`,
			`Puzzle Status: ${running ? "In Progress" : "Not Active"}.`,
			`Auto mode: ${isAutoMode ? "Active" : "Not Active"}.`
			`Controls: ${isLockedOut ? "Mod Only" : "Everyone"}.`
		];
		context.say(statusResults.join(" "));
		return;
	}
	
	if (puzzle) {
		try {
			require(`./puzzles/${puzzle}.js`).handleCommand(context); 
		} catch (e) {
			logger.error(e.message);
			console.log(e);
			context.say(`An Error Occurred while processing the command.`); // Report there was an error
		}
		if (isAutoMode && running && !context.running) {
			// Puzzle entered the stop state while in auto mode
			// Launch auto mode intermission
			setTimeout((con) => {
				con.say(`Auto mode enabled: Restarting ${puzzle} in 15 seconds, use !puzzle to switch to a different puzzle`);
				setTimeout((co) => {
					if (!isAutoMode) { return; }
					if (!puzzle && !loadRandomPuzzle(context)) {
						return;
					}
					setTimeout(startPuzzle, 350, co);
				}, 15000, con);
			}, 1000, context);
		}
		running = context.running;
	}
}

// Called every time the bot connects to Twitch chat
function onTwitchConnectedHandler (addr, port) {
	logger.log(`* Connected to ${addr}:${port}`);
	logger.log(`* Joined ${channel}`);
	liveChecker.init();
}

function onTwitchDisconnectedHandler (reason) {
	logger.log(`Got disconnected with reason ${reason}`);
	liveChecker.cancel();
}