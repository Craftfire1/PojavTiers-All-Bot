const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/database');
const { MAPPING, STAFF_CMD_CHANNEL } = require('./openq');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Close a ranking queue')
        .addSubcommand(subcommand =>
            subcommand
                .setName('q')
                .setDescription('Closes a specific ranking queue')
                .addStringOption(option =>
                    option.setName('gamemode')
                        .setDescription('Select the gamemode to close')
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
        if (interaction.channelId !== STAFF_CMD_CHANNEL) {
            return interaction.reply({ content: `This command can only be used in <#${STAFF_CMD_CHANNEL}>`, ephemeral: true });
        }

        const gm = interaction.options.getString('gamemode');
        const config = MAPPING[gm];

        if (!interaction.member.roles.cache.has(config.role) && !interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: `You need the <@&${config.role}> role to close this queue!`, ephemeral: true });
        }

        const targetChannel = await interaction.client.channels.fetch(config.channel);

        // Delete the open panel
        const panelMessageId = db.getConfig(`panel_msg_${gm}`);
        if (panelMessageId) {
            try {
                const msg = await targetChannel.messages.fetch(panelMessageId);
                if (msg) await msg.delete();
            } catch (e) { }
            db.setConfig(`panel_msg_${gm}`, null);
        }

        // Clear the actual queue data
        db.clearQueue(gm);

        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const formattedTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        const closeEmbed = new EmbedBuilder()
            .setTitle('No Testers Online')
            .setColor('#ff4747')
            .setDescription(
                'No testers for your region are available at this time.\n' +
                'You will be pinged when a tester is available.\n' +
                'Check back later!\n\n' +
                `**Last testing session:** ${formattedDate} at ${formattedTime}`
            );

        const response = await targetChannel.send({ embeds: [closeEmbed] });
        db.setConfig(`close_msg_${gm}`, response.id);

        await interaction.reply({ content: `${config.name} Queue is now closed in <#${config.channel}>`, ephemeral: true });
    }
};
