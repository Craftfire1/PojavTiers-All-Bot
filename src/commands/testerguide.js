const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('testerguide')
        .setDescription('View the official guide for testers'),

    async execute(interaction) {
        const guideEmbed = new EmbedBuilder()
            .setTitle('🛡️ POJAV TIER TESTER GUIDE BOT CREATED BY @ankit.craftfire')
            .setColor('#2b2d31')
            .setDescription('Welcome to the testing team! Here is how to manage tests efficiently.')
            .addFields(
                {
                    name: '1. Opening a Queue',
                    value: 'Use `/open q [gamemode]` in the staff command channel. This will post the queue panel. You will be automatically added as a tester.'
                },
                {
                    name: '2. Joining/Leaving Tester Slots',
                    value: 'Staff can join existing queues using `/join tester [gamemode]` or leave using `/leave tester [gamemode]`.'
                },
                {
                    name: '3. Picking a Player',
                    value: 'Use `/pick [gamemode]`. This automatically selects the player at **Position #1**, removes them from the queue, and creates a private testing ticket.'
                },
                {
                    name: '4. Recording Results',
                    value: 'Once the test is finished, use `/result player:[@user] tier:[tier]` inside the ticket. The bot will:\n• Assign the correct rank role\n• Auto-detect gamemode from category\n• Post a public announcement'
                },
                {
                    name: '5. Closing Tickets',
                    value: 'After the result is recorded, use `/ticket close` to delete the ticket channel after a 5-second countdown.'
                },
                {
                    name: '6. Finishing a Session',
                    value: 'When no more testers are available, use `/close q [gamemode]` to remove the queue panel and notify players that testing is over.'
                }
            )
            .setFooter({ text: 'PojavTiers Management' })
            .setTimestamp();

        await interaction.reply({ content: 'Posting Tester Guide...', ephemeral: true });
        await interaction.channel.send({ embeds: [guideEmbed] });
    }
};
