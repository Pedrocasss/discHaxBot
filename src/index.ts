import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", () => {
    console.log(`Bot ligado como: ${client.user?.tag}`);
});

client.login(process.env.DISCORD_TOKEN)
    .catch(err => console.error('Erro ao iniciar o bot:', err));
