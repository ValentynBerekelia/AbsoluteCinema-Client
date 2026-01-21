import { useState } from 'react'
import viteLogo from '/vite.svg'
import './App.css'
import { Header } from './components/layout/Header/Header'
import { Hero } from './components/Hero/Hero'
import { MovieCard } from './components/MovieCard/MovieCard'
import { HERO_MOVIES } from './data/movies'

function App() {

  return (
    <>
    <Header></Header>
    <Hero></Hero>
    <MovieCard movie={HERO_MOVIES[2]}></MovieCard>
    </>
  )
}

export default App
