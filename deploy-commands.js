//Registrar e atualizar os comandos de barra    
const {REST,Routes} = require('discord.js');
const {clientId,guildId,token} =  require('./config.json');

const fs = require('node:fs');
const path = require('node:path');

const commands = [];

const foldersPath = path.join(__dirname,'commands');
const commandFolders  = fs.readdirSync(foldersPath);

for(const folder of commandFolders) {
    const commandsPath = path.join(foldersPath,folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for(const file of commandFiles) {
        const filePath = path.join(commandsPath,file);
        const command = require(filePath);
        if('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        }else {
            console.log(`[AVISO] O comando em ${filePath} não possui uma propriedade "data" ou "execute" obrigatória.`);
        }

    }
}
//Construindo e preparando uma instância para o módulo rest     
const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`Iniciada a atualização dos comandos do aplicativo ${commands.length} (/).`);
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId,guildId),
            {body:commands}
        );
        console.log(`Comandos do aplicativo ${data.length} (/) recarregados com sucesso.`);

    }catch(error){
        console.error(error);
    }
})