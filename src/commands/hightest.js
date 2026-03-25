const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hightest')
        .setDescription('Setup high test verification panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('High Test')
            .setDescription(
                '**Request High Tests**\n' +
                'Click the button to create a high-test ticket.\n\n' +
                '**Requirements:**\n' +
                '• You MUST be LT3+ in the game mode you requested.\n' +
                '• You MUST wait for at least 30d from your last high test'
            )
            .setColor('#ff0000')
            .setFooter({ text: 'High Test Verification System' });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('hightest_select')
            .setPlaceholder('Choose your gamemode')
            .addOptions([
                {
                    label: 'Crystal',
                    value: 'crystal',
                    description: 'Crystal PvP High Test',
                    emoji: '💎'
                },
                {
                    label: 'Sword',
                    value: 'sword',
                    description: 'Sword PvP High Test',
                    emoji: '⚔️'
                },
                {
                    label: 'NetPot',
                    value: 'netpot',
                    description: 'Netherite Pot High Test',
                    emoji: '🧪'
                },
                {
                    label: 'UHC',
                    value: 'uhc',
                    description: 'UHC High Test',
                    emoji: '🏹'
                },
                {
                    label: 'Dia SMP',
                    value: 'dia_smp',
                    description: 'Diamond SMP High Test',
                    emoji: '💠'
                },
                {
                    label: 'SMP',
                    value: 'smp',
                    description: 'SMP High Test',
                    emoji: '🌲'
                },
                {
                    label: 'Axe',
                    value: 'axe',
                    description: 'Axe PvP High Test',
                    emoji: '🪓'
                },
                {
                    label: 'Dia Pot',
                    value: 'dia_pot',
                    description: 'Diamond Pot High Test',
                    emoji: '💊'
                },
                {
                    label: 'Mace',
                    value: 'mace',
                    description: 'Mace PvP High Test',
                    emoji: '🔨'
                }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        // Send the panel to the channel
        await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });

        // Confirm to admin (ephemeral)
        await interaction.reply({
            content: '✅ High test verification panel has been posted!',
            ephemeral: true
        });
    }
};
