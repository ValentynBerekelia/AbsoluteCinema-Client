import { useSearchParams } from 'react-router-dom';
import './AdminSearch.css';

export const AdminSearch = () => {

    // This allows you to read and modify URL parameters (?search=...)
    const [searchParams, setSearchParams] = useSearchParams();

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;

        if (text) {
            setSearchParams({ search: text });
        } else {
            setSearchParams({});
        }
    };
    
    return (
        <div className='admin-search-container'>
            <input 
                type="text"
                className='admin-search-input'
                placeholder='Search by name'
                value={searchParams.get('search') || ''}
                onChange={handleSearch}
            />
        </div>
    );
}