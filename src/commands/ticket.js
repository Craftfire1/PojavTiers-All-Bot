const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Ticket management commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('close')
                .setDescription('Close the current test ticket')),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ content: 'You do not have permission to close tickets.', ephemeral: true });
        }

        // Check if it's a test ticket channel
        if (!interaction.channel.name.startsWith('test-')) {
            return interaction.reply({ content: 'This command can only be used in test ticket channels!', ephemeral: true });
        }

        await interaction.reply({ content: 'Closing ticket in 5 seconds...' });

        setTimeout(async () => {
            try {
                await interaction.channel.delete();
            } catch (error) {
                console.error('Failed to delete channel:', error);
            }
        }, 5000);
    }
};
