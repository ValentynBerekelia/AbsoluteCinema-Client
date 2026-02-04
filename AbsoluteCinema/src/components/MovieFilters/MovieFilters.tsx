import './MovieFilters.css';

// Genre stub (to be replaced with backend data in the future)
const GENRES = [
    "Action",
    "Comedy",
    "Drama",
    "Sci-Fi",
    "Horror",
    "Cartoon",
    "Adventure"
];

const FORMATS = ["2D", "3D"];

interface MovieFiltersProps {
    selectedGenres: string[];
    selectedFormat: string | null;
    onSelectGenre: (genres: string[]) => void;
    onSelectFormat: (format: string | null) => void;
}

export const MovieFilters = ({ 
    selectedGenres, 
    selectedFormat, 
    onSelectGenre, 
    onSelectFormat 
}: MovieFiltersProps) => {

const handleGenreClick = (genre: string) => {
        if (selectedGenres.includes(genre)) {
            onSelectGenre(selectedGenres.filter(g => g !== genre));
        } else {
            onSelectGenre([...selectedGenres, genre]);
        }
    };

    const handleFormatClick = (format: string) => {
        onSelectFormat(selectedFormat === format ? null : format);
    };

    return (
        <div className="filters-container">
            {/* Genre Group */}
            <div className="filters-group">
                <span className="filters-label">Genre:</span>
                <div className="filters-scroll-area">
                    {GENRES.map(genre => (
                        <button
                            key={genre}
                            className={`filter-chip ${selectedGenres.includes(genre) ? 'active' : ''}`}
                            onClick={() => handleGenreClick(genre)}
                        >
                            {genre}
                        </button>
                    ))}
                </div>
            </div>

            {/* Formats Group */}
            <div className="filters-group">
                <span className="filters-label">Format:</span>
                <div className="filters-list">
                    {FORMATS.map(format => (
                        <button
                            key={format}
                            className={`filter-chip ${selectedFormat === format ? 'active' : ''}`}
                            onClick={() => handleFormatClick(format)}
                        >
                            {format}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};