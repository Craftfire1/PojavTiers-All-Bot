const { SlashCommandBuilder } = require('discord.js');
const db = require('../database/database');
const { MAPPING, createQueueEmbed } = require('./openq');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave a system')
        .addSubcommand(subcommand =>
            subcommand
                .setName('tester')
                .setDescription('Leave your tester slot')
                .addStringOption(option =>
                    option.setName('gamemode')
                        .setDescription('Select the gamemode queue to leave')
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
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('q')
                .setDescription('Leave the player ranking queue')
                .addStringOption(option =>
                    option.setName('gamemode')
                        .setDescription('Select the gamemode queue to leave')
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
        const subcommand = interaction.options.getSubcommand();
        const gm = interaction.options.getString('gamemode');
        const config = MAPPING[gm];

        if (subcommand === 'tester') {
            const testers = db.getTesters(gm);
            if (!testers.find(t => t.userId === interaction.user.id)) {
                return interaction.reply({ content: 'You are not in a tester slot for this gamemode!', ephemeral: true });
            }

            db.removeTester(interaction.user.id, gm);

            // Update Panel
            const panelMsgId = db.getConfig(`panel_msg_${gm}`);
            if (panelMsgId) {
                const targetChannel = await interaction.client.channels.fetch(config.channel);
                try {
                    const msg = await targetChannel.messages.fetch(panelMsgId);
                    if (msg) await msg.edit({ embeds: [createQueueEmbed(gm)] });
                } catch (e) { }
            }

            await interaction.reply({ content: `You have left the **${config.name}** tester slots.`, ephemeral: true });
        } else if (subcommand === 'q') {
            const queue = db.getQueue(gm);
            if (!queue.find(u => u.userId === interaction.user.id)) {
                return interaction.reply({ content: 'You are not in the queue for this gamemode!', ephemeral: true });
            }

            db.removeFromQueue(interaction.user.id, gm);

            // Notify next player in line if they become #1
            const { notifyNewFirstPlayer } = require('../utils/notif');
            const newQueue = db.getQueue(gm);
            await notifyNewFirstPlayer(interaction.client, gm, newQueue);

            // Update Panel
            const panelMsgId = db.getConfig(`panel_msg_${gm}`);
            if (panelMsgId) {
                const targetChannel = await interaction.client.channels.fetch(config.channel);
                try {
                    const msg = await targetChannel.messages.fetch(panelMsgId);
                    if (msg) await msg.edit({ embeds: [createQueueEmbed(gm)] });
                } catch (e) { }
            }

            await interaction.reply({ content: `You have left the **${config.name}** ranking queue.`, ephemeral: true });
        }
    }
};
