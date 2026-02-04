import { getSeatClassByName } from '@/utils/getSeatClassByName';
import styles from './HallSeatGrid.module.css';
import { Hall, Seat } from '@/types/hall';
import { getDynamicSeatColor } from '@/utils/colorGenerator';

interface HallSeatGridProps {
    hall: Hall;
    deleteModeByHall: Record<string, boolean>;
    selectedSeatTypeByHall: Record<string, string>;
    handleSeatGridClick: (hallId: string, seat: Seat) => void;
    addSeatToRowEdge: (hallId: string, rowNum: number, side: 'left' | 'right', seatTypeId: string) => void;
    actionLoading: Record<string, boolean>;
}

export const HallSeatGrid = ({
    hall,
    deleteModeByHall,
    selectedSeatTypeByHall,
    handleSeatGridClick,
    addSeatToRowEdge,
    actionLoading,
}: HallSeatGridProps) => {
    const rowNumbers = Array.from(new Set((hall.seats || []).map(s => s.row))).sort((a, b) => a - b);

    return (
        <div className={styles["hall-layout-wrapper"]}>
            <div className={styles["screen-line"]}>SCREEN</div>

            <div className={styles["rows-container"]}>
                {rowNumbers.map(rowNum => {
                    const rowSeats = (hall.seats || []).filter(s => s.row === rowNum).sort((a, b) => a.number - b.number);

                    const seatNumbers = rowSeats.map(s => s.number);
                    const maxRowSeat = Math.max(...seatNumbers);

                    return (
                        <div key={`row-${rowNum}`} className={styles["hall-row"]}>
                            <span className={styles["row-number-label"]}>{rowNum}</span>

                            <div className={styles["seats-in-row"]}>
                                {rowSeats.map(seat => {
                                    const maxRowInHall = Math.max(...(hall.seats || []).map(s => s.row));
                                    const typeObj = hall.availableSeatTypes?.find(t => t.id === seat.seatTypeId);
                                    const seatColor = getDynamicSeatColor(typeObj?.name || 'standard');

                                    const isLastInRow = seat.number === maxRowSeat;
                                    const isRemovableRow = !(rowSeats.length === 1 && seat.row !== maxRowInHall);

                                    const isRemovable = deleteModeByHall[hall.id] && isLastInRow && isRemovableRow;

                                    return (
                                        <button
                                            key={seat.seatId || `seat-${seat.row}-${seat.number}`}
                                            className={`${styles["seat-cell"]} ${isRemovable ? styles["removable-edge"] : ''}`}
                                            style={{
                                                backgroundColor: seatColor,
                                                gridRow: seat.row
                                            }}
                                            onClick={() => handleSeatGridClick(hall.id, seat)}
                                            type="button"
                                            title={`Row: ${seat.row}, Seat: ${seat.number}${isRemovable ? ' (Can be deleted)' : ''}`}
                                        />
                                    );
                                })}

                                <button
                                    className={styles["seat-add-btn-mini"]}
                                    onClick={() => addSeatToRowEdge(hall.id, rowNum, 'right', selectedSeatTypeByHall[hall.id] || '6ea339c5-b6c8-4646-ab54-7d5f71644a87')}
                                    disabled={!selectedSeatTypeByHall[hall.id] || actionLoading[`add-edge-${hall.id}-${rowNum}-right`]}
                                    title="Add seat to row"
                                    type="button"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};