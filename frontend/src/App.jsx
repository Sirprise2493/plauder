import { useEffect, useState } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import ProfilePage from "./pages/ProfilePage"
import SignUpPage from "./pages/SignUpPage"

const API_URL = "http://localhost:3000"

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const response = await fetch(`${API_URL}/api/current_user`, {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          setCurrentUser(data)
        } else {
          setCurrentUser(null)
        }
      } catch {
        setCurrentUser(null)
      } finally {
        setLoadingUser(false)
      }
    }

    fetchCurrentUser()
  }, [])

  if (loadingUser) return <p style={{ padding: "1rem" }}>Lade Benutzer…</p>

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LoginPage
            apiUrl={API_URL}
            currentUser={currentUser}
            onLoginSuccess={(user) => {
              setCurrentUser(user)
              navigate("/profil")
            }}
          />
        }
      />

      <Route
        path="/signup"
        element={
          <SignUpPage
            apiUrl={API_URL}
            currentUser={currentUser}
            onSignUpSuccess={(user) => {
              setCurrentUser(user)
              navigate("/profil")
            }}
          />
        }
      />

      <Route
        path="/profil"
        element={
          <ProfilePage
            apiUrl={API_URL}
            currentUser={currentUser}
            onLogout={() => {
              setCurrentUser(null)
              navigate("/")
            }}
          />
        }
      />
    </Routes>
  )
}

export default App
