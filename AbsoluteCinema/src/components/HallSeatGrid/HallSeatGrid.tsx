import styles from '../../pages/Admin/Halls/HallsPage.module.css';
import { Hall, Seat } from '@/types/hall';

interface HallSeatGridProps {
    hall: Hall;
    pendingTypeChanges: Record<string, string>;
    pendingDeletes: Record<string, boolean>;
    deleteModeByHall: Record<string, boolean>;
    selectedSeatTypeByHall: Record<string, string>;
    canDeleteSeat: (seats: Seat[], seat: Seat) => boolean;
    getSeatClassByName: (types: any[], typeId: string) => string;
    handleSeatGridClick: (hallId: string, seat: Seat) => void;
    addSeatToRowEdge: (hallId: string, rowNum: number, side: 'left' | 'right', seatTypeId: string) => void;
    getRowStats: (seats: Seat[], rowNum: number) => any;
    actionLoading: Record<string, boolean>;
}

export const HallSeatGrid = ({
    hall,
    pendingTypeChanges,
    pendingDeletes,
    deleteModeByHall,
    selectedSeatTypeByHall,
    canDeleteSeat,
    getSeatClassByName,
    handleSeatGridClick,
    addSeatToRowEdge,
    getRowStats,
    actionLoading
}: HallSeatGridProps) => {
    const maxSeatNum = Math.max(1, ...(hall.seats || []).map(s => s.number));
    
    return (
        <div
            className={styles["seat-grid"]}
            style={{
                gridTemplateColumns: `repeat(${maxSeatNum + 1}, 28px)`
            }}
        >
            {(hall.seats || []).map(seat => {
                const seatId = seat.seatId;
                const effectiveTypeId = seatId ? (pendingTypeChanges[seatId] || seat.seatTypeId) : seat.seatTypeId;
                const isDeleted = seatId ? !!pendingDeletes[seatId] : false;
                const canDelete = canDeleteSeat(hall.seats || [], seat);
                
                const rowSeats = (hall.seats || []).filter(s => s.row === seat.row);
                const rowSeatNumbers = rowSeats.map(s => s.number).sort((a, b) => a - b);
                const rowMinSeat = Math.min(...rowSeatNumbers);
                const rowMaxSeat = Math.max(...rowSeatNumbers);
                const rowWidth = rowMaxSeat - rowMinSeat + 1;
                const offset = Math.floor((maxSeatNum - rowWidth) / 2);
                const centeredColumn = offset + (seat.number - rowMinSeat) + 1;
                
                return (
                    <button
                        key={`${seatId ?? 'seat'}-${seat.row}-${seat.number}`}
                        className={`${styles["seat-cell"]} ${styles[`seat-${getSeatClassByName(hall.availableSeatTypes || [], effectiveTypeId)}`]} ${isDeleted ? styles["seat-deleted"] : ''} ${canDelete ? styles["seat-edge"] : ''}`}
                        style={{ gridColumn: centeredColumn, gridRow: seat.row }}
                        title={`Row: ${seat.row}, Seat: ${seat.number}${canDelete ? ' (edge)' : ''}`}
                        onClick={() => handleSeatGridClick(hall.id, seat)}
                    />
                );
            })}
            {(hall.seats || []).length > 0 && Array.from(new Set((hall.seats || []).map(s => s.row))).sort((a, b) => a - b).map(rowNum => {
                const rowStats = getRowStats(hall.seats || [], rowNum);
                const rowWidth = rowStats.maxSeat - rowStats.minSeat + 1;
                const offset = Math.floor((maxSeatNum - rowWidth) / 2);
                const centeredAddColumn = offset + rowWidth + 1;
                
                return (
                    <button
                        key={`add-seat-${rowNum}`}
                        className={styles["seat-add-btn"]}
                        style={{ gridColumn: centeredAddColumn, gridRow: rowNum }}
                        onClick={() => addSeatToRowEdge(hall.id, rowNum, 'right', selectedSeatTypeByHall[hall.id] || '')}
                        disabled={!selectedSeatTypeByHall[hall.id] || actionLoading[`add-edge-${hall.id}-${rowNum}-right`]}
                        title="Add seat to the end of this row"
                    />
                );
            })}
        </div>
    );
};
