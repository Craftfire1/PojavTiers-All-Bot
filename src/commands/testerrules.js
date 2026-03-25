const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('testerrules')
        .setDescription('Post the official tester rules panel'),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: 'Only staff can use this command.', ephemeral: true });
        }

        const rulesEmbed = new EmbedBuilder()
            .setTitle('⚖️ POJAVTIERS TESTER RULES BOT CREATED BY @ankit.craftfire')
            .setColor('#2b2d31')
            .setDescription('All testers must follow these regulations to maintain a fair and professional testing environment.')
            .addFields(
                {
                    name: '1. Professionalism',
                    value: 'Maintain a professional attitude during tests. No toxicity, mocking, or disrespectful behavior towards candidates.'
                },
                {
                    name: '2. Impartiality',
                    value: 'Tests must be unbiased. Rank assignments should be based purely on skill performance, not personal relationships.'
                },
                {
                    name: '3. Efficiency',
                    value: 'Do not keep candidates waiting for long periods. If you cannot finish a test, inform the player or another tester.'
                },
                {
                    name: '4. Command Usage',
                    value: 'Use automation tools (`/pick`, `/result`, `/ticket close`) as intended. Do not manipulate the queue for favorites.'
                },
                {
                    name: '5. Rule Enforcement',
                    value: 'Report any issues or rule-breaking behavior by candidates to Senior Staff immediately.'
                },
                {
                    name: '6. Confidentiality',
                    value: 'Keep staff discussion and internal testing criteria private. Do not leak staff-only information.'
                }
            )
            .setFooter({ text: 'Universal Tier Management' })
            .setTimestamp();

        await interaction.reply({ content: 'Posting Tester Rules...', ephemeral: true });
        await interaction.channel.send({ embeds: [rulesEmbed] });
    }
};
