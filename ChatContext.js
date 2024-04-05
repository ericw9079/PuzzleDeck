/**
 * PuzzleDeck chat context
 * Contains everything needed for responding to a chat message
 * Passed to puzzle modules automatically
 * © ericw9079 2024
 */
const ChatContext = require('@ericw9079/chatcontext');

module.exports = {
	create:(tmiClient, target, tags, message, running) => {
		const context = new ChatContext(tmiClient, target, tags, message);
		Object.defineProperties(context, {
			"running": {
				 "get": () => context.run,
				 "set": (running) => { context.run = running }
			}
		});
		context.running = running;
		return context;
	},
	createDummy: (running) => {
		const context = Object.create(ChatContext, {
			id: {
				value: "dummyid",
				enumerable: true,
			},
			tags: {
				value: {
					id: "dummyid",
					"display-name": 'dummy name',
					username: 'dummy_username',
					badges: {
						broadcaster: '1',
						moderator: '1',
					},
				},
				enumerable: true,
			},
			displayName: {
				value: "dummy name",
				enumerable: true,
			},
			msg: {
				value: "dummy message",
				enumerable: true,
			},
			command: {
				value: 'dummy',
				enumerable: true,
			},
			args: {
				value: ['message'],
				enumerable: true,
			},
			isMod: {
				value: true,
				enumerable: true,
			},
			isBotMentioned: {
				value: false,
				enumerable: true,
			},
			botChatMsg: {
				value: "dummy message",
				enumerable: true,
			},
			isCommand: {
				value: false,
				enumerable: true,
			},
			say: {
				value: (msg) => {},
			},
			reply: {
				value: (msg) => {},
			},
		});
		Object.defineProperties(context, {
			"running": {
				 "get": () => context.run,
				 "set": (running) => { context.run = running }
			}
		});
		context.running = running;
		return context;
	}
};