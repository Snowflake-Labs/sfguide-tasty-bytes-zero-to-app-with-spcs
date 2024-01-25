import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Login from './pages/Login';
import Home from './pages/Home';
import Details from './pages/Details';
import {enableLogin, isLoggedIn} from './Utils.js'
import { Navigate, Outlet, useLocation } from 'react-router-dom';

function App() {

  const LoginWrapper = () => {
    const location = useLocation();
    console.log(`Checking login state: Login enabled=${enableLogin()}, is logged=${isLoggedIn(location.state)}`);
    return isLoggedIn(location.state) ? <Outlet /> : <Navigate to="/login" replace />;
  };  


  return (
    // Routing for the App.
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={ <Login />  } />
        <Route element={<LoginWrapper />}>
          <Route path="/" element={ <Home /> } />
          <Route path="/home" element={ <Home /> } />
          <Route path="/details" element={ <Details /> } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
