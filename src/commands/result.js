const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../database/database');

const TIER_COLORS = {
    'HT1': '#00ffaa', 'HT2': '#00ffcc', 'HT3': '#00ffee', 'HT4': '#00bbff', 'HT5': '#0088ff',
    'LT1': '#ffff00', 'LT2': '#ffee00', 'LT3': '#ffdd00', 'LT4': '#ffaa00', 'LT5': '#ff8800'
};

const TIER_ROLES = {
    crystal: {
        'HT1': '1476150478357266607', 'LT1': '1476150599379714191', 'HT2': '1476150939013615696', 'LT2': '1476151025223208960',
        'HT3': '1476151156492337152', 'LT3': '1476151314424533002', 'HT4': '1476151444540358718', 'LT4': '1476151607187079291',
        'HT5': '1476151688372158536', 'LT5': '1476151778884980897'
    },
    netpot: {
        'HT1': '1459855320384802993', 'LT1': '1476152054312468540', 'HT2': '1476152121723195475', 'LT2': '1476152233430093964',
        'HT3': '1476152308701331456', 'LT3': '1476152394239971340', 'HT4': '1476152469191917590', 'LT4': '1476152535097151610',
        'HT5': '1476152612951953409', 'LT5': '1476152688109424640'
    },
    sword: {
        'HT1': '1459854202380488714', 'LT1': '1459854292377927741', 'HT2': '1483137935489499179', 'LT2': '1483137857681096925',
        'HT3': '1479001146009063555', 'LT3': '1476883946020012052', 'HT4': '1480502578847551488', 'LT4': '1480845539028238436',
        'HT5': '1481617626772934747', 'LT5': '1483338996145721344'
    },
    axe: {
        'HT1': '1460665728125370368', 'LT1': '1460665851710537820', 'HT2': '1484075676750446653', 'LT2': '1484075619309457468',
        'HT3': '1484075550342385776', 'LT3': '1484075499658678362', 'HT4': '1484075429412339734', 'LT4': '1483386435506536538',
        'HT5': '1483377637656363140', 'LT5': '1484075353801625691'
    },
    uhc: {
        'HT1': '1459856216485527717', 'LT1': '1459856365605621982', 'HT2': '1484076307112263720', 'LT2': '1484076254901829643',
        'HT3': '1484076195141255248', 'LT3': '1484076132989931612', 'HT4': '1483386709138866329', 'LT4': '1484076059082231879',
        'HT5': '1484075976626278410', 'LT5': '1484075886281097267'
    },
    smp: {
        'HT1': '1460664044783669349', 'LT1': '1460664126228398173', 'HT2': '1460664223620141231', 'LT2': '1460664691830427906',
        'HT3': '1460665032261238825', 'LT3': '1460665127622676747', 'HT4': '1460665235303301313', 'LT4': '1460665343000314049',
        'HT5': '1460665417814118482', 'LT5': '1460665484662804584'
    },
    mace: {
        'HT1': '1460668111765110972', 'LT1': '1460668166723076169', 'HT2': '1484078502092476496', 'LT2': '1484078447579103272',
        'HT3': '1481642283408560170', 'LT3': '1481642115690795091', 'HT4': '1479041427173412957', 'LT4': '1481641315300147352',
        'HT5': '1484078386275160174', 'LT5': '1484078339252555886'
    },
    dia_smp: {
        'HT1': '1460658622408163360', 'LT1': '1460658714314014803', 'HT2': '1460658798279790726', 'LT2': '1460658890252226721',
        'HT3': '1460658971689095178', 'LT3': '1460659064970149942', 'HT4': '1460659586506690590', 'LT4': '1460659657231175864',
        'HT5': '1460659786692690052', 'LT5': '1460663968883281995'
    },
    dia_pot: {
        'HT1': '1460666620350431293', 'LT1': '1460666963180257341', 'HT2': '1460667033514676440', 'LT2': '1460667110190485707',
        'HT3': '1460667242273312768', 'LT3': '1460667308698767457', 'HT4': '1460667380593070110', 'LT4': '1460667638144303126',
        'HT5': '1460667703881629812', 'LT5': '1460667767475667026'
    }
};

const CATEGORY_TO_GM = {
    '1475483544116658187': 'crystal',
    '1475483544116658187': 'sword',
    '1475483544116658187': 'netpot',
    '1475483544116658187': 'mace',
    '1475483544116658187': 'uhc',
    '1475483544116658187': 'smp',
    '1475483544116658187': 'dia_smp',
    '1475483544116658187': 'axe',
    '1475483544116658187': 'dia_pot'
};

const WAITLIST_ROLES = [
    '1475565474363215933', '1475565474363215933', '1475565474363215933', '1475565474363215933',
    '1475565474363215933', '1475565474363215933', '1475565474363215933', '1475565474363215933'
];

const ANNOUNCEMENT_CHANNEL_ID = '1475483544116658192';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('result')
        .setDescription('Post the test result for a player')
        .addUserOption(option => option.setName('player').setDescription('The player who was tested').setRequired(true))
        .addStringOption(option =>
            option.setName('tier')
                .setDescription('The tier achieved')
                .setRequired(true)
                .addChoices(
                    { name: 'HT1', value: 'HT1' }, { name: 'LT1', value: 'LT1' },
                    { name: 'HT2', value: 'HT2' }, { name: 'LT2', value: 'LT2' },
                    { name: 'HT3', value: 'HT3' }, { name: 'LT3', value: 'LT3' },
                    { name: 'HT4', value: 'HT4' }, { name: 'LT4', value: 'LT4' },
                    { name: 'HT5', value: 'HT5' }, { name: 'LT5', value: 'LT5' }
                ))
        .addStringOption(option =>
            option.setName('gamemode')
                .setDescription('Manually select gamemode (optional if used in ticket)')
                .addChoices(
                    { name: 'Crystal', value: 'crystal' }, { name: 'Sword', value: 'sword' }, { name: 'NetPot', value: 'netpot' },
                    { name: 'Mace', value: 'mace' }, { name: 'UHC', value: 'uhc' }, { name: 'SMP', value: 'smp' },
                    { name: 'Dia SMP', value: 'dia_smp' }, { name: 'Dia Pot', value: 'dia_pot' }, { name: 'Axe', value: 'axe' }
                )),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({ content: 'Only staff can use this command.', ephemeral: true });
        }

        const targetMember = interaction.options.getMember('player');
        const tier = interaction.options.getString('tier');
        let gamemode = interaction.options.getString('gamemode');

        if (!targetMember) {
            return interaction.reply({ content: 'Could not find that member.', ephemeral: true });
        }

        // Auto-detect gamemode from category if not provided
        if (!gamemode) {
            const categoryId = interaction.channel.parentId;
            gamemode = CATEGORY_TO_GM[categoryId];
        }

        if (!gamemode) {
            return interaction.reply({ content: 'Could not detect gamemode! Please select it manually or use this command in a ticket.', ephemeral: true });
        }

        const gmTiers = TIER_ROLES[gamemode];
        if (!gmTiers || !gmTiers[tier]) {
            return interaction.reply({ content: `Roles for **${gamemode.toUpperCase()} ${tier}** are not configured!`, ephemeral: true });
        }

        await interaction.deferReply();

        try {
            const playerDb = db.getUser(targetMember.id);
            const prevRank = db.getTier(targetMember.id, gamemode);
            const region = playerDb ? playerDb.region : 'Unknown';
            const ign = playerDb ? playerDb.ign : targetMember.user.username;

            const roleId = gmTiers[tier];

            // Remove existing tier roles for THIS gamemode
            for (const rId of Object.values(gmTiers)) {
                if (targetMember.roles.cache.has(rId)) {
                    await targetMember.roles.remove(rId).catch(() => { });
                }
            }

            // Assign new Tier Role
            await targetMember.roles.add(roleId);

            // Remove Waitlist roles
            for (const rId of WAITLIST_ROLES) {
                if (targetMember.roles.cache.has(rId)) {
                    await targetMember.roles.remove(rId).catch(() => { });
                }
            }

            // Database Update
            db.updateUser(targetMember.id, ign, tier, region);
            db.setTier(targetMember.id, gamemode, tier);

            const resultEmbed = new EmbedBuilder()
                .setTitle(`${gamemode.toUpperCase().replace('_', ' ')} TEST RESULT`)
                .setColor(TIER_COLORS[tier] || '#2b2d31')
                .setThumbnail(targetMember.user.displayAvatarURL())
                .setDescription(
                    `**Player:** <@${targetMember.id}>\n` +
                    `**Tester:** <@${interaction.user.id}>\n` +
                    `**Gamemode:** ${gamemode.toUpperCase().replace('_', ' ')}\n` +
                    `**Result:** **${tier}**`
                )
                .setFooter({ text: 'Pojav Tier System' })
                .setTimestamp();

            await interaction.editReply({ embeds: [resultEmbed] });

            // Post to Announcement Channel
            const announceChannel = await interaction.client.channels.fetch(ANNOUNCEMENT_CHANNEL_ID);
            if (announceChannel) {
                const gmName = gamemode.toUpperCase().replace('_', ' ');
                const publicEmbed = new EmbedBuilder()
                    .setTitle(`${targetMember.user.username}'s Test Results 🏆`)
                    .setColor(TIER_COLORS[tier] || '#2b2d31')
                    .setThumbnail(targetMember.user.displayAvatarURL())
                    .addFields(
                        { name: 'Tester :', value: `<@${interaction.user.id}>` },
                        { name: 'Region:', value: region },
                        { name: 'IGN :', value: ign },
                        { name: 'Gamemode :', value: gmName },
                        { name: 'Previous Tier :', value: prevRank },
                        { name: 'Tier Earned :', value: `**${tier}**` }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Pojav Tier Ranking' });

                await announceChannel.send({
                    content: `<@${targetMember.id}>`,
                    embeds: [publicEmbed]
                });
            }

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'Failed to assign role. Check bot permissions and hierarchy!' });
        }
    }
};
