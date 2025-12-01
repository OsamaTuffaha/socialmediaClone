// src/App.jsx
import { Route , Routes } from "react-router-dom";
import Login from "./pages/Login/login";
import Register from "./pages/Register/register"

function App() {
   return (
    <Routes>
      <Route path="/" element={<Login/>} />
      <Route path="/register" element={<Register/>}/>
    </Routes>
  );
}

export default App;
