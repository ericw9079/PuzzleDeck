const logger = require('@ericw9079/logger');

const inString = (string, strs) => {
	let result = false;
	strs.forEach(function(currentValue){
		const exp = new RegExp(`(?:^|[\\s,.!?])${currentValue}(?:$|[\\s,.!?])`,'i');
		if(exp.test(string.trim())){
			result = true;
		}
	});
	return result;
};

const helpMsg = `
	Help (all): !help.
	View currently loaded puzzle (all): !puzzle.
	List Puzzles (all): !puzzles, !listpuzzles, !puzzlelist, !listpuzzle.
	Load puzzle (all): !puzzle <name of puzzle to load>.
	Start puzzle (all): !startpuzzle, !puzzlestart.
	End puzzle (all): !endpuzzle, !puzzleend.
	Unload puzzle (all): !puzzle null.
	How to play (all): !howtoplay, !htp.
	Restrict bot management (mod): !lockout.
	Toggle auto mode (mod): !auto.
`;

/**
 * PuzzleDeck chat responder
 * © ericw9079 2024
 */
module.exports = (context) => {
	if (!context.botChatMsg){
		// Basic Health check
		context.say(helpMsg);
		logger.log(`* Responded to mention from ${context.displayName}`);
		return true;
	} else if (inString(context.botChatMsg,['help', 'how to use'])) {
		// Help
		context.say(helpMsg);
		logger.log(`* Responded to help request from ${context.displayName}`);
		return true;
	} else if (inString(context.botChatMsg,['about'])){
		// About
		context.say('PuzzleDeck is a bot created by ericw9079 that allows for adaptations of a variety of word puzzles to be played in twitch chat.');
		logger.log(`* Responded to about request from ${context.displayName}`);
		return true;
	}
	// No chat response
	return false;
};