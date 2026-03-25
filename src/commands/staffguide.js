const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staffguide')
        .setDescription('View the official guide for staff members'),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: 'Only staff can use this command.', ephemeral: true });
        }

        const guideEmbed = new EmbedBuilder()
            .setTitle('🛠️ UNIVERSAL TIER STAFF GUIDE')
            .setColor('#2b2d31')
            .setDescription('Comprehensive guide for managing the Universal Tier system.')
            .addFields(
                {
                    name: '1. System Setup',
                    value: 'Administrators can use `/setup` to post the verification panel. All roles and categories are pre-configured.'
                },
                {
                    name: '2. Ranking Management',
                    value: 'Keep the ranking channels clean. Open queues using `/open q` only when testers are ready to process players.'
                },
                {
                    name: '3. Tester Oversight',
                    value: 'Ensure testers are following their specific guide (`/testerguide`) and maintaining high standards during sessions.'
                },
                {
                    name: '4. Result Verification',
                    value: 'Verify that announcements in the results channel are correctly formatted and that players are receiving their proper roles.'
                },
                {
                    name: '5. Moderation Duties',
                    value: 'Moderators should focus on community behavior, while Testers focus on gameplay skill. Direct issues to the appropriate department.'
                },
                {
                    name: '6. Command Reference',
                    value: '• `/open q`: Start sessions\n• `/close q`: End sessions\n• `/result`: Record tiers\n• `/ticket close`: Post-test cleanup'
                }
            )
            .setFooter({ text: 'Universal Tier Management' })
            .setTimestamp();

        await interaction.reply({ content: 'Posting Staff Guide...', ephemeral: true });
        await interaction.channel.send({ embeds: [guideEmbed] });
    }
};
