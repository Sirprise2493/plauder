import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

function LoginPage({ apiUrl, currentUser, onLoginSuccess }) {
  const [email, setEmail] = useState("ash@example.com")
  const [password, setPassword] = useState("geheimespasswort")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUser) navigate("/profil")
  }, [currentUser, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch(`${apiUrl}/users/sign_in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user: { email, password } }),
      })

      if (!response.ok) {
        setError("Login fehlgeschlagen. Bitte E-Mail/Passwort prüfen.")
        return
      }

      const data = await response.json()
      onLoginSuccess(data)
    } catch {
      setError("Es ist ein Fehler aufgetreten.")
    } finally {
      setLoading(false)
    }
  }

  return (

    <div style={{ maxWidth: 420, margin: "2rem auto" }}>
      <h1>Plauder – Login</h1>
      <h2>Schnell mit ChatGPT generiert sollten es selbst machen und styling alles in CSS files reintun</h2>
      <p>
        Noch keinen Account? <Link to="/signup">Registrieren</Link>
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            E-Mail<br />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>
            Passwort<br />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logge ein…" : "Einloggen"}
        </button>
      </form>

      {error && <p style={{ marginTop: "1rem", color: "red" }}>{error}</p>}
    </div>
  )
}

export default LoginPage
