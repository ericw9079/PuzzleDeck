const { Client, GatewayIntentBits } = require('discord.js');
const logger = require('@ericw9079/logger');
const { ChatClient, enums: { ConnectStatus } } = require('./youtube');
const { discordToken } = require('./config.json');

const client = new Client({ intents: [ GatewayIntentBits.Guilds ] });
const videoIdRegex = /(?:\?|&)v=([a-zA-Z_0-9-]{11})(?:&|$)|\/live\/([a-zA-Z_0-9-]{11})(?:\?|$)|^([a-zA-Z_0-9-]{11})$/
const commands = ['connect', 'disconnect'];

let firstLogin = true;
let ytClient;

client.on("ready", () => {
	if(firstLogin !== 1) {
	  firstLogin = 1;
	  logger.log("Discord client connected successfully.");
	}
	else {
	  logger.log("Discord client re-connected successfully.");
	}

});

client.on("disconnect", (event) => {
	if(event.code !== 1000) {
	  logger.log("Discord client disconnected with reason: " + event.reason + " (" + event.code + ").");

	  if(event.code === 4004) {
		  logger.log("Please double-check the configured token and try again.");
		  process.exit();
		  return;
	  }

	  logger.log("Attempting to reconnect in 6s...");
	  setTimeout(() => { client.login(); }, 6000);
	}
});

client.on("error", (err) => {
	logger.log(`Discord client error '${err.code}' (${err.message}). Attempting to reconnect in 6s...`);
	client.destroy();
	setTimeout(() => { client.login(); }, 6000);
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;
	const commandName = interaction.commandName;
	if (!commands.includes(commandName)) return;
	if (!ytClient || !(ytClient instanceof ChatClient)) {
		await interaction.reply(":no_mobile_phones: Bot isn't configured for youtube chat. Please try again later. Contact ericw9079 if this error persists");
		return;
	}
	if (commandName == 'connect') {
		if ()
		const ytVideo = interaction.options.getString('youtube_video');
		const matches = ytVideo.match(videoIdRegex);
		const vidId = matches?.[1] || matches?.[2] || matches?.[3];
		if (!vidId) {
			await interaction.reply(":x: Video id not found, please enter the 11 character id or the URL of the video you'd like to connect to. Contact ericw9079 if this error persists");
		} else {
			await interaction.reply(`:satellite: Connecting to ${vidId}.....`);
			try {
				const result = await ytClient.connect(vidId);
				switch (result) {
					case ConnectStatus.Connected:
						await interaction.editReply(`:white_check_mark: Connected to youtube chat for ${vidId}`);
						break;
					case ConnectStatus.VideoNotFound:
						await interaction.editReply(`:x: Could not find the video with id of ${vidId}. Please check that you've entered it correctly`);
						break;
					case ConnectStatus.VideoNotLive:
						await interaction.editReply(`:prohibited: Found the video with the id of ${vidId} however it's not live. Please check that you've entered it correctly`);
						break;
					case ConnectStatus.NoLiveChat:
						await interaction.editReply(`:anger: Found the chat id but it doesn't seem like the chat exists. Please check that you've entered it correctly`);
						break;
					case ConnectStatus.AlreadyConnected:
						await interaction.editReply(`:ballot_box_with_check: Already connected to youtube chat for ${vidId}. If the bot does not respond, try disconnecting and reconnecting it`);
						break;
					default:
						await interaction.editReply(":x: Got an unexpected result when connecting to youtub");
						break;
				} 
			} catch (e) {
				await interaction.editReply(`:x: An error occurred while connecting youtube chat for ${vidId}`);
				logger.error(`An Error occurred while connecting to youtube chat for ${vidId}`);
				console.error(e);
			}
		}
	} else if (commandName == 'disconnect') {
		await interaction.reply(`:octagonal_sign: Disconnecting.....`);
		try {
			await ytClient.disconnect();
			await interaction.editReply(`:mobile_phone_off: Disconnected from youtube chat`);
		} catch (e) {
			await interaction.editReply(":x: An error occurred while disconnecting from youtube chat");
			logger.error("An Error occurred while disconnecting from youtube chat");
			console.error(e);
		}
	}
});

client.login(discordToken);

module.exports = (chatClient) => {
	if (!chatClient || chatClient instanceof ChatClient) {
		ytClient = chatClient;
	} else {
		throw new Error("Missing YouTube ChatClient");
	}
};