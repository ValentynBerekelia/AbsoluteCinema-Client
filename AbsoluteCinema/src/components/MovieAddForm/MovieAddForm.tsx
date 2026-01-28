import React, { useState, ChangeEvent } from 'react';
import './MovieAddForm.css';
import { CreateMovieRequest } from '../../types/CreateMovieRequest';

export const MovieAddForm = () => {
    const [posterPreview, setPosterPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState<CreateMovieRequest>({
        movieName: 'Add Movie Title',
        description: '',
        rate: 0,
        ageLimit: 0,
        duration: { ticks: 0 },
        country: '',
        studio: '',
        language: '',
        genres: []
    });

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPosterPreview(URL.createObjectURL(file));
        }
    };

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
                        {posterPreview ? (
                            <img src={posterPreview} alt="Preview" className="poster-img-preview" />
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
                    <div className="form-group">
                        <label>Rate</label>
                        <input name="rate" type="number" step="0.1" onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label>Age limit</label>
                        <input name="ageLimit" type="number" onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label>Duration</label>
                        <input name="duration" type="number" placeholder="Minutes" />
                    </div>
                    <div className="form-group">
                        <label>Language</label>
                        <input name="language" type="text" onChange={handleInputChange} />
                    </div>
                    <div className="form-group-multi">
                        <div className="form-group">
                            <label>Country</label>
                            <input name="country" type="text" onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Studio</label>
                            <input name="studio" type="text" onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="form-group description-row">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Add movie description here..."
                        />
                    </div>

                    <button className="save-details-button">Save details</button>
                </div>
            </div>
        </div>
    );
};