import { Route, Routes } from 'react-router-dom'
import './App.css'
import { MainLayout } from './components/layout/MainLayout'
import { Home } from './pages/Home/Home'
import { AdminLayout } from './components/layout/AdminLayout/AdminLayout'
import { AddMoviePage } from './pages/Admin/Movies/AddMovie/AddMoviePage'
import { AdminMainPage } from './pages/Admin/MainPage/AdminMainPage'
import { MovieDetailsPage } from './pages/MovieDetails/MovieDetailsPage'
import { HallsPage } from './pages/Admin/Halls/HallsPage'
import { EditMoviePage } from './pages/Admin/Movies/EditMovie/EditMoviePage'
import { LoginPage } from './pages/Auth/Login/LoginPage'
import { RegisterPage } from './pages/Auth/Register/RegisterPage'

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
        path='/admin/halls'
        element={
          <AdminLayout>
            <HallsPage />
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
        path='/movie/:id'
        element={
          <MainLayout>
            <MovieDetailsPage />
          </MainLayout>
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
        path='/login'
        element={<LoginPage />}
      />
      <Route
        path='/register'
        element={<RegisterPage />}
      />
    </Routes>
  )
}

export default App
