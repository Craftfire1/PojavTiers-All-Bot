const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const db = require('../database/database');
const { MAPPING, createQueueEmbed, STAFF_CMD_CHANNEL } = require('./openq');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pick')
        .setDescription('Pick a player from the queue to start a test')
        .addStringOption(option =>
            option.setName('gamemode')
                .setDescription('Select the gamemode')
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
                )),

    async execute(interaction) {
        if (interaction.channelId !== STAFF_CMD_CHANNEL) {
            return interaction.reply({ content: `This command can only be used in <#${STAFF_CMD_CHANNEL}>`, ephemeral: true });
        }

        const gm = interaction.options.getString('gamemode');
        const config = MAPPING[gm];

        // Role check
        if (!interaction.member.roles.cache.has(config.role) && !interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: `You need the <@&${config.role}> role to pick players for this gamemode!`, ephemeral: true });
        }

        const queue = db.getQueue(gm);
        const player = queue[0]; // Auto-pick position 1

        if (!player) {
            return interaction.reply({ content: `The **${config.name}** queue is empty!`, ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const guild = interaction.guild;
            const category = await guild.channels.fetch(config.category);
            const discordUser = await interaction.client.users.fetch(player.userId);
            const sanitizedName = discordUser.username.toLowerCase().replace(/[^a-z0-9-]/g, '');

            if (!category || category.type !== ChannelType.GuildCategory) {
                return interaction.editReply({ content: 'Error: Ticket category not found. Please contact an administrator.' });
            }

            // Create Ticket Channel
            const channel = await guild.channels.create({
                name: `test-${sanitizedName}`,
                type: ChannelType.GuildText,
                parent: config.category,
                permissionOverwrites: [
                    {
                        id: guild.id, // @everyone
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: player.userId,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                    },
                    {
                        id: interaction.user.id, // The Tester
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
                    },
                    {
                        id: config.role, // All testers of this gamemode
                        allow: [PermissionFlagsBits.ViewChannel],
                    }
                ],
            });

            // Remove from queue
            db.removeFromQueue(player.userId, gm);

            // Notify next player in line
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

            const currentTier = db.getTier(player.userId, gm);

            const ticketEmbed = new EmbedBuilder()
                .setTitle(`${config.name} Testing Session`)
                .setColor('#2b2d31')
                .setThumbnail(discordUser.displayAvatarURL())
                .setDescription(
                    `Welcome <@${player.userId}>!\n\n` +
                    `**Player:** ${player.ign}\n` +
                    `**Current Tier:** ${currentTier}\n\n` +
                    `Please be patient. The tester will be with you shortly.`
                )
                .setTimestamp();

            await channel.send({ content: `<@${player.userId}> <@${interaction.user.id}>`, embeds: [ticketEmbed] });

            await interaction.editReply({ content: `Successfully picked **${player.ign}**! Ticket created: ${channel}` });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'An error occurred while creating the ticket.' });
        }
    }
};
