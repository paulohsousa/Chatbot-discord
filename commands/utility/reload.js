const {SlashCommandBuilder} = require('discord.js');

module.exports = {
    category: 'utility',
    data:new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Recarrega um comando')
    .addStringOption(option => option.setName('command')
    .setDescription('O Comando foi carregado')
    .setRequired(true)),
    async execute(interaction) {
        //Verificar se o comando existe
        const commandName = interaction.options.getString('command',true);
        const command = interaction.client.commands.get(commandName);

        if(!command) {
            return interaction.reply(`Não há comando com o nome \`${commandName}\`!`);
        }
        delete require.cache[require.resolve(`../${command.category}/${command.data.name}.js`)];
        try {
            interaction.client.commands.delete(command.data.name);
            const newCommand = require(`../${command.category}/${command.data.name}.js`);
            interaction.client.commands.set(newCommand.data.name, newCommand);
            await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);
        }catch(error) {
            console.error(error);
            await interaction.reply(`Ocorreu um erro ao recarregar um comando \`${command.data.name}\`:\n\`${error.message}\``);
        }

    },
};