import { Route, Routes } from 'react-router-dom'
import './App.css'
import { MainLayout } from './components/layout/MainLayout'
import { Home } from './pages/Home/Home'
import { AdminLayout } from './components/layout/AdminLayout/AdminLayout'
import { AdminMainPage } from './pages/Admin/AdminMainPage'
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
        path='/movie/:id'
        element={
          <MainLayout>
            <MovieDetailsPage/>
          </MainLayout>
        }
      >
      </Route>
    </Routes>
  )
}

export default App
