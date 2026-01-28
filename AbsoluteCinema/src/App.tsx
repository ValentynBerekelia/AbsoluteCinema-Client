import { Route, Routes } from 'react-router-dom'
import './App.css'
import { MainLayout } from './components/layout/MainLayout'
import { Home } from './pages/Home/Home'
import { MovieDetailPage } from './pages/Public/MovieDetailPage'
import { BookingPage } from './pages/Public/BookingPage'
import { AdminLayout } from './components/layout/AdminLayout/AdminLayout'
import { MoviesListPage } from './pages/Admin/Movies/MoviesListPage'
import { MovieEditPage } from './pages/Admin/Movies/MovieEditPage'
import { AddMoviePage } from './pages/Admin/Movies/AddMoviePage'
import { HallsPage } from './pages/Admin/Halls/HallsPage'
import { EditHallPage } from './pages/Admin/Halls/EditHallPage'
import { AddHallPage } from './pages/Admin/Halls/AddHallPage'
import { HallSchedulePage } from './pages/Admin/Halls/HallSchedulePage'
import { ClientsPage } from './pages/Admin/Clients/ClientsPage'
import { ClientDetailPage } from './pages/Admin/Clients/ClientDetailPage'
import { EditClientPage } from './pages/Admin/Clients/EditClientPage'
import { ReservationsPage } from './pages/Admin/Reservations/ReservationsPage'
import { ReservationDetailPage } from './pages/Admin/Reservations/ReservationDetailPage'

function App() {

  return (
    <Routes>
      <Route
        path='/'
        element={
          <MainLayout>
            <Home/>
          </MainLayout>
        }
      />
      <Route
        path='/movie/:id'
        element={
          <MainLayout>
            <MovieDetailPage/>
          </MainLayout>
        }
      />
      <Route
        path='/booking/:movieId/:sessionIndex'
        element={
          <MainLayout>
            <BookingPage/>
          </MainLayout>
        }
      />
      <Route
        path='/admin'
        element={
          <AdminLayout>
            <MoviesListPage/>
          </AdminLayout>
        }
      />
      <Route
        path='/admin/movies'
        element={
          <AdminLayout>
            <MoviesListPage/>
          </AdminLayout>
        }
      />
      <Route
        path='/admin/movies/add'
        element={
          <AdminLayout>
            <AddMoviePage/>
          </AdminLayout>
        }
      />
      <Route
        path='/admin/movies/:id/edit'
        element={
          <AdminLayout>
            <MovieEditPage/>
          </AdminLayout>
        }
      />
      <Route
        path='/admin/halls'
        element={
          <AdminLayout>
            <HallsPage/>
          </AdminLayout>
        }
      />
      <Route
        path='/admin/halls/add'
        element={
          <AdminLayout>
            <AddHallPage/>
          </AdminLayout>
        }
      />
      <Route
        path='/admin/halls/:id/edit'
        element={
          <AdminLayout>
            <EditHallPage/>
          </AdminLayout>
        }
      />
      <Route
        path='/admin/halls/:id/schedule'
        element={
          <AdminLayout>
            <HallSchedulePage/>
          </AdminLayout>
        }
      />
      <Route
        path='/admin/clients'
        element={
          <AdminLayout>
            <ClientsPage/>
          </AdminLayout>
        }
      />
      <Route
        path='/admin/clients/:id'
        element={
          <AdminLayout>
            <ClientDetailPage/>
          </AdminLayout>
        }
      />
      <Route
        path='/admin/clients/:id/edit'
        element={
          <AdminLayout>
            <EditClientPage/>
          </AdminLayout>
        }
      />
      <Route
        path='/admin/reservations'
        element={
          <AdminLayout>
            <ReservationsPage/>
          </AdminLayout>
        }
      />
      <Route
        path='/admin/reservations/:id'
        element={
          <AdminLayout>
            <ReservationDetailPage/>
          </AdminLayout>
        }
      />
    </Routes>
  )
}

export default App
