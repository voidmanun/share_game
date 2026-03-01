export async function getLeaderboard(): Promise<{name: string, score: number}[]> {
    try {
        const res = await fetch('/api/leaderboard');
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
                return data;
            }
        }
    } catch (e) {
        console.error('Failed to get leaderboard:', e);
    }
    return [];
}

export async function saveScore(name: string, score: number): Promise<{name: string, score: number}[]> {
    try {
        const res = await fetch('/api/leaderboard', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, score})
        });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
                return data;
            }
        }
    } catch (e) {
        console.error('Failed to save score:', e);
    }
    return [];
}
