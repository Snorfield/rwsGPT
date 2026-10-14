const { SlashCommandBuilder, InteractionContextType, REST, Routes } = require('discord.js');
const { token, clientId } = require('./config.json');

const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('ping')
        .setContexts([
            InteractionContextType.Guild,
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel
        ])
        .toJSON(),
    new SlashCommandBuilder()
        .setName('generate')
        .setDescription('Predict the next tokens based on the seed string')
        .setContexts([
            InteractionContextType.Guild,
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel
        ])
        .addStringOption(option =>
            option.setName('seed')
                .setDescription('Starting phrase')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('context')
                .setDescription('Max context or look-behind')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(5)
        )
        .addIntegerOption(option =>
            option.setName('tokens')
                .setDescription('Max tokens to generate')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(200)
        )
        .addIntegerOption(option =>
            option.setName('type')
                .setDescription('Prediction method to use')
                .setRequired(false)
                .addChoices(
                    { name: 'Weightless Random', value: 0 },
                    { name: 'Weighted Random', value: 1 },
                    { name: 'Top Weight', value: 2 }
                )
        )
        .addBooleanOption(option =>
            option.setName('show_owner')
                .setDescription('Show color-coded tokens to view the owner of each')
                .setRequired(false)
        )
        .toJSON(),
    new SlashCommandBuilder()
        .setName('owner')
        .setDescription('View the owners of a token')
        .setContexts([
            InteractionContextType.Guild,
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel
        ])
        .addStringOption(option =>
            option.setName('token')
                .setDescription('Token to search')
                .setRequired(true)
        )
        .toJSON()
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationCommands(clientId), { body: commands });
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
