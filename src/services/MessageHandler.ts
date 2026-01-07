import { Message } from 'discord.js';
import { ReplayService } from './ReplayService';
import { DiscordService } from './DiscordService';
import axios from 'axios';

export class MessageHandler {
    private replayService: ReplayService;
    private discordService: DiscordService;

    constructor() {
        this.replayService = new ReplayService();
        this.discordService = new DiscordService();
    }

    /**
     * Processa mensagem que menciona o bot
     */
    async handleMessage(message: Message): Promise<void> {
        // Ignorar mensagens do próprio bot
        if (message.author.bot) return;

        // Verificar se o bot foi mencionado
        if (!message.mentions.has(message.client.user!)) return;

        // Verificar se tem attachment .hbr2
        const attachment = message.attachments.find(att => att.name?.endsWith('.hbr2'));
        
        if (!attachment) {
            await this.discordService.sendError(
                message, 
                'Por favor, anexa um ficheiro `.hbr2` junto com a menção!'
            );
            return;
        }

        // Enviar mensagem de processamento
        const processingMsg = await this.discordService.sendProcessing(message);

        try {
            // Download do ficheiro
            const fileBuffer = await this.downloadAttachment(attachment.url);

            // Upload para a API
            const uploadResponse = await this.replayService.uploadReplay(fileBuffer);
            console.log(`Replay uploaded: ${uploadResponse.id}`);

            // Buscar stats (com polling)
            const stats = await this.replayService.getStats(uploadResponse.id);
            console.log(`Stats prontas para: ${uploadResponse.id}`);
            console.log('Estrutura das stats:', JSON.stringify(stats, null, 2)); // <-- ADICIONA ESTA LINHA

            // Gerar URL do replay
            const replayUrl = this.replayService.getReplayUrl(uploadResponse.id);

            // Criar e enviar embeds
            const embeds = this.discordService.createStatsEmbed(stats, replayUrl);

            // Editar mensagem de processamento ou enviar nova
            await processingMsg.delete();
            await message.reply({ embeds });

        } catch (error: unknown) {
            console.error('Erro ao processar replay:', error);
            
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            await processingMsg.delete();
            await this.discordService.sendError(message, errorMessage);
        }
    }

    /**
     * Faz download do attachment do Discord
     */
    private async downloadAttachment(url: string): Promise<Buffer> {
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            return Buffer.from(response.data);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Erro ao fazer download do ficheiro: ${errorMessage}`);
        }
    }
}