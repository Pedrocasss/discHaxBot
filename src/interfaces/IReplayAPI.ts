

export interface IReplayUploadResponse {
    id: string;
    url: string;
}


export interface IProcessedPlayer {
    nick: string;
    nation: string;
    rating: number;
    goals: number;
}

export interface IProcessedGoal {
    scorer: string;           
    assist: string | false;  
    clockSeconds: number;    
    for: "Red" | "Blue";     
}

export interface IGameStats {
    // Info do jogo
    matchId: number;
    scoreRed: number;
    scoreBlue: number;
    stadiumName: string;
    
    // Equipas
    redTeam: string[];
    blueTeam: string[];
    
    // Golos
    goals: IProcessedGoal[];
    
    // Jogadores (ordenados por rating, maior primeiro)
    players: IProcessedPlayer[];
    
    // MVP (jogador com maior rating)
    mvpNick: string;
    
    // Stats extras
    possRed: number;
    possBlue: number;
    minutes: number;
}

export interface IReplayStats {
    replayName: string;
    savedAt: string;
    games: IGameStats[];
}