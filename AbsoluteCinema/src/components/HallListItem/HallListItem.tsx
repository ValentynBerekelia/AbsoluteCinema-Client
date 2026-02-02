import styles from '../../pages/Admin/Halls/HallsPage.module.css';
import { Hall, Seat } from '@/types/hall';
import { HallSeatGrid } from '../HallSeatGrid/HallSeatGrid';

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
    onSaveTypes: (hall: Hall) => void;
    pendingTypeChanges: Record<string, string>;
    pendingDeletes: Record<string, boolean>;
    loadingHallDetails: Record<string, boolean>;
    actionLoading: Record<string, boolean>;
    canDeleteSeat: (seats: Seat[], seat: Seat) => boolean;
    getSeatClassByName: (types: any[], typeId: string) => string;
    handleSeatGridClick: (hallId: string, seat: Seat) => void;
    addSeatToRowEdge: (hallId: string, rowNum: number, side: 'left' | 'right', seatTypeId: string) => void;
    getRowStats: (seats: Seat[], rowNum: number) => any;
    addNewRow: (hallId: string, seatTypeId: string) => void;
    canAddRowsAtStart: (seats: Seat[]) => boolean;
    addRowsAtStart: (hallId: string, seatTypeId: string) => void;
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
    onSaveTypes,
    pendingTypeChanges,
    pendingDeletes,
    loadingHallDetails,
    actionLoading,
    canDeleteSeat,
    getSeatClassByName,
    handleSeatGridClick,
    addSeatToRowEdge,
    getRowStats,
    addNewRow,
    canAddRowsAtStart,
    addRowsAtStart
}: HallListItemProps) => {
    return (
        <div className={styles["hall-item"]}>
            <div className={styles["hall-summary"]}>
                <button
                    className={styles["expand-btn"]}
                    onClick={() => onToggleExpand(hall.id)}
                >
                    {expandedHallId === hall.id ? 'Hide' : 'View'}
                </button>
                <div className={styles["hall-info"]}>
                    <div className={styles["hall-title"]}>{hall.name}</div>
                    <div className={styles["hall-subtitle"]}>ID: {hall.id}</div>
                </div>
                <div className={styles["hall-actions"]}>
                    <button
                        className={styles["danger-btn"]}
                        onClick={() => onDeleteHall(hall.id)}
                        disabled={actionLoading[`delete-${hall.id}`]}
                    >
                        Delete
                    </button>
                </div>
            </div>

            {expandedHallId === hall.id && (
                <div className={styles["hall-details"]}>
                    {loadingHallDetails[hall.id] ? (
                        <div className={styles["loading"]}>Loading hall details...</div>
                    ) : (
                        <>
                            <div className={styles["detail-grid"]}>
                                <div className={styles["detail-card"]}>
                                    <h4>Edit Hall Name</h4>
                                    <div className={styles["form-row"]}>
                                        <input
                                            type="text"
                                            value={hallNameEdits[hall.id] ?? hall.name}
                                            onChange={e => onNameEditChange(hall.id, e.target.value)}
                                            className={styles["text-input"]}
                                        />
                                        <button
                                            className={styles["primary-btn"]}
                                            onClick={() => onUpdateHall(hall.id)}
                                            disabled={actionLoading[`update-${hall.id}`]}
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>

                                <div className={styles["detail-card"]}>
                                    <h4>Seat Types</h4>
                                    <div className={styles["seat-types"]}>
                                        {(hall.availableSeatTypes || []).length === 0 ? (
                                            <div className={styles["muted"]}>No seat types available.</div>
                                        ) : (
                                            (hall.availableSeatTypes || []).map(type => (
                                                <button
                                                    key={type.id}
                                                    className={`${styles["seat-type-chip"]} ${selectedSeatTypeByHall[hall.id] === type.id ? styles["seat-type-chip-active"] : ''}`}
                                                    onClick={() => onSelectSeatType(hall.id, type.id)}
                                                >
                                                    {type.name}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                    <div className={styles["seat-type-actions"]}>
                                        <button
                                            className={`${styles["danger-btn"]} ${deleteModeByHall[hall.id] ? styles["danger-btn-active"] : ''}`}
                                            onClick={() => onToggleDeleteMode(hall.id)}
                                        >
                                            Delete
                                        </button>
                                        <button
                                            className={styles["primary-btn"]}
                                            onClick={() => onSaveTypes(hall)}
                                            disabled={actionLoading[`save-types-${hall.id}`]}
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>

                                <div className={`${styles["detail-card"]} ${styles["detail-card-fullwidth"]}`}>
                                    <h4>Hall Layout</h4>
                                    
                                    {(hall.seats || []).length > 0 && canAddRowsAtStart(hall.seats || []) && (
                                        <button
                                            className={styles["row-add-btn"]}
                                            onClick={() => addRowsAtStart(hall.id, selectedSeatTypeByHall[hall.id] || '')}
                                            disabled={!selectedSeatTypeByHall[hall.id] || actionLoading[`add-rows-start-${hall.id}`]}
                                            style={{ width: (Math.max(1, ...(hall.seats || []).map(s => s.number)) + 1) * 32 + 'px', marginBottom: '12px' }}
                                            title="Add rows at the beginning"
                                        >
                                            + Add Rows at Start
                                        </button>
                                    )}
                                    
                                    <HallSeatGrid
                                        hall={hall}
                                        pendingTypeChanges={pendingTypeChanges}
                                        pendingDeletes={pendingDeletes}
                                        deleteModeByHall={deleteModeByHall}
                                        selectedSeatTypeByHall={selectedSeatTypeByHall}
                                        canDeleteSeat={canDeleteSeat}
                                        getSeatClassByName={getSeatClassByName}
                                        handleSeatGridClick={handleSeatGridClick}
                                        addSeatToRowEdge={addSeatToRowEdge}
                                        getRowStats={getRowStats}
                                        actionLoading={actionLoading}
                                    />

                                    {(hall.seats || []).length > 0 && (
                                        <button
                                            className={styles["row-add-btn"]}
                                            onClick={() => addNewRow(hall.id, selectedSeatTypeByHall[hall.id] || '')}
                                            disabled={!selectedSeatTypeByHall[hall.id] || actionLoading[`add-row-${hall.id}`]}
                                            style={{ width: (Math.max(1, ...(hall.seats || []).map(s => s.number)) + 1) * 32 + 'px', marginTop: '12px' }}
                                            title="Add a new row at the end"
                                        >
                                            + Add Row
                                        </button>
                                    )}

                                    <div className={styles["muted"]}>
                                        Select a type, then click seats to change. Use Delete to mark seats for removal.
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
