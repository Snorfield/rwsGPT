const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const commands = require('./commands/commands.js');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds
	]
});

client.on(Events.InteractionCreate, async interaction => {

	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	// Execute a command if it exists
	if (commands[commandName]) {
		commands[commandName](interaction);
	} else {
		await interaction.editReply({ content: 'Command file not found' });
	}

});

client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(token);
