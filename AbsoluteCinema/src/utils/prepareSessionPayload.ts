export const prepareSessionPayload = (sessionCard: any, date: string, movieId: string) => {
    const prices = Object.keys(sessionCard.enabledTypes)
        .filter(typeId => sessionCard.enabledTypes[typeId] && sessionCard.seatPrices[typeId])
        .map(typeId => ({
            seatTypeId: typeId,
            price: Number(sessionCard.seatPrices[typeId])
        }));

    return {
        movieId: movieId,
        hallId: sessionCard.hall,
        format: 2,
        startTime: `${date}T${sessionCard.time}:00.000Z`,
        prices: prices
    };
};