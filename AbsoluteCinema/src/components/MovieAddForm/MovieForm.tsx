import React, { useState, ChangeEvent } from 'react';
import { MovieFormData } from '../../types/CreateMovieRequest';
import { MultiSelectField } from '../MultiSelectField/MultiSelectField';
import './MovieForm.css';
import { Genre } from '@/types/Genre';

interface Props {
    formData: MovieFormData;
    setFormData: React.Dispatch<React.SetStateAction<MovieFormData>>;
    genreOptions?: Genre[];
    directorOptions?: string[];
    actorOptions?: string[];
    onAddGenre?: () => void;
    onAddDirector?: () => void;
    onAddActor?: () => void;
}

const DIRECTORS_LIST = ['Christopher Nolan', 'James Cameron', 'Quentin Tarantino', 'Denis Villeneuve'];
const ACTORS_LIST = ['Leonardo DiCaprio', 'Cillian Murphy', 'Tom Hardy', 'Anne Hathaway'];

export const MovieAddForm = ({
    formData,
    setFormData,
    genreOptions,
    directorOptions,
    actorOptions,
    onAddGenre,
    onAddDirector,
    onAddActor
}: Props) => {
    const [posterPreview, setPosterPreview] = useState<string | null>(null);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        let finalValue: any = value;

        if (type === 'number') {
            const numValue = parseFloat(value);

            if (value === '') {
                setFormData(prev => ({ ...prev, [name]: '' }));
                return;
            }

            if (name === 'rate') {
                if (numValue > 9.9) finalValue = 9.9;
                if (numValue < 0) finalValue = 0;
            }

            if ((name === 'ageLimit' || name === 'duration') && numValue < 0) {
                finalValue = 0;
            }
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPosterPreview(objectUrl);
            setFormData(prev => ({ ...prev, poster: file }));

            return () => URL.revokeObjectURL(objectUrl);
        }
    };

    const currentImage = posterPreview ?? formData.posterUrl;

    return (
        <div className="movie-add-container">
            <div className="movie-add-header">
                <input
                    name="movieName"
                    className="title-input-field"
                    value={formData.movieName}
                    onChange={handleInputChange}
                />
            </div>

            <div className="movie-add-body">
                <div className="poster-upload-section">
                    <div className="poster-skeleton">
                        {currentImage ? (
                            <img src={currentImage} alt="Preview" className="poster-img-preview" />
                        ) : (
                            <div className="skeleton-x">X</div>
                        )}
                        <label className="upload-icon-box">
                            <input type="file" onChange={handleFileChange} hidden accept="image/*" />
                            <span className="arrow-down">↓</span>
                        </label>
                    </div>
                </div>

                <div className="form-fields-section">
                    <div className="form-group-multi">
                        <div className="form-group">
                            <label>Rate (0-10)</label>
                            <input
                                name="rate"
                                type="number"
                                step="0.1"
                                min="0"
                                max="9.9"
                                value={formData.rate}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Age limit</label>
                            <input
                                name="ageLimit"
                                type="number"
                                min="0"
                                value={formData.ageLimit}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="form-group-multi">
                        <div className="form-group">
                            <label>Duration (min)</label>
                            <input
                                type="number"
                                placeholder="Minutes"
                                name="duration"
                                min="1"
                                value={formData.duration}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Language</label>
                            <input
                                name="language"
                                type="text"
                                maxLength={50}
                                value={formData.language}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="form-group-multi">
                        <div className="form-group">
                            <label>Country</label>
                            <input
                                name="country"
                                type="text"
                                maxLength={100}
                                value={formData.country}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Studio</label>
                            <input
                                name="studio"
                                type="text"
                                maxLength={200}
                                value={formData.studio}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <MultiSelectField
                        label="Genres"
                        options={(genreOptions || []).map(g => g.name)}
                        selectedValues={formData.genres.map(g => typeof g === 'string' ? g : g.name)}
                        onChange={(selectedNames) => {
                            const updatedGenres: Genre[] = selectedNames.map(name => {
                                const found = (genreOptions || []).find(opt => opt.name === name);
                                return found || { id: '', name: name };
                            });

                            setFormData(p => ({ ...p, genres: updatedGenres }));
                        }}
                        placeholder="Select Genres"
                        onAddNew={onAddGenre}
                        showAddButton={!!onAddGenre}
                    />
                    <MultiSelectField
                        label="Directors"
                        options={directorOptions && directorOptions.length > 0 ? directorOptions : DIRECTORS_LIST}
                        selectedValues={formData.directors || []}
                        onChange={(vals) => setFormData(p => ({ ...p, directors: vals }))}
                        placeholder="Select Directors"
                        onAddNew={onAddDirector}
                        showAddButton={!!onAddDirector}
                    />
                    <MultiSelectField
                        label="Starring"
                        options={actorOptions && actorOptions.length > 0 ? actorOptions : ACTORS_LIST}
                        selectedValues={formData.starring || []}
                        onChange={(vals) => setFormData(p => ({ ...p, starring: vals }))}
                        placeholder="Select Actors"
                        onAddNew={onAddActor}
                        showAddButton={!!onAddActor}
                    />

                    <div className="form-group description-row">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Description..." />
                    </div>
                </div>
            </div>
        </div>
    );
};