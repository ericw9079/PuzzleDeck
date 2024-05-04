const service = require('./service.js');
const ChatClient = require('./chatClient.js');
const { ConnectStatus, ClientEvent } = require('./enums.js');

module.exports = {
	ChatClient,
	service,
	enums: {
		ConnectStatus,
		ClientEvent
	}
}