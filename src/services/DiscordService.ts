import { EmbedBuilder, Message } from 'discord.js';
import { DISCORD } from '../config/constants';
import { IReplayStats, IGameStats } from '../interfaces/IReplayAPI';

export class DiscordService {
    /**
     * Cria embed com informações do replay
     */
    createStatsEmbed(stats: IReplayStats, replayUrl: string): EmbedBuilder[] {
        const embeds: EmbedBuilder[] = [];

        // Embed principal com info do replay
        const mainEmbed = new EmbedBuilder()
            .setColor(DISCORD.COLOR.SUCCESS)
            .setTitle('Replay Processado!')
            .setDescription(`**${stats.replayName}**`)
            .addFields(
                { name: 'Download', value: `[Clique aqui](${replayUrl})`, inline: true },
                { name: '📊 Total de Jogos', value: `${stats.games.length}`, inline: true },
                { name: '📅 Data', value: new Date(stats.savedAt).toLocaleString('pt-PT'), inline: true }
            )
            .setTimestamp();

        embeds.push(mainEmbed);

        // Embed para cada jogo
        stats.games.forEach((game, index) => {
            const gameEmbed = this.createGameEmbed(game, index + 1);
            embeds.push(gameEmbed);
        });

        return embeds;
    }

    /**
     * Cria embed para um jogo específico
     */
    private createGameEmbed(game: IGameStats, gameNumber: number): EmbedBuilder {
        const winner = game.scoreRed > game.scoreBlue ? '🔴 Red' : 
                       game.scoreBlue > game.scoreRed ? '🔵 Blue' : 'Empate';
        
        // Calcular posse em percentagem
        const totalPoss = game.possRed + game.possBlue;
        const redPossPercent = ((game.possRed / totalPoss) * 100).toFixed(1);
        const bluePossPercent = ((game.possBlue / totalPoss) * 100).toFixed(1);

        const embed = new EmbedBuilder()
            .setColor(DISCORD.COLOR.INFO)
            .setTitle(`⚽ Jogo ${gameNumber} - ${game.stadiumName}`)
            .addFields(
                { 
                    name: '📊 Resultado', 
                    value: `🔴 **${game.scoreRed}** - **${game.scoreBlue}** 🔵\n🏆 Vencedor: **${winner}**`,
                    inline: false 
                },
                { 
                    name: '⭐ MVP', 
                    value: `**${game.mvpNick}** (${this.getMvpRating(game).toFixed(2)})`,
                    inline: true 
                },
                { 
                    name: '⏱️ Duração', 
                    value: `${game.minutes.toFixed(1)} min`,
                    inline: true 
                },
                { 
                    name: '⚡ Posse de Bola', 
                    value: `🔴 ${redPossPercent}%\n🔵 ${bluePossPercent}%`,
                    inline: true 
                }
            );

        // Adicionar golos se houver
        if (game.goals.length > 0) {
            const goalsText = this.formatGoals(game.goals);
            embed.addFields({ name: '⚽ Golos', value: goalsText, inline: false });
        }

        // Top 3 jogadores de cada equipa
        const redPlayers = game.players.filter(p => game.redTeam.includes(p.nick));
        const bluePlayers = game.players.filter(p => game.blueTeam.includes(p.nick));

        const topRed = this.formatTopPlayers(redPlayers.slice(0, 3));
        const topBlue = this.formatTopPlayers(bluePlayers.slice(0, 3));

        if (topRed) embed.addFields({ name: '🔴 Top Red', value: topRed, inline: true });
        if (topBlue) embed.addFields({ name: '🔵 Top Blue', value: topBlue, inline: true });

        return embed;
    }

    /**
     * Formata lista de golos
     */
    private formatGoals(goals: Array<{ scorer: string; assist: string | false; clockSeconds: number; for: string }>): string {
        return goals.map((goal, i) => {
            const time = this.formatTime(goal.clockSeconds);
            const emoji = goal.for === 'Red' ? '🔴' : '🔵';
            const assist = goal.assist ? ` (assist: ${goal.assist})` : '';
            return `${i + 1}. ${emoji} **${goal.scorer}** - ${time}${assist}`;
        }).join('\n');
    }

    /**
     * Converte segundos para MM:SS
     */
    private formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Formata top players para exibição
     */
    private formatTopPlayers(players: Array<{ nick: string; rating: number; goals: number }>): string {
        return players
            .map((p, i) => {
                const goalsText = p.goals > 0 ? ` ⚽${p.goals}` : '';
                return `${i + 1}. **${p.nick}** - ${p.rating.toFixed(2)}${goalsText}`;
            })
            .join('\n') || 'N/A';
    }

    /**
     * Obtém rating do MVP
     */
    private getMvpRating(game: IGameStats): number {
        return game.players.find(p => p.nick === game.mvpNick)?.rating || 0;
    }

    /**
     * Envia mensagem de erro
     */
    async sendError(message: Message, errorText: string): Promise<void> {
        const embed = new EmbedBuilder()
            .setColor(DISCORD.COLOR.ERROR)
            .setTitle('Erro')
            .setDescription(errorText)
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    /**
     * Envia mensagem de processamento
     */
    async sendProcessing(message: Message): Promise<Message> {
        const embed = new EmbedBuilder()
            .setColor(DISCORD.COLOR.INFO)
            .setTitle('⏳ Processando...')
            .setDescription('A fazer upload e processar o replay...')
            .setTimestamp();

        return await message.reply({ embeds: [embed] });
    }
}