import AdminLogin from "./pages/AdminLogin";
import RutaAdmin from "./components/RutaAdmin";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import Toaster from "./components/Toaster";

import Catalogo from "./pages/Catalogo";
import DetalleProducto from "./pages/DetalleProducto";
import Pedido from "./pages/Pedido";
import Confirmacion from "./pages/Confirmacion";
import Seguimiento from "./pages/Seguimiento";
import AdminPanel from "./pages/AdminPanel";

function Layout() {
  return (
    <>
      <Navbar />
      <main><Outlet /></main>
      <CartDrawer />
      <Toaster />
      <footer className="pie-pagina">Flores &amp; Artesanías — Proyecto IHC</footer>
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Catalogo /> },
      { path: "producto/:id", element: <DetalleProducto /> },
      { path: "pedido", element: <Pedido /> },
      { path: "confirmacion/:orderId", element: <Confirmacion /> },
      { path: "seguimiento", element: <Seguimiento /> },
      { path: "seguimiento/:orderId", element: <Seguimiento /> },
      { path: "admin-login", element: <AdminLogin /> },
      { path: "admin", element: <RutaAdmin><AdminPanel /></RutaAdmin> },
    ],
  },
]);

export default function App() {
  return (
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  );
}