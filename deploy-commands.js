const { REST, Routes, PermissionsBitField, SlashCommandBuilder, ChannelType } = require('discord.js');
const config = require('./config.json');

const clientId = config.discordClient;
const token = config.discordToken;

const commands = [
	new SlashCommandBuilder()
		.setName('connect')
		.setDescription('Connect PuzzleDeck to a youtube chat')
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
		.addStringOption(option => option.setName('youtube_video').setDescription('Youtube video you want PuzzleDeck to connect to the chat of').setRequired(true).setMinLength(11)),
	new SlashCommandBuilder()
		.setName('disconnect')
		.setDescription('Disconnect PuzzleDeck from all youtube chats')
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
]
.map(command => {
	const json = command.toJSON(),
	json.integration_types = [ 0, 1];
	return json;
});

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
	try {
		await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);
		console.log('Successfully registered application commands.');
	} catch (error) {
		console.error(error);
	}
})();