import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomeAuth from "./pages/HomeAuth";
import Contacts from "./pages/Contacts";
import ChatDetail from "./pages/ChatDetail";
import RequireAuth from "./components/RequireAuth";
import Uebungen from "./uebungen/Uebungen";

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

        <Route
          path="/chats/:id"
          element={
            <RequireAuth>
              <ChatDetail />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />

        <Route
          path="/uebungen"
          element={ <Uebungen /> }
        />

      </Routes>
    </BrowserRouter>
  );
}
