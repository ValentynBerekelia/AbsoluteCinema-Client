import { useEffect, useState } from 'react';
import styles from './HallsPage.module.css';
import {
    addSeatsToHall,
    createHall,
    deleteHall,
    getHallById,
    getHalls,
    updateHall,
    updateSeatInHall,
    deleteSeatFromHall,
    getSeatTypes
} from '@/api';
import { Hall, Seat, SeatType, mapHallDetailsFromApi, mapHallsListFromApi, mapSeatTypesFromApi } from '@/types/hall';
import { HallListItem } from '@/components/HallListItem/HallListItem';

export const HallsPage = () => {


    const [halls, setHalls] = useState<Hall[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedHallId, setExpandedHallId] = useState<string | null>(null);
    const [newHallName, setNewHallName] = useState('');
    const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
    const [defaultSeatType, setDefaultSeatType] = useState<string>('');

    const [hallNameEdits, setHallNameEdits] = useState<Record<string, string>>({});
    const [loadingHallDetails, setLoadingHallDetails] = useState<Record<string, boolean>>({});
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

    const [selectedSeatTypeByHall, setSelectedSeatTypeByHall] = useState<Record<string, string>>({});
    const [deleteModeByHall, setDeleteModeByHall] = useState<Record<string, boolean>>({});

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [hallsData, response] = await Promise.all([
                getHalls(),
                getSeatTypes()
            ]);

            setHalls(mapHallsListFromApi(hallsData));

            const formattedTypes = mapSeatTypesFromApi(response);
            setSeatTypes(formattedTypes);

            if (formattedTypes.length > 0) {
                const standardType = formattedTypes.find(t =>
                    t.name.toLowerCase().includes('standard')
                );

                const defaultId = standardType ? standardType.id : formattedTypes[0].id;

                setDefaultSeatType(defaultId);
            }

        } catch (err) {
            console.error(err);
            setError('Failed to load initial data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInitialData(); }, []);

    const loadHallDetails = async (hallId: string) => {
        setLoadingHallDetails(prev => ({ ...prev, [hallId]: true }));
        try {
            const data = await getHallById(hallId);
            const { seats, availableSeatTypes } = mapHallDetailsFromApi(data);

            setHalls(prev => prev.map(h =>
                h.id === hallId ? { ...h, seats, availableSeatTypes: seatTypes } : h
            ));
        } catch (err) {
            console.error('Failed to load details', err);
        } finally {
            setLoadingHallDetails(prev => ({ ...prev, [hallId]: false }));
        }
    };

    const handleCreateHall = async () => {
        if (!newHallName.trim()) return;
        try {
            setActionLoading(prev => ({ ...prev, createHall: true }));
            setError(null);

            const response = await createHall({ name: newHallName.trim() });
            const hallId = response?.id || response?.hallId || response;

            if (hallId && typeof hallId === 'string') {
                const seats = [];
                for (let row = 1; row <= 6; row++) {
                    for (let seatNum = 1; seatNum <= 9; seatNum++) {
                        seats.push({ row, number: seatNum });
                    }
                }
                await addSeatsToHall({ hallId, seatTypeId: defaultSeatType, seats });
            }

            setNewHallName('');
            await fetchInitialData();
        } catch (err) {
            console.error('Create hall catch block', err);
            await fetchInitialData();
        } finally {
            setActionLoading(prev => ({ ...prev, createHall: false }));
        }
    };

    const handleUpdateHall = async (hallId: string) => {
        const hallName = hallNameEdits[hallId]?.trim();
        if (!hallName) return;
        try {
            setActionLoading(prev => ({ ...prev, [`update-${hallId}`]: true }));
            await updateHall(hallId, { hallName });
            setHalls(prev => prev.map(h => h.id === hallId ? { ...h, name: hallName } : h));
        } catch (err) { setError('Failed to update hall'); }
        finally { setActionLoading(prev => ({ ...prev, [`update-${hallId}`]: false })); }
    };

    const handleDeleteHall = async (hallId: string) => {
        if (!window.confirm('Delete this hall?')) return;
        try {
            setActionLoading(prev => ({ ...prev, [`delete-${hallId}`]: true }));
            await deleteHall(hallId);
            setHalls(prev => prev.filter(h => h.id !== hallId));
        } catch (err) { setError('Failed to delete hall'); }
        finally { setActionLoading(prev => ({ ...prev, [`delete-${hallId}`]: false })); }
    };


    const getRowStats = (seats: Seat[], rowNum: number) => {
        const rowSeats = seats.filter(s => s.row === rowNum);
        if (rowSeats.length === 0) return { minSeat: 0, maxSeat: 0, count: 0 };
        const numbers = rowSeats.map(s => s.number).sort((a, b) => a - b);
        return { minSeat: numbers[0], maxSeat: numbers[numbers.length - 1], count: rowSeats.length };
    };

    const handleSeatGridClick = async (hallId: string, seat: Seat) => {
        if (!seat.seatId) return;

        if (deleteModeByHall[hallId]) {
            const hall = halls.find(h => h.id === hallId);
            if (!hall || !hall.seats) return;

            const rowSeats = hall.seats.filter(s => s.row === seat.row);
            const seatNumbers = rowSeats.map(s => s.number);
            const maxNum = Math.max(...seatNumbers);
            const maxRow = Math.max(...hall.seats.map(s => s.row));

            const isLastRowInHall = seat.row === maxRow;
            const isOnlySeatInRow = rowSeats.length === 1;

            if (seat.number === 1 && !(isLastRowInHall && isOnlySeatInRow)) {
                setError("You cannot delete the first seat! Rows must start from 1. You can only remove row 1 if it's the last row remaining.");
                setTimeout(() => setError(null), 3000);
                return;
            }

            const isLastInRow = seat.number === maxNum;
            if (!isLastInRow) {
                setError("You can only delete seats from the end of the row!");
                setTimeout(() => setError(null), 3000);
                return;
            }

            if (isOnlySeatInRow && !isLastRowInHall) {
                setError("You cannot delete the entire row if it's not the last row in the hall!");
                setTimeout(() => setError(null), 3000);
                return;
            }

            try {
                await deleteSeatFromHall(seat.seatId);

                setHalls(prev => prev.map(h =>
                    h.id === hallId ? { ...h, seats: h.seats?.filter(s => s.seatId !== seat.seatId) } : h
                ));
            } catch (err) { setError('Failed to delete seat'); }
            return;
        }

        const selectedType = selectedSeatTypeByHall[hallId];
        if (selectedType) {
            try {
                await updateSeatInHall(hallId, seat.seatId, {
                    row: seat.row,
                    number: seat.number,
                    seatTypeId: selectedType
                });
                setHalls(prevHalls => prevHalls.map(h =>
                    h.id === hallId
                        ? { ...h, seats: h.seats?.map(s => s.seatId === seat.seatId ? { ...s, seatTypeId: selectedType } : s) }
                        : h
                ));
            } catch (err) {
                setError('Failed to update seat type');
            }
        }
    };

    const addSeatToRowEdge = async (hallId: string, rowNum: number, side: 'left' | 'right', seatTypeId: string) => {
        const hall = halls.find(h => h.id === hallId);
        if (!hall?.seats) return;

        const stats = getRowStats(hall.seats, rowNum);
        const newNum = side === 'left' ? stats.minSeat - 1 : stats.maxSeat + 1;
        if (newNum < 1) return;

        try {
            await addSeatsToHall({
                hallId,
                seatTypeId,
                seats: [{ row: rowNum, number: newNum }]
            });

            const data = await getHallById(hallId);
            const { seats } = mapHallDetailsFromApi(data);

            setHalls(prev => prev.map(h =>
                h.id === hallId ? { ...h, seats } : h
            ));
        } catch (err) { console.error(err); }
    };

    const addNewRow = async (hallId: string, seatTypeId: string) => {
        const hall = halls.find(h => h.id === hallId);
        if (!hall?.seats?.length) return;

        const maxRow = Math.max(...hall.seats.map(s => s.row));
        const refStats = getRowStats(hall.seats, maxRow);
        const seatsToAdd = Array.from({ length: refStats.count }, (_, i) => ({
            row: maxRow + 1,
            number: i + refStats.minSeat
        }));

        try {
            await addSeatsToHall({ hallId, seatTypeId, seats: seatsToAdd });

            const data = await getHallById(hallId);
            const { seats } = mapHallDetailsFromApi(data);

            setHalls(prev => prev.map(h =>
                h.id === hallId ? { ...h, seats } : h
            ));
        } catch (err) { console.error(err); }
    };

    return (
        <div className={styles["halls-page"]}>
            <div className={styles["halls-header"]}>
                <h2>Halls Management</h2>
                <button className={styles["refresh-btn"]} onClick={fetchInitialData} disabled={loading}>Refresh</button>
            </div>

            {error && <div className={styles["error-message"]}>{error}</div>}

            <div className={styles["section-card"]}>
                <h3>Create Hall</h3>
                <div className={styles["form-row"]}>
                    <input
                        type="text"
                        value={newHallName}
                        onChange={e => setNewHallName(e.target.value)}
                        placeholder="Hall name"
                        className={styles["text-input"]}
                    />
                    <button
                        className={styles["primary-btn"]}
                        onClick={handleCreateHall}
                        disabled={!newHallName.trim() || actionLoading.createHall}
                    >
                        {actionLoading.createHall ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </div>

            <div className={styles["section-card"]}>
                <h3>All Halls</h3>
                {loading ? (
                    <div className={styles["loading"]}>Loading...</div>
                ) : (
                    <div className={styles["halls-list"]}>
                        {halls.map(hall => (
                            <HallListItem
                                key={hall.id}
                                hall={{
                                    ...hall,
                                    availableSeatTypes: seatTypes
                                }}
                                expandedHallId={expandedHallId}
                                onToggleExpand={() => {
                                    const isExpanding = expandedHallId !== hall.id;
                                    setExpandedHallId(isExpanding ? hall.id : null);
                                    if (isExpanding) loadHallDetails(hall.id);
                                }}
                                onDeleteHall={handleDeleteHall}
                                hallNameEdits={hallNameEdits}
                                onNameEditChange={(id, name) => setHallNameEdits(prev => ({ ...prev, [id]: name }))}
                                onUpdateHall={handleUpdateHall}
                                selectedSeatTypeByHall={selectedSeatTypeByHall}
                                onSelectSeatType={(id, typeId) => {
                                    setSelectedSeatTypeByHall(prev => ({ ...prev, [id]: typeId }));
                                    setDeleteModeByHall(prev => ({ ...prev, [id]: false }));
                                }}
                                deleteModeByHall={deleteModeByHall}
                                onToggleDeleteMode={(id) => {
                                    setDeleteModeByHall(prev => ({ ...prev, [id]: !prev[id] }));
                                    setSelectedSeatTypeByHall(prev => ({ ...prev, [id]: '' }));
                                }}
                                loadingHallDetails={loadingHallDetails}
                                actionLoading={actionLoading}
                                handleSeatGridClick={handleSeatGridClick}
                                addSeatToRowEdge={addSeatToRowEdge}
                                getRowStats={getRowStats}
                                addNewRow={addNewRow}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};