import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { MessageHandler } from './services/MessageHandler';

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

const messageHandler = new MessageHandler();

client.once('ready', () => {
    console.log(`✅ Bot ligado como: ${client.user?.tag}`);
});

client.on('messageCreate', async (message) => {
    await messageHandler.handleMessage(message);
});

client.login(process.env.DISCORD_TOKEN)
    .catch(err => console.error('❌ Erro ao iniciar o bot:', err));