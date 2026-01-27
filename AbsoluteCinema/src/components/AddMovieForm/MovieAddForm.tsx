import React from 'react';
import './MovieAddForm.css';

interface Props {
    title: string;
    setTitle: (val: string) => void;
}

export const MovieAddForm = ({ title, setTitle }: Props) => {
    return (
        <div className="movie-add-container">
            <div className="movie-add-header">
                <input 
                    type="text" 
                    className="title-input-field" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                />
                <div className="hall-dropdown">
                    <span>Hall: </span>
                    <select>
                        <option>HallName</option>
                    </select>
                </div>
            </div>

            <div className="movie-add-body">
                <div className="poster-upload-section">
                    <div className="poster-skeleton">
                        <div className="skeleton-x">✕</div>
                        <div className="upload-bottom-bar">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="form-fields-section">
                    <div className="form-group">
                        <label>Description</label>
                        <textarea placeholder="Add Text" rows={2} />
                    </div>

                    <div className="form-group">
                        <label>Genre:</label>
                        <input type="text" placeholder="Add Text (input hint)" />
                    </div>

                    <div className="form-group">
                        <label>Duration:</label>
                        <input type="text" placeholder="Add Text" />
                    </div>

                    <div className="form-group">
                        <label>Format:</label>
                        <input type="text" placeholder="Add Text" />
                    </div>

                    <div className="form-group">
                        <label>Age limit:</label>
                        <input type="text" placeholder="Add Text" />
                    </div>

                    <div className="form-group">
                        <label>Year:</label>
                        <input type="text" placeholder="Add Text" />
                    </div>

                    <div className="form-group">
                        <label>Country:</label>
                        <input type="text" placeholder="Add Text" />
                    </div>

                    <div className="form-group">
                        <label>Director(s):</label>
                        <input type="text" placeholder="Add Text" />
                    </div>

                    <div className="form-group">
                        <label>Starring:</label>
                        <input type="text" placeholder="Add Text" />
                    </div>

                    <button className="save-details-button">Save details</button>
                </div>
            </div>
        </div>
    );
};