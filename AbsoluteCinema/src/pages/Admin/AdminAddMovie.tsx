import React, { useState } from 'react'
import './AdminAddMovie.css'

export const AdminAddMovie = () => {
  const [title, setTitle] = useState('Add Movie Title')
  const [description, setDescription] = useState('')
  const [hall, setHall] = useState('Hall: HallName')
  const [rows, setRows] = useState(5)
  const [cols, setCols] = useState(8)

  const seats = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({ row: r + 1, col: c + 1 }))
  )

  return (
    <div className='admin-add-movie'>
      <div className='admin-add-top'>
        <div className='left-pane'>
          <div className='poster-placeholder'>
            <div className='poster-x'>X</div>
          </div>
          <button className='upload-btn'>Upload</button>
        </div>
        <div className='right-pane'>
          <h3 className='movie-title'>{title}</h3>
          <div className='fields'>
            <label>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} />

            <label>Genre</label>
            <input placeholder='Add Text (input hint)' />

            <label>Duration</label>
            <input placeholder='Add Text' />

            <label>Format</label>
            <input placeholder='Add Text' />

            <label>Year</label>
            <input placeholder='Add Text' />

            <label>Country</label>
            <input placeholder='Add Text' />

            <label>Director(s)</label>
            <input placeholder='Add Text' />

            <label>Starring</label>
            <input placeholder='Add Text' />

            <button className='save-details'>Save details</button>
          </div>
        </div>
      </div>

      <div className='admin-add-bottom'>
        <div className='sessions-panel'>
          <div className='session-controls'>
            <div className='date-range'>
              <label>From [date range]</label>
              <input type='date' />
              <label>to [date range]</label>
              <input type='date' />
            </div>
            <div className='time-controls'>
              <label>Time</label>
              <input type='time' />
            </div>
            <div className='hall-select'>
              <label>Hall:</label>
              <select value={hall} onChange={e => setHall(e.target.value)}>
                <option>Hall: HallName</option>
                <option>Hall: Hall 1</option>
                <option>Hall: Hall 2</option>
              </select>
            </div>
          </div>

          <div className='seats-grid'>
            {seats.map((row, ri) => (
              <div key={ri} className='seat-row'>
                {row.map(s => (
                  <div key={`${s.row}-${s.col}`} className='seat' />
                ))}
              </div>
            ))}
          </div>

          <div className='ticket-prices'>
            <label>Average:</label>
            <input placeholder='Add Text' />
            <div className='checkboxes'>
              <label><input type='checkbox' /> First 3 row: <input placeholder='Add Text' /></label>
              <label><input type='checkbox' /> Vip: <input placeholder='Add Text' /></label>
            </div>
            <button className='save-sessions'>Save sessions and price</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAddMovie
