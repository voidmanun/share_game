const KV_URL = 'https://kvdb.io/8TCWfbDnLwPerKzwDXAVY7/leaderboard';

export async function getLeaderboard(): Promise<{name: string, score: number}[]> {
    try {
        const res = await fetch(KV_URL);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
                return data.sort((a: any, b: any) => b.score - a.score).slice(0, 10);
            }
        } else if (res.status === 404) {
            // No data yet
            return [];
        }
    } catch (e) {
        console.error('Failed to get leaderboard:', e);
    }
    return [];
}

export async function saveScore(name: string, score: number): Promise<{name: string, score: number}[]> {
    let board = await getLeaderboard();
    board.push({name, score});
    board = board.sort((a, b) => b.score - a.score).slice(0, 10);
    
    try {
        await fetch(KV_URL, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(board)
        });
    } catch (e) {
        console.error('Failed to save score:', e);
    }
    return board;
}
