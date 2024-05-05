/**
 * PuzzleDeck chat context
 * Contains everything needed for responding to a chat message
 * Passed to puzzle modules automatically
 * © ericw9079 2024
 */
const { TwitchChatContext, YoutubeChatContext, DummyChatContext } = require('@ericw9079/chatcontext');

module.exports = {
	createTwitch:(tmiClient, target, tags, message, running) => {
		const context = new TwitchChatContext(tmiClient, target, tags, message);
		Object.defineProperties(context, {
			"running": {
				 "get": () => context._run,
				 "set": (running) => { context._run = running }
			}
		});
		context.running = running;
		return context;
	},
	createDummy: (running) => {
		const context = new DummyChatContext();
		Object.defineProperties(context, {
			"running": {
				 "get": () => context._run,
				 "set": (running) => { context._run = running }
			}
		});
		context.running = running;
		return context;
	},
	createYoutube: (youtubeClient, messageText, authorContext, message) => {
		const context = new YoutubeChatContext(youtubeClient, messageText, authorContext, message);
		Object.defineProperties(context, {
			"running": {
				 "get": () => context._run,
				 "set": (running) => { context._run = running }
			}
		});
		context.running = running;
		return context;
	}
};