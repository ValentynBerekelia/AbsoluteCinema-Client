import { Route, Routes } from 'react-router-dom'
import './App.css'
import { MainLayout } from './components/layout/MainLayout'
import { Home } from './pages/Home/Home'
import { AdminLayout } from './components/layout/AdminLayout/AdminLayout'
import { AdminMainPage } from './pages/Admin/MainPage/AdminMainPage'
import { AdminAddMovie } from './pages/Admin/AddMovie/AdminAddMovie'

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
        path="/admin/movies"
        element={
          <AdminLayout>
            <AdminAddMovie />
          </AdminLayout>
        }
      />
    </Routes>
  )
}

export default App
