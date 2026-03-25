const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup various bot systems')
        .addSubcommand(subcommand =>
            subcommand
                .setName('verification')
                .setDescription('Post the Evaluation Testing Waitlist panel'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'verification') {
            const embed = new EmbedBuilder()
                .setTitle('Evaluation Testing Waitlist')
                .setDescription(
                    'Upon applying, you will be added to a waitlist channel.\n' +
                    'Here you will be pinged when a tester of your region is available.\n' +
                    'If you are HT3 or higher, a high ticket will be created.\n\n' +
                    '• **Region** should be the region of the server you wish to test on\n' +
                    '• **Username** should be the name of the account you will be testing on\n\n' +
                    '**Failure to provide authentic information will result in a denied test**'
                )
                .setColor('#ff0000'); // Red color as requested

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('waitlist_enter')
                        .setLabel('Enter Waitlist')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('test_cooldown')
                        .setLabel('Test Cooldown')
                        .setStyle(ButtonStyle.Secondary)
                );

            await interaction.reply({ content: 'Verification panel has been sent!', ephemeral: true });

            await interaction.channel.send({
                embeds: [embed],
                components: [row]
            });
        }
    }
};
