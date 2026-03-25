const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Bot ki speed check karein'),
    async execute(interaction) {
        await interaction.reply('Pong! ??');
    },
};