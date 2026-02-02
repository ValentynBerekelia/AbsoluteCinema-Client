import { Route, Routes } from 'react-router-dom'
import './App.css'
import { MainLayout } from './components/layout/MainLayout'
import { Home } from './pages/Home/Home'
import { AdminLayout } from './components/layout/AdminLayout/AdminLayout'
import { AddMoviePage } from './pages/Admin/Movies/AddMovie/AddMoviePage'
import { EditMoviePage } from './pages/Admin/Movies/EditMovie/EditMoviePage'
import { AdminMainPage } from './pages/Admin/MainPage/AdminMainPage'
import { MovieDetailsPage } from './pages/MovieDetails/MovieDetailsPage'

function App() {

  return (
    <Routes>
      <Route
        path='/'
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />
      <Route
        path='/admin'
        element={
          <AdminLayout>
            <AdminMainPage />
          </AdminLayout>
        }
      />
      <Route
        path='/admin/movies'
        element={
          <AdminLayout>
            <AdminMainPage />
          </AdminLayout>
        }
      />
      <Route
        path='/admin/movies/add'
        element={
          <AdminLayout>
            <AddMoviePage />
          </AdminLayout>
        }
      />
      <Route
        path='/admin/movies/edit/:movieId'
        element={
          <AdminLayout>
            <EditMoviePage />
          </AdminLayout>
        }
      />
      <Route
        path='/movie/:id'
        element={
          <MainLayout>
            <MovieDetailsPage />
          </MainLayout>
        }
      />
    </Routes>
  )
}

export default App
