const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../database/database');

const STAFF_CMD_CHANNEL = '1483763744751222784';
const MAPPING = {
    crystal: { role: '1484825468648820766', channel: '1480482530045198427', name: 'Crystal', category: '1482664335414263839' },
    sword: { role: '1484827714576973916', channel: '1482664619553329262', name: 'Sword', category: '1482664335414263839' },
    netpot: { role: '1484825696701513728', channel: '1482666504863481907', name: 'NetPot', category: '1482664335414263839' },
    mace: { role: '1484825837550309446', channel: '1482666678138703903', name: 'Mace', category: '1482664335414263839' },
    uhc: { role: '1484825845033078790', channel: '1482666896695496745', name: 'UHC', category: '1482664335414263839' },
    smp: { role: '1484826288182267904', channel: '1483692591844167690', name: 'SMP', category: '1482664335414263839' },
    dia_smp: { role: '1484826853264068699', channel: '1475483544116658192', name: 'Dia SMP', category: '1482664335414263839' },
    axe: { role: '1484826149493276753', channel: '1482666834850349156', name: 'Axe', category: '1482664335414263839' },
    dia_pot: { role: '1484826733864685719', channel: '1475483544116658192', name: 'Dia Pot', category: '1482664335414263839' }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('open')
        .setDescription('Open a ranking queue')
        .addSubcommand(subcommand =>
            subcommand
                .setName('q')
                .setDescription('Opens a specific ranking queue')
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
                        ))),

    async execute(interaction) {
        if (interaction.channelId !== STAFF_CMD_CHANNEL) {
            return interaction.reply({ content: `This command can only be used in <#${STAFF_CMD_CHANNEL}>`, ephemeral: true });
        }

        const gm = interaction.options.getString('gamemode');
        const config = MAPPING[gm];

        if (!interaction.member.roles.cache.has(config.role) && !interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: `You need the <@&${config.role}> role to open this queue!`, ephemeral: true });
        }

        // Check if already open
        if (db.getConfig(`panel_msg_${gm}`)) {
            return interaction.reply({ content: `${config.name} Queue is already open!`, ephemeral: true });
        }

        // AUTO-JOIN as tester when opening
        db.clearTesters(gm); // Clear any old testers from previous sessions
        db.removeFromQueue(interaction.user.id, gm); // Ensure they aren't in player list
        db.addTester(interaction.user.id, interaction.user.username, gm);

        // Delete old close message in that specific channel
        const oldCloseId = db.getConfig(`close_msg_${gm}`);
        const targetChannel = await interaction.client.channels.fetch(config.channel);

        if (oldCloseId) {
            try {
                const msg = await targetChannel.messages.fetch(oldCloseId);
                if (msg) await msg.delete();
            } catch (e) { }
            db.setConfig(`close_msg_${gm}`, null);
        }

        const embed = createQueueEmbed(gm);
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`q_join_${gm}`).setLabel('Join Queue').setStyle(ButtonStyle.Success)
        );

        const response = await targetChannel.send({
            content: '@here',
            embeds: [embed],
            components: [row1]
        });
        db.setConfig(`panel_msg_${gm}`, response.id);

        await interaction.reply({ content: `${config.name} Queue is now open in <#${config.channel}> (You have been added as a tester!)`, ephemeral: true });
    }
};

function createQueueEmbed(gm) {
    const queue = db.getQueue(gm);
    const testers = db.getTesters(gm);
    const config = MAPPING[gm];

    let playerList = '';
    for (let i = 1; i <= 20; i++) {
        const player = queue[i - 1];
        playerList += `**${i}.** ${player ? `<@${player.userId}>` : '`Empty`'}\n`;
    }

    let testerList = '';
    for (let i = 1; i <= 3; i++) {
        const tester = testers[i - 1];
        testerList += `**${i}.** ${tester ? `<@${tester.userId}>` : '`Empty`'}\n`;
    }

    return new EmbedBuilder()
        .setTitle(`${config.name.toUpperCase()} RANKING QUEUE`)
        .setColor('#2b2d31')
        .setDescription(
            'The queue updates every 10 seconds.\n' +
            'Use /leave q if you wish to be removed from the waitlist or queue.'
        )
        .addFields(
            { name: `PLAYERS (${queue.length}/20)`, value: playerList, inline: false },
            { name: 'TESTERS (1-3)', value: testerList, inline: false }
        )
        .setTimestamp();
}

module.exports.createQueueEmbed = createQueueEmbed;
module.exports.MAPPING = MAPPING;
module.exports.STAFF_CMD_CHANNEL = STAFF_CMD_CHANNEL;1483763744751222784
