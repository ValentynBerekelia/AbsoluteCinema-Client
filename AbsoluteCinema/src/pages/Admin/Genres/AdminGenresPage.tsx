import { useEffect, useState } from 'react';
import styles from './AdminGenresPage.module.css';
import { getGenres, createGenre, updateGenre, deleteGenre } from '@/api/movies';
import { useToast } from '@/context/ToastContext/ToastContext';

interface Genre {
    id: string;
    name: string;
}

export const AdminGenresPage = () => {
    const { showToast } = useToast();
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newGenreName, setNewGenreName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

    const fetchGenres = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getGenres();
            const genresList = Array.isArray(data) ? data : data.genres || [];
            setGenres(genresList);
        } catch (err) {
            console.error('Failed to load genres:', err);
            setError('Failed to load genres');
            showToast('error', 'Failed to load genres');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGenres();
    }, []);

    const handleCreateGenre = async () => {
        if (!newGenreName.trim()) {
            showToast('error', 'Genre name is required');
            return;
        }

        try {
            setActionLoading(prev => ({ ...prev, create: true }));
            await createGenre(newGenreName.trim());
            setNewGenreName('');
            showToast('success', 'Genre created successfully');
            await fetchGenres();
        } catch (err) {
            console.error('Create genre error:', err);
            showToast('error', 'Failed to create genre');
        } finally {
            setActionLoading(prev => ({ ...prev, create: false }));
        }
    };

    const handleEditGenre = (id: string, name: string) => {
        setEditingId(id);
        setEditingName(name);
    };

    const handleSaveEdit = async (id: string) => {
        if (!editingName.trim()) {
            showToast('error', 'Genre name is required');
            return;
        }

        try {
            setActionLoading(prev => ({ ...prev, [`edit-${id}`]: true }));
            await updateGenre(id, editingName.trim());
            setGenres(prev => prev.map(g => g.id === id ? { ...g, name: editingName.trim() } : g));
            setEditingId(null);
            setEditingName('');
            showToast('success', 'Genre updated successfully');
        } catch (err) {
            console.error('Update genre error:', err);
            showToast('error', 'Failed to update genre');
        } finally {
            setActionLoading(prev => ({ ...prev, [`edit-${id}`]: false }));
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingName('');
    };

    const handleDeleteGenre = async (id: string, name: string) => {
        if (!window.confirm(`Delete genre "${name}"?`)) return;

        try {
            setActionLoading(prev => ({ ...prev, [`delete-${id}`]: true }));
            await deleteGenre(id);
            setGenres(prev => prev.filter(g => g.id !== id));
            showToast('success', 'Genre deleted successfully');
        } catch (err) {
            console.error('Delete genre error:', err);
            showToast('error', 'Failed to delete genre');
        } finally {
            setActionLoading(prev => ({ ...prev, [`delete-${id}`]: false }));
        }
    };

    return (
        <div className={styles.container}>
            <h2>Manage Genres</h2>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.createSection}>
                <h3>Add New Genre</h3>
                <div className={styles.inputGroup}>
                    <input
                        type="text"
                        value={newGenreName}
                        onChange={(e) => setNewGenreName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateGenre()}
                        placeholder="Enter genre name"
                        className={styles.input}
                    />
                    <button
                        onClick={handleCreateGenre}
                        disabled={actionLoading.create || !newGenreName.trim()}
                        className={styles.button}
                    >
                        {actionLoading.create ? 'Creating...' : 'Add Genre'}
                    </button>
                </div>
            </div>

            <div className={styles.listSection}>
                <h3>Existing Genres ({genres.length})</h3>
                
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search genres..."
                        className={styles.searchInput}
                    />
                </div>

                {loading ? (
                    <div className={styles.loading}>Loading genres...</div>
                ) : (() => {
                    const filteredGenres = genres.filter(g =>
                        g.name.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    return filteredGenres.length === 0 ? (
                        <div className={styles.empty}>
                            {genres.length === 0 ? 'No genres found' : 'No genres match your search'}
                        </div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGenres.map(genre => (
                                    <tr key={genre.id}>
                                        <td>
                                            {editingId === genre.id ? (
                                                <input
                                                    type="text"
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    className={styles.input}
                                                />
                                            ) : (
                                                genre.name
                                            )}
                                        </td>
                                        <td>
                                            {editingId === genre.id ? (
                                                <div className={styles.actionButtons}>
                                                    <button
                                                        onClick={() => handleSaveEdit(genre.id)}
                                                        disabled={actionLoading[`edit-${genre.id}`]}
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
                                            ) : (
                                                <div className={styles.actionButtons}>
                                                    <button
                                                        onClick={() => handleEditGenre(genre.id, genre.name)}
                                                        className={styles.editBtn}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteGenre(genre.id, genre.name)}
                                                        disabled={actionLoading[`delete-${genre.id}`]}
                                                        className={styles.deleteBtn}
                                                    >
                                                        {actionLoading[`delete-${genre.id}`] ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    );
                })()}
            </div>
        </div>
    );
};
