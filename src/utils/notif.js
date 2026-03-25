const { EmbedBuilder } = require('discord.js');

async function notifyNewFirstPlayer(client, gm, queue) {
    if (queue.length > 0) {
        const firstPlayer = queue[0];
        try {
            const user = await client.users.fetch(firstPlayer.userId);
            const embed = new EmbedBuilder()
                .setTitle('Queue Position Updated')
                .setColor('#2b2d31')
                .setDescription(
                    'Your position in the queue has changed.\n' +
                    'You are now **#1** in the queue.'
                )
                .setTimestamp();

            await user.send({ embeds: [embed] }).catch(() => { });
        } catch (e) {
            console.error('Failed to DM player:', e);
        }
    }
}

module.exports = { notifyNewFirstPlayer };
