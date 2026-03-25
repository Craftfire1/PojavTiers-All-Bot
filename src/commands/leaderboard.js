const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Top 10 players ka leaderboard dekhein')
        .addStringOption(option =>
            option.setName('gamemode')
                .setDescription('which?')
                .setRequired(true)
                .addChoices(
                    { name: 'Crystal', value: 'crystal' },
                    { name: 'Sword', value: 'sword' },
                    { name: 'NetPot', value: 'netpot' },
                    { name: 'Mace', value: 'mace' },
                    { name: 'UHC', value: 'uhc' },
                    { name: 'SMP', value: 'smp' },
                    { name: 'Dia SMP', value: 'dia_smp' },
                    { name: 'Dia Pot', value: 'dia_pot' },
                    { name: 'Axe', value: 'axe' }
                )),

    async execute(interaction) {
        const gamemode = interaction.options.getString('gamemode');
        const topPlayers = db.getLeaderboard(gamemode, 10);

        if (!topPlayers || topPlayers.length === 0) {
            return interaction.reply({ 
                content: `Abhi **${gamemode.toUpperCase()}** Players Not found.`, 
                ephemeral: true 
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`🏆 ${gamemode.toUpperCase().replace('_', ' ')} LEADERBOARD`)
            .setColor('#FFD700')
            .setTimestamp()
            .setFooter({ text: 'Pojav Tier Ranking System' });

        let description = "";
        topPlayers.forEach((player, index) => {
            const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `**#${index + 1}**`;
            description += `${medal} **${player.ign}** • \`${player.tier}\` • ${player.region}\n`;
        });

        embed.setDescription(description);
        await interaction.reply({ embeds: [embed] });
    }
};