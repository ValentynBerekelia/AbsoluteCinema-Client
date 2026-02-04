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
<<<<<<< Updated upstream
=======
import { LoginPage } from './pages/Auth/Login/LoginPage'
import { RegisterPage } from './pages/Auth/Register/RegisterPage'
import { BookingPage } from './pages/Booking/BookingPage'
import { MovieSessionsPage } from './pages/MovieSessions/MovieSessionsPage'
>>>>>>> Stashed changes

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
        path='/movie/:id/sessions'
        element={
          <MainLayout>
            <MovieSessionsPage />
          </MainLayout>
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
<<<<<<< Updated upstream
=======
      <Route
        path='/booking/:movieId/:sessionId'
        element={
          <MainLayout>
            <BookingPage />
          </MainLayout>
        }
      />
      <Route
        path='/login'
        element={
          <MainLayout>
            <Home />
            <LoginPage />
          </MainLayout>
        }
      />
      <Route
        path='/register'
        element={
          <MainLayout>
            <Home />
            <RegisterPage />
          </MainLayout>
        }
      />
>>>>>>> Stashed changes
    </Routes>
  )
}

export default App
