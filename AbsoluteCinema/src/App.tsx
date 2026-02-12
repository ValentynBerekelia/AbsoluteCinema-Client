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
import { BookingPage } from './pages/Booking/BookingPage'
import { MovieSessionsPage } from './pages/MovieSessions/MovieSessionsPage'
import { ReservationsPage } from './pages/Admin/Reservations/ReservationsPage'
import { ClientsPage } from './pages/Admin/Clients/ClientsPage'
import { AboutUs } from './pages/AboutUs/AboutUs'
import { MoviesLibrary } from './pages/MoviesLibrary/MoviesLibrary'
import { AdminGenresPage } from './pages/Admin/Genres/AdminGenresPage'
import { AdminPersonsPage } from './pages/Admin/Persons/AdminPersonsPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardPage } from './pages/Admin/Dashboard/DashboardPage'
import { ProfilePage } from './pages/Profile/ProfilePage'

function App() {
  return (
    <Routes>
      <Route path='/' element={<MainLayout><Home /></MainLayout>} />
      <Route path='/about' element={<MainLayout><AboutUs /></MainLayout>} />
      <Route path='/movies' element={<MainLayout><MoviesLibrary /></MainLayout>} />
      <Route path='/movie/:id' element={<MainLayout><MovieDetailsPage /></MainLayout>} />
      <Route path='/movie/:id/sessions' element={<MainLayout><MovieSessionsPage /></MainLayout>} />
      <Route path='/booking/:movieId/:sessionId' element={<MainLayout><BookingPage /></MainLayout>} />

      <Route path='/login' element={<MainLayout><><Home /><LoginPage /></></MainLayout>} />
      <Route path='/register' element={<MainLayout><><Home /><RegisterPage /></></MainLayout>} />
      <Route path='/profile' element={<MainLayout><ProfilePage /></MainLayout>} />

      <Route element={<ProtectedRoute requiredRole="Admin" />}>
        <Route path='/admin' element={<AdminLayout><AdminMainPage /></AdminLayout>} />
        <Route path='/admin/movies' element={<AdminLayout><AdminMainPage /></AdminLayout>} />
        <Route path='/admin/halls' element={<AdminLayout><HallsPage /></AdminLayout>} />
        <Route path='/admin/reservations' element={<AdminLayout><ReservationsPage /></AdminLayout>} />
        <Route path='/admin/clients' element={<AdminLayout><ClientsPage /></AdminLayout>} />
        <Route path='/admin/movies/add' element={<AdminLayout><AddMoviePage /></AdminLayout>} />
        <Route path='/admin/movies/edit/:movieId' element={<AdminLayout><EditMoviePage /></AdminLayout>} />
        <Route path='/admin/genres' element={<AdminLayout><AdminGenresPage /></AdminLayout>} />
        <Route path='/admin/persons' element={<AdminLayout><AdminPersonsPage /></AdminLayout>} />
        <Route path='/admin/statistics' element={<AdminLayout><DashboardPage /></AdminLayout>} />
      </Route>
    </Routes>
  )
}

export default App