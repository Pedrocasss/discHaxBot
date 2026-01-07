import axios, { isAxiosError } from 'axios';
import { REPLAY_API } from '../config/constants';
import { IReplayUploadResponse, IReplayStats, IGameStats, IProcessedGoal, IProcessedPlayer } from '../interfaces/IReplayAPI';

export class ReplayService {
    /**
     * Faz upload do replay para a API
     */
    async uploadReplay(fileBuffer: Buffer): Promise<IReplayUploadResponse> {
        try {
            const response = await axios.post<IReplayUploadResponse>(
                `${REPLAY_API.BASE_URL}${REPLAY_API.ENDPOINTS.SAVE_REPLAY}`,
                fileBuffer,
                {
                    headers: {
                        'Content-Type': 'application/octet-stream'
                    }
                }
            );

            return response.data;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Erro ao fazer upload do replay: ${errorMessage}`);
        }
    }

    /**
     * Faz polling das stats até ficarem prontas
     */
    async getStats(replayId: string): Promise<IReplayStats> {
        const { MAX_ATTEMPTS, INTERVAL_MS } = REPLAY_API.POLLING;

        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            try {
                const response = await axios.get(
                    `${REPLAY_API.BASE_URL}${REPLAY_API.ENDPOINTS.GET_STATS(replayId)}`
                );

                // Mapear o JSON gigante para só os campos necessários
                const mappedData = this.mapReplayData(response.data);
                return mappedData;
            } catch (error: unknown) {
                if (isAxiosError(error) && error.response?.status === 404) {
                    await this.sleep(INTERVAL_MS);
                    continue;
                }
                
                const errorMessage = error instanceof Error ? error.message : String(error);
                throw new Error(`Erro ao buscar stats: ${errorMessage}`);
            }
        }

        throw new Error('Timeout: Stats não ficaram prontas a tempo');
    }

    /**
     * Mapeia o JSON da API para só os campos necessários
     */
    private mapReplayData(apiResponse: any): IReplayStats {
        console.log('🔍 Mapeando dados da API...');
        
        const stats = apiResponse.stats;
        
        const processedGames: IGameStats[] = stats.map((game: any) => {
            // Mapear golos
            const goals: IProcessedGoal[] = game.goals.map((goal: any) => ({
                scorer: goal.scorer,
                assist: goal.assist ? goal.assist.player : false,
                clockSeconds: goal.clockSeconds,
                for: goal.for
            }));
            
            // Mapear jogadores (só os que têm rating)
            const players: IProcessedPlayer[] = game.player
                .filter((p: any) => p.rating !== null)
                .map((p: any) => ({
                    nick: p.nick,
                    nation: p.nation,
                    rating: p.rating?.rating || 0,
                    goals: p.metrics.goals
                }))
                .sort((a: IProcessedPlayer, b: IProcessedPlayer) => b.rating - a.rating);
            
            // Encontrar MVP (jogador com maior rating)
            const mvp = players.length > 0 ? players[0].nick : 'N/A';
            
            return {
                matchId: game.matchId,
                scoreRed: game.scoreRed,
                scoreBlue: game.scoreBlue,
                stadiumName: game.stadiumName,
                redTeam: game.redTeam,
                blueTeam: game.blueTeam,
                goals: goals,
                players: players,
                mvpNick: mvp,
                possRed: game.possRed,
                possBlue: game.possBlue,
                minutes: game.minutes
            };
        });
        
        console.log(`✅ ${processedGames.length} jogos processados!`);
        
        return {
            replayName: apiResponse.replayName,
            savedAt: apiResponse.savedAt,
            games: processedGames
        };
    }

    getReplayUrl(replayId: string): string {
        return `${REPLAY_API.BASE_URL}${REPLAY_API.ENDPOINTS.GET_REPLAY(replayId)}`;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}