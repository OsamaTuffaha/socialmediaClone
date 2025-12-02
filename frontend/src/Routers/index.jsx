import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login/login";
import Register from "../pages/Register/register";
import HomePage from "../pages/Home/home";
import NavBar from "../components/NavBar/navbar";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: (
      <>
        <NavBar />
        <HomePage />
      </>
    ),
  },
]);

export default router;
