import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomeAuth from "./pages/HomeAuth";
import Contacts from "./pages/Contacts";
import RequireAuth from "./components/RequireAuth";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeAuth />} />

        <Route
          path="/contacts"
          element={
            <RequireAuth>
              <Contacts />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
