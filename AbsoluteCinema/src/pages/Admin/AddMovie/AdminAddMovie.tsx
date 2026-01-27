import React, { useState } from 'react'
import './AdminAddMovie.css'
import { MovieAddForm } from '../../../components/AddMovieForm/MovieAddForm'

export const AdminAddMovie = () => {
  const [title, setTitle] = useState('Add Movie Title')
  const [description, setDescription] = useState('')
  const [hall, setHall] = useState('HallName')

  const rows = 5
  const cols = 8
  const seats = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({ row: r + 1, col: c + 1 }))
  )

  return (
    <div className='admin-add-movie'>
      <MovieAddForm title={title} setTitle={setTitle}/>
    </div>
  )
}

export default AdminAddMovie