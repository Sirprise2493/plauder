import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import UserInfoBox from "../components/UserInfoBox"

function ProfilePage({ apiUrl, currentUser, onLogout }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser) navigate("/")
  }, [currentUser, navigate])

  async function handleLogout() {
    try {
      await fetch(`${apiUrl}/users/sign_out`, {
        method: "DELETE",
        credentials: "include",
      })
    } finally {
      onLogout()
    }
  }

  if (!currentUser) return null

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto" }}>
      <h1>Dein Profil</h1>
      <h2>Schnell mit ChatGPT generiert sollten es selbst machen und styling alles in CSS files reintun</h2>
      <UserInfoBox user={currentUser} />
      <button style={{ marginTop: "1.5rem" }} onClick={handleLogout}>
        Ausloggen
      </button>
    </div>
  )
}

export default ProfilePage
