import { useEffect, useState } from 'react';
import styles from './AdminPersonsPage.module.css';
import { useToast } from '@/context/ToastContext/ToastContext';
import { attachMediaToPerson, createPerson, deletePerson, getPersonById, searchPersons, updatePerson } from '@/api/movies';

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

const PLACEHOLDER_PERSON_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png';

export const AdminPersonsPage = () => {
    const { showToast } = useToast();
    const [persons, setPersons] = useState<Person[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingData, setEditingData] = useState<Partial<Person>>({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);
    const [mediaUrlDrafts, setMediaUrlDrafts] = useState<Record<string, string>>({});
    const [newPerson, setNewPerson] = useState<Partial<Person>>({
        name: '',
        bio: '',
        birthDate: '',
        role: 2
    });
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchPersons = async () => {
            try {
                const data = await searchPersons(undefined, undefined, 200);
                const list = Array.isArray(data) ? data : data?.persons || [];
                const mapped: Person[] = list.map((p: any) => ({
                    id: p.personId ?? p.id,
                    name: p.fullName ?? p.name ?? '',
                    bio: '',
                    birthDate: '',
                    role: p.role ?? p.personRole ?? 2,
                    media: p.photoUrl ?? p.mediaUrl ?? ''
                }));
                setPersons(mapped);
            } catch (err) {
                console.error('Failed to load persons:', err);
                showToast('error', 'Failed to load persons');
            }
        };

        fetchPersons();
    }, [showToast]);

    const handleAttachMediaUrl = async (personId: string, url: string) => {
        if (!url.trim()) return;
        try {
            await attachMediaToPerson(personId, url.trim());
            setPersons(prev => prev.map(p =>
                p.id === personId ? { ...p, media: url.trim() } : p
            ));
            showToast('success', 'Image attached successfully');
        } catch (err) {
            console.error('Failed to attach image:', err);
            showToast('error', 'Failed to attach image');
        }
    };

    const handleMediaDraftChange = (personId: string, value: string) => {
        setMediaUrlDrafts(prev => ({ ...prev, [personId]: value }));
    };

    const handleRemoveImage = async (personId: string) => {
        try {
            await attachMediaToPerson(personId, PLACEHOLDER_PERSON_IMAGE);
            setPersons(prev => prev.map(p =>
                p.id === personId ? { ...p, media: PLACEHOLDER_PERSON_IMAGE } : p
            ));
            showToast('success', 'Image replaced with placeholder');
        } catch (err) {
            console.error('Failed to attach placeholder image:', err);
            showToast('error', 'Failed to replace image');
        }
    };

    const handleEditPerson = async (person: Person) => {
        setEditingId(person.id);
        setEditingData({ ...person });
        try {
            const details = await getPersonById(person.id);
            setEditingData(prev => ({
                ...prev,
                name: details.fullName ?? prev.name,
                bio: details.bio ?? prev.bio,
                birthDate: details.birthDate ? String(details.birthDate).split('T')[0] : prev.birthDate,
                role: details.role ?? prev.role,
                media: details.photoUrl ?? prev.media
            }));
        } catch (err) {
            console.error('Failed to load person details:', err);
        }
    };

    const handleSaveEdit = async (id: string) => {
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
            await updatePerson(id, {
                fullName: editingData.name?.trim() || '',
                bio: editingData.bio || '',
                birthDate: editingData.birthDate || '',
                role: editingData.role || 2
            });
            setPersons(prev => prev.map(p =>
                p.id === id ? { ...p, ...editingData } as Person : p
            ));
            setEditingId(null);
            setEditingData({});
            showToast('success', 'Person updated successfully');
        } catch (err) {
            console.error('Failed to update person:', err);
            showToast('error', 'Failed to update person');
        } finally {
            setActionLoading(prev => ({ ...prev, [`edit-${id}`]: false }));
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingData({});
    };

    const handleDeletePerson = async (id: string, name: string) => {
        if (!window.confirm(`Delete "${name}"?`)) return;

        try {
            setActionLoading(prev => ({ ...prev, [`delete-${id}`]: true }));
            await deletePerson(id);
            setPersons(prev => prev.filter(p => p.id !== id));
            showToast('success', 'Person deleted successfully');
        } catch (err) {
            console.error('Failed to delete person:', err);
            showToast('error', 'Failed to delete person');
        } finally {
            setActionLoading(prev => ({ ...prev, [`delete-${id}`]: false }));
        }
    };

    const handleAddPerson = async () => {
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
            const response = await createPerson({
                fullName: newPerson.name.trim(),
                bio: newPerson.bio?.trim() || '',
                birthDate: newPerson.birthDate,
                role: newPerson.role || 2
            });

            const newId = response.personId || response.id;
            const mediaUrlToAttach = newPerson.media?.trim() || PLACEHOLDER_PERSON_IMAGE;
            if (newId) {
                try {
                    await attachMediaToPerson(newId, mediaUrlToAttach);
                } catch (mediaErr) {
                    console.error('Failed to attach person media:', mediaErr);
                    showToast('error', 'Failed to attach person media');
                }
            }

            const person: Person = {
                id: newId,
                name: response.fullName || newPerson.name.trim(),
                bio: newPerson.bio?.trim() || '',
                birthDate: newPerson.birthDate,
                role: newPerson.role || 2,
                media: mediaUrlToAttach
            };
            setPersons(prev => [...prev, person]);
            setNewPerson({ name: '', bio: '', birthDate: '', role: 2, media: undefined });
            setShowAddForm(false);
            showToast('success', 'Person added successfully');
        } catch (err) {
            console.error('Failed to create person:', err);
            showToast('error', 'Failed to create person');
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
                            setNewPerson({ name: '', bio: '', birthDate: '', role: 2, media: undefined });
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
                            <label>Profile Image URL</label>
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
                                    <input
                                        type="url"
                                        value={newPerson.media || ''}
                                        onChange={(e) => setNewPerson(prev => ({ ...prev, media: e.target.value }))}
                                        placeholder="https://..."
                                        className={styles.input}
                                    />
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
                                                        onClick={async () => {
                                                            try {
                                                                await attachMediaToPerson(person.id, PLACEHOLDER_PERSON_IMAGE);
                                                                setEditingData(prev => ({ ...prev, media: PLACEHOLDER_PERSON_IMAGE }));
                                                                showToast('success', 'Image replaced with placeholder');
                                                            } catch (err) {
                                                                console.error('Failed to attach placeholder image:', err);
                                                                showToast('error', 'Failed to replace image');
                                                            }
                                                        }}
                                                        className={styles.removeImageBtn}
                                                    >
                                                        ✕ Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className={styles.imageEditSection}>
                                                    <input
                                                        type="url"
                                                        value={mediaUrlDrafts[person.id] || ''}
                                                        onChange={(e) => handleMediaDraftChange(person.id, e.target.value)}
                                                        placeholder="https://..."
                                                        className={styles.input}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAttachMediaUrl(person.id, mediaUrlDrafts[person.id] || '')}
                                                        className={styles.imageBtn}
                                                    >
                                                        📸 Attach image URL
                                                    </button>
                                                </div>
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
                                            <div className={styles.mediaAttachInline}>
                                                <input
                                                    type="url"
                                                    value={mediaUrlDrafts[person.id] || ''}
                                                    onChange={(e) => handleMediaDraftChange(person.id, e.target.value)}
                                                    placeholder="Image URL"
                                                    className={styles.input}
                                                />
                                                <button
                                                    onClick={() => handleAttachMediaUrl(person.id, mediaUrlDrafts[person.id] || '')}
                                                    className={styles.imageBtn}
                                                    title="Attach image URL"
                                                >
                                                    📸
                                                </button>
                                            </div>
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
