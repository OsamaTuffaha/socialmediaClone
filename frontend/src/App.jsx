// src/App.jsx
import { Route , Routes } from "react-router-dom";
import Login from "./pages/Login/login";
import Register from "./pages/Register/register"
import router from "./Routers/index";
import { RouterProvider } from "react-router-dom";

function App() {
   return (
    <RouterProvider router={router}/>
  );
}

export default App;
