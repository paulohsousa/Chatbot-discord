const { Events } = require('discord.js');

module.exports = {
    //Indica qual evento esse arquivo se destina
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Pronto,Logado com ${client.user.tag}`);
    },
};