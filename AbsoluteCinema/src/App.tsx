import { Route, Routes } from 'react-router-dom'
import './App.css'
import { MainLayout } from './components/layout/MainLayout'
import { Home } from './pages/Home/Home'
import { AdminLayout } from './components/layout/AdminLayout/AdminLayout'
import { AddMoviePage } from './pages/Admin/Movies/AddMovie/AddMoviePage'
import { AdminMainPage } from './pages/Admin/MainPage/AdminMainPage'

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
            <AdminMainPage/>
          </AdminLayout>
        }
      />
      <Route
        path='/admin/movies'
        element={
          <AdminLayout>
            <AdminMainPage/>
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
    </Routes>
  )
}

export default App
