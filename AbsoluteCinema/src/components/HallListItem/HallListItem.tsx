import styles from './HallListItem.module.css';
import { Hall, Seat, SeatType } from '@/types/hall';
import { HallSeatGrid } from '../HallSeatGrid/HallSeatGrid';
import { getSeatClassByName } from '@/utils/getSeatClassByName';
import { getDynamicSeatColor } from '@/utils/colorGenerator';

interface HallListItemProps {
    hall: Hall;
    expandedHallId: string | null;
    onToggleExpand: (hallId: string) => void;
    onDeleteHall: (hallId: string) => void;
    hallNameEdits: Record<string, string>;
    onNameEditChange: (hallId: string, name: string) => void;
    onUpdateHall: (hallId: string) => void;
    selectedSeatTypeByHall: Record<string, string>;
    onSelectSeatType: (hallId: string, typeId: string) => void;
    deleteModeByHall: Record<string, boolean>;
    onToggleDeleteMode: (hallId: string) => void;
    loadingHallDetails: Record<string, boolean>;
    actionLoading: Record<string, boolean>;
    handleSeatGridClick: (hallId: string, seat: Seat) => void;
    addSeatToRowEdge: (hallId: string, rowNum: number, side: 'left' | 'right', seatTypeId: string) => void;
    getRowStats: (seats: Seat[], rowNum: number) => any;
    addNewRow: (hallId: string, seatTypeId: string) => void;
}

export const HallListItem = ({
    hall,
    expandedHallId,
    onToggleExpand,
    onDeleteHall,
    hallNameEdits,
    onNameEditChange,
    onUpdateHall,
    selectedSeatTypeByHall,
    onSelectSeatType,
    deleteModeByHall,
    onToggleDeleteMode,
    loadingHallDetails,
    actionLoading,
    handleSeatGridClick,
    addSeatToRowEdge,
    getRowStats,
    addNewRow
}: HallListItemProps) => {

    const isTypeSelected = !!selectedSeatTypeByHall[hall.id]

    return (
        <div className={styles["hall-item"]}>
            <div className={styles["hall-summary"]}>
                <button className={styles["expand-btn"]} onClick={() => onToggleExpand(hall.id)}>
                    {expandedHallId === hall.id ? 'Hide' : 'View'}
                </button>
                <div className={styles["hall-info"]}>
                    <div className={styles["hall-title"]}>{hall.name}</div>
                    <div className={styles["hall-subtitle"]}>ID: {hall.id}</div>
                </div>
                <button className={styles["danger-btn"]} onClick={() => onDeleteHall(hall.id)} disabled={actionLoading[`delete-${hall.id}`]}>
                    Delete
                </button>
            </div>

            {expandedHallId === hall.id && (
                <div className={styles["hall-details"]}>
                    {loadingHallDetails[hall.id] ? (
                        <div className={styles["loading"]}>Loading...</div>
                    ) : (
                        <div className={styles["detail-grid"]}>
                            <div className={styles["detail-card"]}>
                                <h4>Edit Name</h4>
                                <div className={styles["form-row"]}>
                                    <input
                                        type="text"
                                        value={hallNameEdits[hall.id] ?? hall.name}
                                        onChange={e => onNameEditChange(hall.id, e.target.value)}
                                        className={styles["text-input"]}
                                    />
                                    <button className={styles["primary-btn"]} onClick={() => onUpdateHall(hall.id)}>Save</button>
                                </div>
                            </div>

                            <div className={styles["detail-card"]}>
                                <h4>Design Mode</h4>
                                <div className={styles["seat-types"]}>
                                    {(hall.availableSeatTypes || []).map(type => {
                                        const typeId = type.id;
                                        const isSelected = selectedSeatTypeByHall[hall.id] === typeId;
                                        const baseColor = getDynamicSeatColor(type.name);

                                        return (
                                            <button
                                                key={type.id}
                                                onClick={() => onSelectSeatType(hall.id, type.id)}
                                                className={`
                                                    ${styles["seat-type-chip"]} 
                                                    ${isSelected ? styles["seat-type-chip-active"] : ''}
                                                `}
                                                style={{
                                                    backgroundColor: baseColor,
                                                    opacity: isSelected ? 1 : 0.4
                                                } as React.CSSProperties}
                                                type="button"
                                            >
                                                {type.name}
                                            </button>
                                        );;
                                    })}
                                </div>
                                <button className={`${styles["danger-btn"]} ${deleteModeByHall[hall.id] ? styles["danger-btn-active"] : ''}`} onClick={() => onToggleDeleteMode(hall.id)}>
                                    Eraser
                                </button>
                            </div>

                            <div className={`${styles["detail-card"]} ${styles["detail-card-fullwidth"]}`}>
                                <h4>Layout</h4>
                                <HallSeatGrid
                                    hall={hall}
                                    deleteModeByHall={deleteModeByHall}
                                    selectedSeatTypeByHall={selectedSeatTypeByHall}
                                    handleSeatGridClick={handleSeatGridClick}
                                    addSeatToRowEdge={addSeatToRowEdge}
                                    actionLoading={actionLoading}
                                />
                                <button 
                                    className={styles["row-add-btn"]}
                                    disabled={!isTypeSelected}
                                    onClick={() => addNewRow(hall.id, selectedSeatTypeByHall[hall.id])}
                                >
                                    + Add Row
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};