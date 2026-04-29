import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import BrandPage from "./pages/BrandPage";
import CarPage from "./pages/CarPage";
import Admin from "./pages/Admin";
import {
  hasStoredAdminToken,
  subscribeToAdminAuthChanges,
} from "./services/auth";

function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    hasStoredAdminToken()
  );

  useEffect(() => {
    const syncAdminState = () => {
      setIsAdminAuthenticated(hasStoredAdminToken());
    };

    const unsubscribe = subscribeToAdminAuthChanges(syncAdminState);
    syncAdminState();

    return unsubscribe;
  }, []);

  return (
    <div className="app-shell">
      <Navbar isAdminAuthenticated={isAdminAuthenticated} />

      <main className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/brands/:id" element={<BrandPage />} />
          <Route path="/cars/:id" element={<CarPage />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
