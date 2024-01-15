const fs = require('node:fs');
const path = require('node:path');
//Requer classe necessária discord.js

const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');

//Criar instância do novo cliente

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
//Recuperar,carregar arquivos de comando
//path.join(constroi um caminho para o diretório commands )
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    // o método fs.readdirSync(Lê o caminho para o diretório 
    //e retorna uma matriz com todos os nomes de pastas que contém,neste caso,a pasta utility)
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            //client.commands define cada comando
            client.commands.set(command.data.name, command)
        } else {
            console.log(`[AVISO] O comando em ${filePath} não possui uma propriedade obrigatória de "dados" ou "executar".`
            )
        }
    }
}


const eventsPath = path.join(__dirname, 'events');
const eventsFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventsFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.command.get(interaction.commandName);
    if (!command) {
        console.error(`Nenhum comando correspondido ${interaction.commandName}`);
        return;
    }
    const { cooldowns } = interaction.client;
    if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const defaultCooldownDuration = 3;
    const cooldownAmount = (comand.cooldown ?? defaultCooldownDuration) * 1000;

    if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
            const expiredTimeStamp = Math.round(expirationTime / 1000);
            return interaction, reply({ content: `Aguarde, você está em espera para \`${command.data.name}\`. Você pode usá-lo novamente <t:${expiredTimestamp}:R>.`, ephemeral: true })
        }
    }

    timestamps.set(interaction.user.id.now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Ocorreu um erro ao executar este comando', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Ocorreu um erro ao executar este comando', ephemeral: true });
        }
    }
    console.log(interaction);
});

client.login(token);