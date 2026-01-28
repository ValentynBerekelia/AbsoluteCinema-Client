import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditHallPage.css';

interface Seat {
    number: number;
    type: 'normal' | 'vip' | 'disabled' | 'broken';
    price: number;
}

interface Hall {
    id: number;
    name: string;
    capacity: number;
    type: string;
    rows: number;
    seatsPerRow: number;
    seats: Seat[];
}

interface HallFormData {
    name: string;
    capacity: number;
    type: string;
    rows: number;
    seatsPerRow: number;
}

export const EditHallPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedSeatType, setSelectedSeatType] = useState<'normal' | 'vip' | 'disabled' | 'broken'>('normal');
    const [editMode, setEditMode] = useState(false);

    const [formData, setFormData] = useState<HallFormData>({
        name: '',
        capacity: 0,
        type: '',
        rows: 10,
        seatsPerRow: 15
    });

    const [seats, setSeats] = useState<Seat[]>([]);

    const mockHalls: Hall[] = [
        { 
            id: 1, 
            name: "Grand Hall", 
            capacity: 200, 
            type: "Premium",
            rows: 10,
            seatsPerRow: 20,
            seats: Array.from({ length: 200 }, (_, i) => ({
                number: i + 1,
                type: Math.random() > 0.8 ? 'vip' : 'normal',
                price: Math.random() > 0.8 ? 150 : 100
            }))
        },
        { 
            id: 2, 
            name: "Blue Room", 
            capacity: 150, 
            type: "Standard",
            rows: 10,
            seatsPerRow: 15,
            seats: Array.from({ length: 150 }, (_, i) => ({
                number: i + 1,
                type: 'normal',
                price: 100
            }))
        },
        { 
            id: 3, 
            name: "IMAX Premium", 
            capacity: 300, 
            type: "IMAX",
            rows: 15,
            seatsPerRow: 20,
            seats: Array.from({ length: 300 }, (_, i) => ({
                number: i + 1,
                type: Math.random() > 0.7 ? 'vip' : 'normal',
                price: Math.random() > 0.7 ? 200 : 150
            }))
        },
        { 
            id: 4, 
            name: "Hall 3", 
            capacity: 100, 
            type: "Standard",
            rows: 10,
            seatsPerRow: 10,
            seats: Array.from({ length: 100 }, (_, i) => ({
                number: i + 1,
                type: 'normal',
                price: 100
            }))
        },
        { 
            id: 5, 
            name: "Retro Cinema", 
            capacity: 80, 
            type: "Classic",
            rows: 8,
            seatsPerRow: 10,
            seats: Array.from({ length: 80 }, (_, i) => ({
                number: i + 1,
                type: 'normal',
                price: 100
            }))
        }
    ];

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            const hall = mockHalls.find(h => h.id === parseInt(id || '0'));
            if (hall) {
                setFormData({
                    name: hall.name,
                    capacity: hall.capacity,
                    type: hall.type,
                    rows: hall.rows,
                    seatsPerRow: hall.seatsPerRow
                });
                setSeats(hall.seats);
            } else {
                // Якщо зал не знайдено, створюємо сідла за замовчуванням
                const defaultSeats = Array.from({ length: 100 }, (_, i) => ({
                    number: i + 1,
                    type: 'normal' as const,
                    price: 100
                }));
                setSeats(defaultSeats);
            }
            setLoading(false);
        }, 500);
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'capacity' || name === 'rows' || name === 'seatsPerRow') ? parseInt(value) || 0 : value
        }));
    };

    const handleSeatClick = (seatNumber: number) => {
        if (!editMode) return;
        setSeats(prev => prev.map(seat => 
            seat.number === seatNumber 
                ? { ...seat, type: selectedSeatType }
                : seat
        ));
    };

    const handleSeatPriceChange = (seatNumber: number, price: number) => {
        setSeats(prev => prev.map(seat => 
            seat.number === seatNumber 
                ? { ...seat, price }
                : seat
        ));
    };

    const getTypeCounts = () => {
        return {
            normal: seats.filter(s => s.type === 'normal').length,
            vip: seats.filter(s => s.type === 'vip').length,
            disabled: seats.filter(s => s.type === 'disabled').length,
            broken: seats.filter(s => s.type === 'broken').length
        };
    };

    const autoFillSeats = (type: 'normal' | 'vip' | 'disabled' | 'broken') => {
        setSeats(prev => prev.map(seat => ({
            ...seat,
            type
        })));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setTimeout(() => {
            console.log('Mock save hall:', { ...formData, seats });
            setSaving(false);
            navigate('/admin/halls');
        }, 500);
    };

    if (loading) {
        return (
            <div className="edit-hall-page">
                <div className="loading-state">Loading hall...</div>
            </div>
        );
    }

    // Ініціалізуємо seats якщо вони пусті
    if (seats.length === 0) {
        const defaultSeats = Array.from({ length: formData.capacity }, (_, i) => ({
            number: i + 1,
            type: 'normal' as const,
            price: 100
        }));
        setSeats(defaultSeats);
    }

    const typeCounts = getTypeCounts();

    return (
        <div className="edit-hall-page">
            <div className="page-header">
                <h2>Edit Hall - {formData.name}</h2>
                <button onClick={() => navigate('/admin/halls')} className="back-btn">
                    Back to Halls
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="edit-hall-container">
                {/* Основна інформація */}
                <form onSubmit={handleSubmit} className="hall-form">
                    <div className="form-section">
                        <h3>Hall Information</h3>
                        <div className="form-group">
                            <label htmlFor="name">Hall Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="form-input"
                                required
                                placeholder="Enter hall name"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="type">Type *</label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                >
                                    <option value="">Select type</option>
                                    <option value="Standard">Standard</option>
                                    <option value="Premium">Premium</option>
                                    <option value="IMAX">IMAX</option>
                                    <option value="Classic">Classic</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="capacity">Total Capacity *</label>
                                <input
                                    type="number"
                                    id="capacity"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                    min="1"
                                    max="500"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="rows">Rows *</label>
                                <input
                                    type="number"
                                    id="rows"
                                    name="rows"
                                    value={formData.rows}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                    min="1"
                                    max="30"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="seatsPerRow">Seats Per Row *</label>
                                <input
                                    type="number"
                                    id="seatsPerRow"
                                    name="seatsPerRow"
                                    value={formData.seatsPerRow}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                    min="1"
                                    max="30"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Редактор сидінь */}
                    <div className="form-section">
                        <div className="seats-editor-header">
                            <h3>Seat Configuration</h3>
                            <button
                                type="button"
                                onClick={() => setEditMode(!editMode)}
                                className={`edit-mode-btn ${editMode ? 'active' : ''}`}
                            >
                                {editMode ? '✓ Edit Mode ON' : 'Edit Seats'}
                            </button>
                        </div>

                        {/* Статистика типів сидінь */}
                        <div className="seats-stats">
                            <div className="stat-item normal">
                                <span className="stat-label">Normal</span>
                                <span className="stat-count">{typeCounts.normal}</span>
                            </div>
                            <div className="stat-item vip">
                                <span className="stat-label">VIP</span>
                                <span className="stat-count">{typeCounts.vip}</span>
                            </div>
                            <div className="stat-item disabled">
                                <span className="stat-label">Disabled</span>
                                <span className="stat-count">{typeCounts.disabled}</span>
                            </div>
                            <div className="stat-item broken">
                                <span className="stat-label">Broken</span>
                                <span className="stat-count">{typeCounts.broken}</span>
                            </div>
                        </div>

                        {editMode && (
                            <div className="seat-type-selector">
                                <label>Select Seat Type:</label>
                                <div className="type-buttons">
                                    <button
                                        type="button"
                                        className={`type-btn normal ${selectedSeatType === 'normal' ? 'active' : ''}`}
                                        onClick={() => setSelectedSeatType('normal')}
                                    >
                                        Normal ($100)
                                    </button>
                                    <button
                                        type="button"
                                        className={`type-btn vip ${selectedSeatType === 'vip' ? 'active' : ''}`}
                                        onClick={() => setSelectedSeatType('vip')}
                                    >
                                        VIP ($150)
                                    </button>
                                    <button
                                        type="button"
                                        className={`type-btn disabled ${selectedSeatType === 'disabled' ? 'active' : ''}`}
                                        onClick={() => setSelectedSeatType('disabled')}
                                    >
                                        Disabled
                                    </button>
                                    <button
                                        type="button"
                                        className={`type-btn broken ${selectedSeatType === 'broken' ? 'active' : ''}`}
                                        onClick={() => setSelectedSeatType('broken')}
                                    >
                                        Broken
                                    </button>
                                </div>
                                <div className="auto-fill-buttons">
                                    <button
                                        type="button"
                                        onClick={() => autoFillSeats('normal')}
                                        className="auto-fill-btn"
                                    >
                                        Fill All with {selectedSeatType}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Сітка сидінь */}
                        <div className="seats-grid-editor">
                            {Array.from({ length: formData.rows }).map((_, rowIndex) => (
                                <div key={rowIndex} className="seats-row">
                                    <span className="row-label">{String.fromCharCode(65 + rowIndex)}</span>
                                    <div className="seats-in-row">
                                        {Array.from({ length: formData.seatsPerRow }).map((_, colIndex) => {
                                            const seatNumber = rowIndex * formData.seatsPerRow + colIndex + 1;
                                            const seat = seats.find(s => s.number === seatNumber);
                                            return (
                                                <button
                                                    key={seatNumber}
                                                    type="button"
                                                    className={`seat-btn ${seat?.type || 'normal'} ${editMode ? 'editable' : ''}`}
                                                    onClick={() => handleSeatClick(seatNumber)}
                                                    title={`Seat ${seatNumber} - ${seat?.type || 'normal'}`}
                                                >
                                                    {seatNumber}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="screen-label">SCREEN</div>
                    </div>

                    {/* Кнопки дій */}
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Hall Configuration'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/halls')}
                            className="cancel-btn"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
