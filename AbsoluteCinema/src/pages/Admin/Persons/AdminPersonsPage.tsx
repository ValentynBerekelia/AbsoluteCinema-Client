import { useState } from 'react';
import styles from './AdminPersonsPage.module.css';
import { useToast } from '@/context/ToastContext/ToastContext';
import { v4 as uuidv4 } from 'uuid';

interface Person {
    id: string;
    name: string;
    bio: string;
    birthDate: string;
    role: number; // 1 = Director, 2 = Actor
    media?: string; // Image URL or base64
}

const ROLES = {
    1: 'Director',
    2: 'Actor'
};

// Mock data for persons
const MOCK_PERSONS: Person[] = [
    {
        id: uuidv4(),
        name: 'Steven Spielberg',
        bio: 'American film director, screenwriter, and producer.',
        birthDate: '1946-12-18',
        role: 1,
        media: 'https://via.placeholder.com/200/667eea/ffffff?text=Spielberg'
    },
    {
        id: uuidv4(),
        name: 'Christopher Nolan',
        bio: 'British-American film and television director.',
        birthDate: '1970-07-30',
        role: 1,
        media: 'https://via.placeholder.com/200/667eea/ffffff?text=Nolan'
    },
    {
        id: uuidv4(),
        name: 'Tom Hanks',
        bio: 'American actor and filmmaker.',
        birthDate: '1956-07-09',
        role: 2,
        media: 'https://via.placeholder.com/200/667eea/ffffff?text=Hanks'
    },
    {
        id: uuidv4(),
        name: 'Emma Watson',
        bio: 'British-French actress and activist.',
        birthDate: '1990-04-15',
        role: 2,
        media: 'https://via.placeholder.com/200/667eea/ffffff?text=Watson'
    },
    {
        id: uuidv4(),
        name: 'Martin Scorsese',
        bio: 'Italian-American film director and producer.',
        birthDate: '1942-11-17',
        role: 1,
        media: 'https://via.placeholder.com/200/667eea/ffffff?text=Scorsese'
    }
];

export const AdminPersonsPage = () => {
    const { showToast } = useToast();
    const [persons, setPersons] = useState<Person[]>(MOCK_PERSONS);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingData, setEditingData] = useState<Partial<Person>>({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);
    const [newPerson, setNewPerson] = useState<Partial<Person>>({
        name: '',
        bio: '',
        birthDate: '',
        role: 2
    });
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

    // Handle image file selection and conversion to base64
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, personId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('error', 'Please select a valid image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('error', 'Image size must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const imageData = event.target?.result as string;
            setPersons(prev => prev.map(p =>
                p.id === personId ? { ...p, media: imageData } : p
            ));
            showToast('success', 'Image uploaded successfully');
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = (personId: string) => {
        setPersons(prev => prev.map(p =>
            p.id === personId ? { ...p, media: undefined } : p
        ));
        showToast('success', 'Image removed');
    };

    const handleEditPerson = (person: Person) => {
        setEditingId(person.id);
        setEditingData({ ...person });
    };

    const handleSaveEdit = (id: string) => {
        if (!editingData.name?.trim()) {
            showToast('error', 'Name is required');
            return;
        }
        if (!editingData.birthDate) {
            showToast('error', 'Birth date is required');
            return;
        }

        try {
            setActionLoading(prev => ({ ...prev, [`edit-${id}`]: true }));
            setPersons(prev => prev.map(p =>
                p.id === id ? { ...p, ...editingData } : p
            ));
            setEditingId(null);
            setEditingData({});
            showToast('success', 'Person updated successfully');
        } finally {
            setActionLoading(prev => ({ ...prev, [`edit-${id}`]: false }));
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingData({});
    };

    const handleDeletePerson = (id: string, name: string) => {
        if (!window.confirm(`Delete "${name}"?`)) return;

        try {
            setActionLoading(prev => ({ ...prev, [`delete-${id}`]: true }));
            setPersons(prev => prev.filter(p => p.id !== id));
            showToast('success', 'Person deleted successfully');
        } finally {
            setActionLoading(prev => ({ ...prev, [`delete-${id}`]: false }));
        }
    };

    const handleAddPerson = () => {
        if (!newPerson.name?.trim()) {
            showToast('error', 'Name is required');
            return;
        }
        if (!newPerson.birthDate) {
            showToast('error', 'Birth date is required');
            return;
        }

        try {
            setActionLoading(prev => ({ ...prev, create: true }));
            const person: Person = {
                id: uuidv4(),
                name: newPerson.name.trim(),
                bio: newPerson.bio?.trim() || '',
                birthDate: newPerson.birthDate,
                role: newPerson.role || 2
            };
            setPersons(prev => [...prev, person]);
            setNewPerson({ name: '', bio: '', birthDate: '', role: 2 });
            setShowAddForm(false);
            showToast('success', 'Person added successfully');
        } finally {
            setActionLoading(prev => ({ ...prev, create: false }));
        }
    };

    const getRoleClass = (role: number) => {
        return role === 1 ? styles.roleDirector : styles.roleActor;
    };

    return (
        <div className={styles.container}>
            <h2>Manage Persons</h2>

            <div className={styles.actionBar}>
                {!showAddForm ? (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className={styles.button}
                    >
                        + Add New Person
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            setShowAddForm(false);
                            setNewPerson({ name: '', bio: '', birthDate: '', role: 2 });
                        }}
                        className={styles.cancelBtn}
                    >
                        Cancel
                    </button>
                )}
            </div>

            {showAddForm && (
                <div className={styles.formSection}>
                    <h3>Add New Person</h3>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Full Name *</label>
                            <input
                                type="text"
                                value={newPerson.name || ''}
                                onChange={(e) => setNewPerson(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter full name"
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Role *</label>
                            <select
                                value={newPerson.role || 2}
                                onChange={(e) => setNewPerson(prev => ({ ...prev, role: parseInt(e.target.value) }))}
                                className={styles.input}
                            >
                                <option value={1}>Director</option>
                                <option value={2}>Actor</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Birth Date *</label>
                            <input
                                type="date"
                                value={newPerson.birthDate || ''}
                                onChange={(e) => setNewPerson(prev => ({ ...prev, birthDate: e.target.value }))}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroupFull}>
                            <label>Bio</label>
                            <textarea
                                value={newPerson.bio || ''}
                                onChange={(e) => setNewPerson(prev => ({ ...prev, bio: e.target.value }))}
                                placeholder="Enter biography"
                                className={styles.textarea}
                                rows={4}
                            />
                        </div>

                        <div className={styles.formGroupFull}>
                            <label>Profile Image</label>
                            <div className={styles.imageUploadArea}>
                                {newPerson.media ? (
                                    <div className={styles.uploadedImagePreview}>
                                        <img src={newPerson.media} alt="Preview" />
                                        <button
                                            type="button"
                                            onClick={() => setNewPerson(prev => ({ ...prev, media: undefined }))}
                                            className={styles.removeImageBtn}
                                        >
                                            ✕ Remove
                                        </button>
                                    </div>
                                ) : (
                                    <label className={styles.uploadLabel}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onload = (event) => {
                                                        setNewPerson(prev => ({
                                                            ...prev,
                                                            media: event.target?.result as string
                                                        }));
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            style={{ display: 'none' }}
                                        />
                                        <span>📸 Click to upload image or drag and drop</span>
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className={styles.formActions}>
                            <button
                                onClick={handleAddPerson}
                                disabled={actionLoading.create}
                                className={styles.button}
                            >
                                {actionLoading.create ? 'Adding...' : 'Add Person'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setNewPerson({ name: '', bio: '', birthDate: '', role: 2 });
                                }}
                                className={styles.cancelBtn}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.listSection}>
                <h3>Existing Persons ({persons.length})</h3>
                
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name or bio..."
                        className={styles.searchInput}
                    />
                </div>

                {(() => {
                    const filteredPersons = persons.filter(p =>
                        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.bio.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    
                    if (filteredPersons.length === 0) {
                        return (
                            <div className={styles.empty}>
                                {persons.length === 0 ? 'No persons found' : 'No persons match your search'}
                            </div>
                        );
                    }
                    
                    return (
                        <div className={styles.personsGrid}>
                            {filteredPersons.map(person => (
                            <div key={person.id} className={styles.personCard}>
                                {editingId === person.id ? (
                                    <div className={styles.editForm}>
                                        <div className={styles.imageEditSection}>
                                            {editingData.media ? (
                                                <div className={styles.editImagePreview}>
                                                    <img src={editingData.media} alt="Preview" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingData(prev => ({ ...prev, media: undefined }))}
                                                        className={styles.removeImageBtn}
                                                    >
                                                        ✕ Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className={styles.uploadLabel}>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleImageUpload(e, person.id)}
                                                        style={{ display: 'none' }}
                                                    />
                                                    <span>📸 Click to upload image</span>
                                                </label>
                                            )}
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label>Full Name</label>
                                            <input
                                                type="text"
                                                value={editingData.name || ''}
                                                onChange={(e) => setEditingData(prev => ({ ...prev, name: e.target.value }))}
                                                className={styles.input}
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label>Role</label>
                                            <select
                                                value={editingData.role || 2}
                                                onChange={(e) => setEditingData(prev => ({ ...prev, role: parseInt(e.target.value) }))}
                                                className={styles.input}
                                            >
                                                <option value={1}>Director</option>
                                                <option value={2}>Actor</option>
                                            </select>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label>Birth Date</label>
                                            <input
                                                type="date"
                                                value={editingData.birthDate || ''}
                                                onChange={(e) => setEditingData(prev => ({ ...prev, birthDate: e.target.value }))}
                                                className={styles.input}
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label>Bio</label>
                                            <textarea
                                                value={editingData.bio || ''}
                                                onChange={(e) => setEditingData(prev => ({ ...prev, bio: e.target.value }))}
                                                className={styles.textarea}
                                                rows={3}
                                            />
                                        </div>

                                        <div className={styles.cardActions}>
                                            <button
                                                onClick={() => handleSaveEdit(person.id)}
                                                disabled={actionLoading[`edit-${person.id}`]}
                                                className={styles.saveBtn}
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className={styles.cancelBtn}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {person.media && (
                                            <div className={styles.cardImage}>
                                                <img src={person.media} alt={person.name} />
                                            </div>
                                        )}

                                        <div className={styles.cardHeader}>
                                            <h4>{person.name}</h4>
                                            <span className={`${styles.role} ${getRoleClass(person.role)}`}>
                                                {ROLES[person.role as keyof typeof ROLES]}
                                            </span>
                                        </div>

                                        <div className={styles.cardContent}>
                                            <p className={styles.birthDate}>
                                                <strong>Born:</strong> {new Date(person.birthDate).toLocaleDateString()}
                                            </p>
                                            <p className={styles.bio}>{person.bio}</p>
                                        </div>

                                        <div className={styles.cardActions}>
                                            <button
                                                onClick={() => handleEditPerson(person)}
                                                className={styles.editBtn}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const input = document.createElement('input');
                                                    input.type = 'file';
                                                    input.accept = 'image/*';
                                                    input.onchange = (e) => {
                                                        const file = (e.target as HTMLInputElement).files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onload = (event) => {
                                                                setPersons(prev => prev.map(p =>
                                                                    p.id === person.id ? { ...p, media: event.target?.result as string } : p
                                                                ));
                                                                showToast('success', 'Image updated');
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    };
                                                    input.click();
                                                }}
                                                className={styles.imageBtn}
                                                title="Change image"
                                            >
                                                📸
                                            </button>
                                            {person.media && (
                                                <button
                                                    onClick={() => handleRemoveImage(person.id)}
                                                    className={styles.imageBtn}
                                                    title="Remove image"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeletePerson(person.id, person.name)}
                                                disabled={actionLoading[`delete-${person.id}`]}
                                                className={styles.deleteBtn}
                                            >
                                                {actionLoading[`delete-${person.id}`] ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};
