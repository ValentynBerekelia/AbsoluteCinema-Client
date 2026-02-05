export const getDynamicSeatColor = (name: string): string => {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('standard')) return '#4caf50';
    if (nameLower.includes('vip')) return '#f59f00';

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 4) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 65%, 50%)`;
};