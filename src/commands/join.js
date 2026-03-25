const { SlashCommandBuilder } = require('discord.js');
const db = require('../database/database');
const { MAPPING, createQueueEmbed } = require('./openq');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join a system')
        .addSubcommand(subcommand =>
            subcommand
                .setName('tester')
                .setDescription('Join as a tester for a specific gamemode')
                .addStringOption(option =>
                    option.setName('gamemode')
                        .setDescription('Select the gamemode to join as tester')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Crystal', value: 'crystal' },
                            { name: 'Sword', value: 'sword' },
                            { name: 'NetPot', value: 'netpot' },
                            { name: 'Mace', value: 'mace' },
                            { name: 'UHC', value: 'uhc' },
                            { name: 'SMP', value: 'smp' },
                            { name: 'Dia SMP', value: 'dia_smp' },
                            { name: 'Axe', value: 'axe' },
                            { name: 'Dia Pot', value: 'dia_pot' }
                        ))),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'tester') {
            const gm = interaction.options.getString('gamemode');
            const config = MAPPING[gm];

            // Role check
            if (!interaction.member.roles.cache.has(config.role) && !interaction.member.permissions.has('Administrator')) {
                return interaction.reply({ content: `You need the <@&${config.role}> role to join as a tester!`, ephemeral: true });
            }

            const testers = db.getTesters(gm);
            if (testers.length >= 3) return interaction.reply({ content: 'Tester slots are full (Max 3)!', ephemeral: true });
            if (testers.find(t => t.userId === interaction.user.id)) return interaction.reply({ content: 'You are already in a tester slot!', ephemeral: true });

            db.addTester(interaction.user.id, interaction.user.username, gm);

            // Update Panel
            const panelMsgId = db.getConfig(`panel_msg_${gm}`);
            if (panelMsgId) {
                const targetChannel = await interaction.client.channels.fetch(config.channel);
                try {
                    const msg = await targetChannel.messages.fetch(panelMsgId);
                    if (msg) await msg.edit({ embeds: [createQueueEmbed(gm)] });
                } catch (e) { }
            }

            await interaction.reply({ content: `You have joined the **${config.name}** tester slots.`, ephemeral: true });
        }
    }
};
