/**
 * Template Module for Puzzles for Puzzledeck
 * Attempting to load this puzzle will unload all puzzles
 * © ericw9079 2024
 */

/*
 * Context contains the following properties:
 * id: the message id (string)
 * tags/fullContext: all tags provided by the twitch IRC server or the youtube API. The structure of these properties vary depending on context source (object)
 * displayName: name of the user that sent the chat message (string)
 * msg: chat message (string)
 * command: the command sent (ie. the first word of the message) (string)
 * args: arguments of the command (array)
 * isMod: whether the message was sent by a mod (boolean)
 * isBotMentioned: whether the message mentions the bot (boolean)
 * botChatMsg: same as msg without bot tag (string)
 * isCommand: whether the message is potentially a command (boolean)
 * botUser: name of the bot user (string)
 * 
 * Context also contains the following functions:
 * say(message): send a new message to the channel
 * reply(message): reply to the message in the channel
 *
 * Also has a running property for managing running state
 * running: can be used for managing whether the puzzle is running or not (boolean)
 * the running property integrates with the bots automode.
 */

/** 
 * Called whenever the puzzle is loaded
 */
const init = () => {
	
};

/**
 * Called whenever a puzzle is started
 * @param {ChatContext} context - Chat context for the start command
 */
const start = (context) => {
	
};

/**
 * Called whenever a puzzle is ended (Cannot be relied on for shutdown)
 * @param {ChatContext} context - Chat context for the end command
 */
const end = (context) => {
	
};

/**
 * Called to handle commands
 * @param {ChatContext} context - Chat context for the command
 */
const handleCommand = (context) => {
	
};

/**
 * Called whenever someone requests the how-to guide for the puzzle
 * @param {ChatContext} context - Chat context for the how to play command
 */
const howToPlay = (context) => {
	
};

// Without the export the bot won't be able to use the puzzle
module.exports = {
	init,
	handleCommand,
	start,
	end,
	howToPlay
};