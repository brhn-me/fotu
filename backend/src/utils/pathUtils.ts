export function getTriePath(id: string): string {
    if (id.length < 4) return id; // Fallback for short IDs
    const part1 = id.substring(0, 2);
    const part2 = id.substring(2, 4);
    return `${part1}/${part2}/${id}`;
}
