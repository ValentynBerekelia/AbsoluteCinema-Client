import { useEffect, useState, useRef } from 'react';
import { getFormatLabel, SessionFormat } from '@/types/Session';
import { getGenres, Genre } from '@/api/genres';
import './MovieFilters.css';

const FORMATS = [SessionFormat.TwoD, SessionFormat.ThreeD];

interface MovieFiltersProps {
    selectedGenres: string[];
    selectedFormat: number | null;
    onSelectGenre: (genres: string[]) => void;
    onSelectFormat: (format: number | null) => void;
}

export const MovieFilters = ({ 
    selectedGenres, 
    selectedFormat, 
    onSelectGenre, 
    onSelectFormat 
}: MovieFiltersProps) => {
    
    const [genresList, setGenresList] = useState<Genre[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetch = async () => {
            const data = await getGenres();
            setGenresList(data);
        };
        fetch();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleGenre = (genreName: string) => {
        if (selectedGenres.includes(genreName)) {
            onSelectGenre(selectedGenres.filter(g => g !== genreName));
        } else {
            onSelectGenre([...selectedGenres, genreName]);
        }
    };

    const handleFormatClick = (format: number) => {
        onSelectFormat(selectedFormat === format ? null : format);
    };

    return (
        <div className="filters-container">
            
            {/* --- GENRE ROW WITH FORMAT BUTTONS --- */}
            <div className="filters-row">
                
                <div className="genre-wrapper">
                    {/* Dropdown menu */}
                    <div className="dropdown-container" ref={dropdownRef}>
                        <button 
                            className="dropdown-btn"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            Select Genres <span className="arrow">▼</span>
                        </button>

                        {isDropdownOpen && (
                            <div className="dropdown-list">
                                {genresList.length > 0 ? (
                                    genresList.map(genre => (
                                        <div 
                                            key={genre.id} 
                                            className="dropdown-item"
                                            onClick={() => toggleGenre(genre.name)}
                                        >
                                            <input 
                                                type="checkbox" 
                                                checked={selectedGenres.includes(genre.name)}
                                                readOnly 
                                            />
                                            <span>{genre.name}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="dropdown-empty"> No genres loaded</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Selected genres (chips) on the right */}
                    <div className="selected-chips-area">
                        {selectedGenres.slice(0, 8).map(genre => (
                            <span key={genre} className="genre-chip">
                                {genre}
                                <button 
                                    className="remove-chip-btn"
                                    onClick={() => toggleGenre(genre)}
                                >
                                    ×
                                </button>
                            </span>
                        ))}

                        {selectedGenres.length > 8 && (
                            <span className="more-genres-badge">
                                +{selectedGenres.length - 8}
                            </span>
                        )}
                    </div>
                </div>

                {/* Format buttons aligned on same row */}
                <div className="formats-list">
                    {FORMATS.map(format => (
                        <button
                            key={format}
                            className={`format-chip ${selectedFormat === format ? 'active' : ''}`}
                            onClick={() => handleFormatClick(format)}
                        >
                            {getFormatLabel(format)}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};