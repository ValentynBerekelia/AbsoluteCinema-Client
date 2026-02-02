import { useEffect, useMemo, useState } from 'react';
import styles from './HallsPage.module.css';
import {
    addSeatsToHall,
    createHall,
    deleteHall,
    deleteSeatFromHall,
    getHallById,
    getHalls,
    updateHall,
    updateSeatInHall
} from '@/api';
import { Hall, Seat, SeatType, mapHallDetailsFromApi, mapHallsListFromApi } from '@/types/hall';
import { HallForm } from '@/components/HallForm/HallForm';
import { HallListItem } from '@/components/HallListItem/HallListItem';

interface SeatDraft {
    row: string;
    number: string;
    seatTypeId: string;
}

export const HallsPage = () => {
    const ALL_SEAT_TYPES: SeatType[] = [
        { id: '6ea339c5-b6c8-4646-ab54-7d5f71644a87', name: 'Standart' },
        { id: '0d678ce0-e043-4d20-b136-e295cfe00539', name: 'VIP' }
    ];

    const mergeSeatTypes = (types: SeatType[] = []) => {
        const byId = new Map<string, SeatType>();
        ALL_SEAT_TYPES.forEach(t => byId.set(t.id, t));
        types.forEach(t => byId.set(t.id, t));
        return Array.from(byId.values());
    };
    const [halls, setHalls] = useState<Hall[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedHallId, setExpandedHallId] = useState<string | null>(null);
    const [newHallName, setNewHallName] = useState('');
    const [hallNameEdits, setHallNameEdits] = useState<Record<string, string>>({});
    const [hallDetailsLoaded, setHallDetailsLoaded] = useState<Record<string, boolean>>({});
    const [loadingHallDetails, setLoadingHallDetails] = useState<Record<string, boolean>>({});
    const [seatDrafts, setSeatDrafts] = useState<Record<string, SeatDraft>>({});
    const [seatEdits, setSeatEdits] = useState<Record<string, SeatDraft>>({});
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
    const [selectedSeatTypeByHall, setSelectedSeatTypeByHall] = useState<Record<string, string>>({});
    const [deleteModeByHall, setDeleteModeByHall] = useState<Record<string, boolean>>({});
    const [pendingTypeChanges, setPendingTypeChanges] = useState<Record<string, string>>({});
    const [pendingDeletes, setPendingDeletes] = useState<Record<string, boolean>>({});

    const fetchHalls = async () => {
        try {
            setLoading(true);
            const data = await getHalls();
            const mapped = mapHallsListFromApi(data);
            setHalls(mapped);
            setHallDetailsLoaded({});
            setExpandedHallId(null);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch halls', err);
            setError('Failed to load halls');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHalls();
    }, []);

    const loadHallDetails = async (hallId: string) => {
        setLoadingHallDetails(prev => ({ ...prev, [hallId]: true }));
        try {
            const data = await getHallById(hallId);
            const { seats, availableSeatTypes } = mapHallDetailsFromApi(data) as {
                seats: Seat[];
                availableSeatTypes: SeatType[];
            };

            const mergedSeatTypes = mergeSeatTypes(availableSeatTypes);

            setHalls(prev => prev.map(h => (
                h.id === hallId ? { ...h, seats, availableSeatTypes: mergedSeatTypes } : h
            )));

            setHallDetailsLoaded(prev => ({ ...prev, [hallId]: true }));

            setSeatEdits(prev => {
                const updates: Record<string, SeatDraft> = { ...prev };
                seats.forEach(s => {
                    if (!s.seatId) return;
                    if (!updates[s.seatId]) {
                        updates[s.seatId] = {
                            row: String(s.row),
                            number: String(s.number),
                            seatTypeId: s.seatTypeId
                        };
                    }
                });
                return updates;
            });

            setSeatDrafts(prev => {
                if (prev[hallId]) return prev;
                const defaultSeatType = mergedSeatTypes?.[0]?.id ?? '';
                return {
                    ...prev,
                    [hallId]: { row: '', number: '', seatTypeId: defaultSeatType }
                };
            });

        } catch (err) {
            console.error('Failed to load hall details', err);
            setError('Failed to load hall details');
        } finally {
            setLoadingHallDetails(prev => ({ ...prev, [hallId]: false }));
        }
    };

    const handleToggleHall = async (hallId: string) => {
        const next = expandedHallId === hallId ? null : hallId;
        setExpandedHallId(next);
        if (next && !hallDetailsLoaded[hallId]) {
            await loadHallDetails(hallId);
        }
    };

    const handleCreateHall = async () => {
        if (!newHallName.trim()) {
            setError('Please provide a hall name');
            return;
        }
        try {
            setActionLoading(prev => ({ ...prev, createHall: true }));
            const response = await createHall({ name: newHallName.trim() });
            const hallId = response?.id || response?.hallId;
            
            // Auto-fill with 6x9 seats with the specified seat type
            if (hallId) {
                const SEAT_TYPE_ID = '6ea339c5-b6c8-4646-ab54-7d5f71644a87';
                const seats: Array<{ row: number; number: number }> = [];
                
                for (let row = 1; row <= 6; row++) {
                    for (let seatNum = 1; seatNum <= 9; seatNum++) {
                        seats.push({ row, number: seatNum });
                    }
                }
                
                await addSeatsToHall({
                    hallId,
                    seatTypeId: SEAT_TYPE_ID,
                    seats
                });
            }
            
            setNewHallName('');
            await fetchHalls();
        } catch (err) {
            console.error('Create hall failed', err);
            setError('Failed to create hall');
        } finally {
            setActionLoading(prev => ({ ...prev, createHall: false }));
        }
    };

    const handleUpdateHall = async (hallId: string) => {
        const hallName = hallNameEdits[hallId]?.trim();
        if (!hallName) {
            setError('Hall name cannot be empty');
            return;
        }
        try {
            setActionLoading(prev => ({ ...prev, [`update-${hallId}`]: true }));
            await updateHall(hallId, { hallName });
            setHalls(prev => prev.map(h => (h.id === hallId ? { ...h, name: hallName } : h)));
        } catch (err) {
            console.error('Update hall failed', err);
            setError('Failed to update hall');
        } finally {
            setActionLoading(prev => ({ ...prev, [`update-${hallId}`]: false }));
        }
    };

    const handleDeleteHall = async (hallId: string) => {
        try {
            setActionLoading(prev => ({ ...prev, [`delete-${hallId}`]: true }));
            await deleteHall(hallId);
            setHalls(prev => prev.filter(h => h.id !== hallId));
            setExpandedHallId(prev => (prev === hallId ? null : prev));
        } catch (err) {
            console.error('Delete hall failed', err);
            setError('Failed to delete hall');
        } finally {
            setActionLoading(prev => ({ ...prev, [`delete-${hallId}`]: false }));
        }
    };

    const handleAddSeat = async (hallId: string, draft: SeatDraft) => {
        const row = Number(draft.row);
        const number = Number(draft.number);
        if (!row || !number || !draft.seatTypeId) {
            setError('Row, number, and seat type are required');
            return;
        }
        try {
            setActionLoading(prev => ({ ...prev, [`add-seat-${hallId}`]: true }));
            await addSeatsToHall({
                hallId,
                seatTypeId: draft.seatTypeId,
                seats: [{ row, number }]
            });
            await loadHallDetails(hallId);
            setSeatDrafts(prev => ({
                ...prev,
                [hallId]: { ...prev[hallId], row: '', number: '' }
            }));
        } catch (err) {
            console.error('Add seat failed', err);
            setError('Failed to add seat');
        } finally {
            setActionLoading(prev => ({ ...prev, [`add-seat-${hallId}`]: false }));
        }
    };

    const handleUpdateSeat = async (hallId: string, seat: Seat) => {
        if (!seat.seatId) return;
        const draft = seatEdits[seat.seatId];
        if (!draft) return;
        const row = Number(draft.row);
        const number = Number(draft.number);
        if (!row || !number || !draft.seatTypeId) {
            setError('Row, number, and seat type are required');
            return;
        }
        try {
            setActionLoading(prev => ({ ...prev, [`update-seat-${seat.seatId}`]: true }));
            await updateSeatInHall(hallId, seat.seatId, {
                row,
                number,
                seatTypeId: draft.seatTypeId
            });
            await loadHallDetails(hallId);
        } catch (err) {
            console.error('Update seat failed', err);
            setError('Failed to update seat');
        } finally {
            setActionLoading(prev => ({ ...prev, [`update-seat-${seat.seatId}`]: false }));
        }
    };

    const handleDeleteSeat = async (hallId: string, seatId?: string) => {
        if (!seatId) return;
        try {
            setActionLoading(prev => ({ ...prev, [`delete-seat-${seatId}`]: true }));
            await deleteSeatFromHall(seatId);
            await loadHallDetails(hallId);
        } catch (err) {
            console.error('Delete seat failed', err);
            setError('Failed to delete seat');
        } finally {
            setActionLoading(prev => ({ ...prev, [`delete-seat-${seatId}`]: false }));
        }
    };

    const handleSelectSeatType = (hallId: string, seatTypeId: string) => {
        setSelectedSeatTypeByHall(prev => ({ ...prev, [hallId]: seatTypeId }));
        setDeleteModeByHall(prev => ({ ...prev, [hallId]: false }));
    };

    const handleToggleDeleteMode = (hallId: string) => {
        setDeleteModeByHall(prev => ({ ...prev, [hallId]: !prev[hallId] }));
        setSelectedSeatTypeByHall(prev => ({ ...prev, [hallId]: '' }));
    };

    const applySeatTypeToSeat = (hallId: string, seat: Seat, seatTypeId: string) => {
        if (!seat.seatId) return;
        setPendingTypeChanges(prev => ({ ...prev, [seat.seatId as string]: seatTypeId }));
        setPendingDeletes(prev => ({ ...prev, [seat.seatId as string]: false }));

        setSeatEdits(prev => ({
            ...prev,
            [seat.seatId as string]: {
                row: String(seat.row),
                number: String(seat.number),
                seatTypeId
            }
        }));
    };

    const toggleSeatDelete = (hallId: string, seat: Seat) => {
        if (!seat.seatId) return;
        const hallSeats = halls.find(h => h.id === hallId)?.seats || [];
        const rowSeats = hallSeats.filter(s => s.row === seat.row);
        const rowStats = getRowStats(hallSeats, seat.row);
        
        const isCurrentlyDeleted = !!pendingDeletes[seat.seatId];
        
        if (!isCurrentlyDeleted) {

            const isRightEdge = seat.number === rowStats.maxSeat;
            const rightNeighborDeleted = rowSeats.some(s => s.number === seat.number + 1 && s.seatId && pendingDeletes[s.seatId]);
            
            if (!isRightEdge && !rightNeighborDeleted) {
                setError('Can only delete seats from the end of the row');
                return;
            }
        } else {

            const leftNeighborDeleted = rowSeats.some(s => s.number === seat.number - 1 && s.seatId && pendingDeletes[s.seatId]);
            const isLeftEdge = seat.number === rowStats.minSeat;

            const rightNeighborDeleted = rowSeats.some(s => s.number === seat.number + 1 && s.seatId && pendingDeletes[s.seatId]);
            const isRightEdge = seat.number === rowStats.maxSeat;
            
            if ((leftNeighborDeleted && rightNeighborDeleted) || (isRightEdge && leftNeighborDeleted)) {
                setError('Cannot deselect - would break the deletion sequence');
                return;
            }
        }
        
        setPendingDeletes(prev => ({ ...prev, [seat.seatId as string]: !prev[seat.seatId as string] }));
    };

    const handleSeatGridClick = (hallId: string, seat: Seat) => {
        if (!seat.seatId) return;
        if (deleteModeByHall[hallId]) {
            toggleSeatDelete(hallId, seat);
            return;
        }
        const selectedType = selectedSeatTypeByHall[hallId];
        if (!selectedType) {
            setError('Select a seat type first');
            return;
        }
        applySeatTypeToSeat(hallId, seat, selectedType);
    };

    const handleSaveTypes = async (hall: Hall) => {
        const hallSeats = hall.seats || [];
        const updates = hallSeats.filter(seat => {
            if (!seat.seatId) return false;
            const pendingType = pendingTypeChanges[seat.seatId];
            return pendingType && pendingType !== seat.seatTypeId;
        });

        const deletes = hallSeats.filter(seat => seat.seatId && pendingDeletes[seat.seatId]);

        if (updates.length === 0 && deletes.length === 0) {
            setError('No type changes to save');
            return;
        }

        try {
            setActionLoading(prev => ({ ...prev, [`save-types-${hall.id}`]: true }));

            const updatePromises = updates.map(seat => updateSeatInHall(hall.id, seat.seatId as string, {
                row: seat.row,
                number: seat.number,
                seatTypeId: pendingTypeChanges[seat.seatId as string]
            }));

            const deletePromises = deletes.map(seat => deleteSeatFromHall(seat.seatId as string));

            await Promise.all([...updatePromises, ...deletePromises]);

            setPendingTypeChanges(prev => {
                const next = { ...prev };
                updates.forEach(seat => { if (seat.seatId) delete next[seat.seatId]; });
                return next;
            });

            setPendingDeletes(prev => {
                const next = { ...prev };
                deletes.forEach(seat => { if (seat.seatId) delete next[seat.seatId]; });
                return next;
            });

            await loadHallDetails(hall.id);
        } catch (err) {
            console.error('Save types failed', err);
            setError('Failed to save seat type changes');
        } finally {
            setActionLoading(prev => ({ ...prev, [`save-types-${hall.id}`]: false }));
        }
    };

    const renderSeatTypeOptions = (types: SeatType[]) => (
        types.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
        ))
    );

    const seatTypeNameById = useMemo(() => {
        const map: Record<string, string> = {};
        halls.forEach(h => {
            h.availableSeatTypes?.forEach(t => {
                map[t.id] = t.name;
            });
        });
        return map;
    }, [halls]);

    const getSeatClassByName = (seatTypes: SeatType[], typeId: string) => {
        const type = seatTypes.find(t => t.id === typeId);
        if (!type) return 'standard';
        const name = type.name.toLowerCase();
        if (name.includes('vip')) return 'vip';
        if (name.includes('comfort')) return 'comfort';
        return 'standard';
    };

    const getRowStats = (seats: Seat[], rowNum: number) => {
        const rowSeats = seats.filter(s => s.row === rowNum);
        if (rowSeats.length === 0) return { minSeat: 0, maxSeat: 0, count: 0 };
        const numbers = rowSeats.map(s => s.number).sort((a, b) => a - b);
        return { minSeat: numbers[0], maxSeat: numbers[numbers.length - 1], count: rowSeats.length };
    };

    const isLastRow = (seats: Seat[], rowNum: number) => {
        const maxRow = Math.max(...seats.map(s => s.row));
        return rowNum === maxRow;
    };

    const canDeleteSeat = (seats: Seat[], seat: Seat) => {
        const rowStats = getRowStats(seats, seat.row);
        return seat.number === rowStats.minSeat || seat.number === rowStats.maxSeat;
    };

    const canDeleteRow = (seats: Seat[], rowNum: number) => {
        const allRows = Array.from(new Set(seats.map(s => s.row))).sort((a, b) => a - b);
        const minRow = allRows[0];
        const maxRow = allRows[allRows.length - 1];

        return rowNum === minRow || rowNum === maxRow;
    };

    const getMinRowNumber = (seats: Seat[]) => {
        if (seats.length === 0) return 1;
        return Math.min(...seats.map(s => s.row));
    };

    const canAddRowsAtStart = (seats: Seat[]) => {
        const minRow = getMinRowNumber(seats);
        return minRow > 1;
    };

    const canAddSeatToEdge = (seats: Seat[], rowNum: number, seatTypeId: string) => {
        const rowStats = getRowStats(seats, rowNum);
        return rowStats.count > 0 && seatTypeId;
    };

    const getNextSeatNumber = (seats: Seat[], rowNum: number, side: 'left' | 'right'): number => {
        const rowStats = getRowStats(seats, rowNum);
        if (side === 'left') return rowStats.minSeat - 1;
        return rowStats.maxSeat + 1;
    };

    const addSeatToRowEdge = async (hallId: string, rowNum: number, side: 'left' | 'right', seatTypeId: string) => {
        const hall = halls.find(h => h.id === hallId);
        if (!hall?.seats) return;
        const newSeatNum = getNextSeatNumber(hall.seats, rowNum, side);
        if (newSeatNum < 1) {
            setError('Cannot add more seats to the left');
            return;
        }
        try {
            setActionLoading(prev => ({ ...prev, [`add-edge-${hallId}-${rowNum}-${side}`]: true }));
            await addSeatsToHall({
                hallId,
                seatTypeId,
                seats: [{ row: rowNum, number: newSeatNum }]
            });
            await loadHallDetails(hallId);
        } catch (err) {
            console.error('Add seat to edge failed', err);
            setError('Failed to add seat');
        } finally {
            setActionLoading(prev => ({ ...prev, [`add-edge-${hallId}-${rowNum}-${side}`]: false }));
        }
    };

    const addNewRow = async (hallId: string, seatTypeId: string) => {
        const hall = halls.find(h => h.id === hallId);
        if (!hall?.seats || hall.seats.length === 0) return;
        const maxRow = Math.max(...hall.seats.map(s => s.row));
        const lastRowStats = getRowStats(hall.seats, maxRow);
        const newRowNum = maxRow + 1;
        try {
            setActionLoading(prev => ({ ...prev, [`add-row-${hallId}`]: true }));
            const seatsToAdd = Array.from({ length: lastRowStats.count }, (_, i) => ({
                row: newRowNum,
                number: i + lastRowStats.minSeat
            }));
            await addSeatsToHall({
                hallId,
                seatTypeId,
                seats: seatsToAdd
            });
            await loadHallDetails(hallId);
        } catch (err) {
            console.error('Add row failed', err);
            setError('Failed to add row');
        } finally {
            setActionLoading(prev => ({ ...prev, [`add-row-${hallId}`]: false }));
        }
    };

    const addRowsAtStart = async (hallId: string, seatTypeId: string) => {
        const hall = halls.find(h => h.id === hallId);
        if (!hall?.seats || !seatTypeId) return;
        
        const minRow = getMinRowNumber(hall.seats);
        if (minRow <= 1) return;

        const refRowSeats = hall.seats.filter(s => s.row === minRow);
        if (refRowSeats.length === 0) return;
        
        const refRowStats = getRowStats(hall.seats, minRow);
        
        try {
            setActionLoading(prev => ({ ...prev, [`add-rows-start-${hallId}`]: true }));
            

            const allNewSeats = [];
            for (let rowNum = minRow - 1; rowNum >= 1; rowNum--) {
                for (let seatNum = refRowStats.minSeat; seatNum <= refRowStats.maxSeat; seatNum++) {
                    allNewSeats.push({
                        row: rowNum,
                        number: seatNum
                    });
                }
            }
            

            await addSeatsToHall({
                hallId,
                seatTypeId,
                seats: allNewSeats
            });
            
            await loadHallDetails(hallId);
        } catch (err) {
            console.error('Add rows failed', err);
            setError('Failed to add rows at start');
        } finally {
            setActionLoading(prev => ({ ...prev, [`add-rows-start-${hallId}`]: false }));
        }
    };

    const deleteRowAndSeats = async (hallId: string, rowNum: number) => {
        const hall = halls.find(h => h.id === hallId);
        if (!hall?.seats) return;
        const rowSeats = hall.seats.filter(s => s.row === rowNum);
        try {
            setActionLoading(prev => ({ ...prev, [`delete-row-${hallId}-${rowNum}`]: true }));
            const deletePromises = rowSeats
                .filter(s => s.seatId)
                .map(s => deleteSeatFromHall(s.seatId as string));
            await Promise.all(deletePromises);
            await loadHallDetails(hallId);
            setPendingDeletes(prev => {
                const next = { ...prev };
                rowSeats.forEach(s => { if (s.seatId) delete next[s.seatId]; });
                return next;
            });
        } catch (err) {
            console.error('Delete row failed', err);
            setError('Failed to delete row');
        } finally {
            setActionLoading(prev => ({ ...prev, [`delete-row-${hallId}-${rowNum}`]: false }));
        }
    };

    return (
        <div className={styles["halls-page"]}>
            <div className={styles["halls-header"]}>
                <h2>Halls Management</h2>
                <div className={styles["header-actions"]}>
                    <button className={styles["refresh-btn"]} onClick={fetchHalls} disabled={loading}>
                        Refresh
                    </button>
                </div>
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
                        disabled={actionLoading.createHall}
                    >
                        Create
                    </button>
                </div>
            </div>

            <div className={styles["section-card"]}>
                <h3>All Halls</h3>
                {loading ? (
                    <div className={styles["loading"]}>Loading halls...</div>
                ) : (
                    <div className={styles["halls-list"]}>
                        {halls.map(hall => (
                            <HallListItem
                                key={hall.id}
                                hall={hall}
                                expandedHallId={expandedHallId}
                                onToggleExpand={handleToggleHall}
                                onDeleteHall={handleDeleteHall}
                                hallNameEdits={hallNameEdits}
                                onNameEditChange={(hallId, name) => setHallNameEdits(prev => ({ ...prev, [hallId]: name }))}
                                onUpdateHall={handleUpdateHall}
                                selectedSeatTypeByHall={selectedSeatTypeByHall}
                                onSelectSeatType={handleSelectSeatType}
                                deleteModeByHall={deleteModeByHall}
                                onToggleDeleteMode={handleToggleDeleteMode}
                                onSaveTypes={handleSaveTypes}
                                pendingTypeChanges={pendingTypeChanges}
                                pendingDeletes={pendingDeletes}
                                loadingHallDetails={loadingHallDetails}
                                actionLoading={actionLoading}
                                canDeleteSeat={canDeleteSeat}
                                getSeatClassByName={getSeatClassByName}
                                handleSeatGridClick={handleSeatGridClick}
                                addSeatToRowEdge={addSeatToRowEdge}
                                getRowStats={getRowStats}
                                addNewRow={addNewRow}
                                canAddRowsAtStart={canAddRowsAtStart}
                                addRowsAtStart={addRowsAtStart}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
