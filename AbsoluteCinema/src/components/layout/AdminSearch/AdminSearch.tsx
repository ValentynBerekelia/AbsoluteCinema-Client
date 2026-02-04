import './AdminSearch.css'

export const AdminSearch = () => {
    return (
        <div className='admin-search-container'>
            <input 
                type="text"
                className='admin-search-input'
                placeholder='Search by name'
            />
        </div>
    );
}