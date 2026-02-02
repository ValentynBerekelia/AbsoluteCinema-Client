import styles from '../../pages/Admin/Halls/HallsPage.module.css';

interface HallFormProps {
    newHallName: string;
    onNameChange: (name: string) => void;
    onCreateHall: () => void;
    isLoading: boolean;
}

export const HallForm = ({ newHallName, onNameChange, onCreateHall, isLoading }: HallFormProps) => {
    return (
        <div className={styles["form-row"]}>
            <input
                type="text"
                value={newHallName}
                onChange={e => onNameChange(e.target.value)}
                placeholder="Hall name"
                className={styles["text-input"]}
            />
            <button
                onClick={onCreateHall}
                disabled={isLoading}
                className={styles["primary-btn"]}
            >
                Create
            </button>
        </div>
    );
};

