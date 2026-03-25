const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staffrules')
        .setDescription('Post the official staff rules panel'),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: 'Only Administrators can use this command.', ephemeral: true });
        }

        const rulesEmbed = new EmbedBuilder()
            .setTitle('🛠️ POJAVTIERS STAFF RULES BOT CREATED BY @ankit.craftfire')
            .setColor('#2b2d31')
            .setDescription('All staff members must adhere to these regulations to ensure a stable and professional community.')
            .addFields(
                {
                    name: '1. Responsibility',
                    value: 'Staff must be active and carry out their duties regularly. If you need a break, inform the management.'
                },
                {
                    name: '2. Zero Tolerance for Abuse',
                    value: 'Any form of power abuse, including unauthorized role manipulation or bypassing system rules, will result in immediate demotion.'
                },
                {
                    name: '3. Communication',
                    value: 'Maintain a professional and helpful tone. Staff are representatives of the Universal Tier community.'
                },
                {
                    name: '4. Confidentiality',
                    value: 'Staff channels and internal documents are strictly private. Leaking internal information is a major violation.'
                },
                {
                    name: '5. Conflict Resolution',
                    value: 'Handle disputes calmly. Private messages should be used for sensitive matters instead of public arguments.'
                },
                {
                    name: '6. Integrity',
                    value: 'Decisions must be objective. Favoritism or bribery in staff duties will not be tolerated.'
                }
            )
            .setFooter({ text: 'Universal Tier Management' })
            .setTimestamp();

        await interaction.reply({ content: 'Posting Staff Rules...', ephemeral: true });
        await interaction.channel.send({ embeds: [rulesEmbed] });
    }
};
