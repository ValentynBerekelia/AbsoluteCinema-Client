<<<<<<< HEAD
import './App.css'
import { MainLayout } from './components/layout/MainLayout'
import { Home } from './pages/Home/Home'
=======
import { Route, Routes } from 'react-router-dom'
import './App.css'
import { MainLayout } from './components/layout/MainLayout'
import { Home } from './pages/Home/Home'
import { AdminLayout } from './components/layout/AdminLayout/AdminLayout'
import { AdminMainPage } from './pages/Admin/AdminMainPage'
>>>>>>> 834622b22331f6651be5c585bed5baa69c9beb5a

function App() {

  return (
<<<<<<< HEAD
    <>
    <MainLayout>
      <Home/>
    </MainLayout>
    </>
=======
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
        path='/admin'
        element={
          <AdminLayout>
            <AdminMainPage/>
          </AdminLayout>
        }
      />
    </Routes>
>>>>>>> 834622b22331f6651be5c585bed5baa69c9beb5a
  )
}

export default App
