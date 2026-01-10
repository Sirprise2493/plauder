import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

function SignUpPage({ apiUrl, currentUser, onSignUpSuccess }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
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
      const response = await fetch(`${apiUrl}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          user: {
            email,
            password,
            password_confirmation: passwordConfirmation,
          },
        }),
      })

      if (response.status === 422) {
        const data = await response.json()
        setError(data.errors?.join(", ") || "Registrierung fehlgeschlagen.")
        return
      }

      if (!response.ok) {
        setError("Registrierung fehlgeschlagen.")
        return
      }

      const data = await response.json()
      onSignUpSuccess(data)
    } catch {
      setError("Es ist ein Fehler aufgetreten.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "2rem auto" }}>
      <h1>Plauder – Registrieren</h1>
      <h2>Schnell mit ChatGPT generiert sollten es selbst machen und styling alles in CSS files reintun</h2>
      <p>
        Schon einen Account? <Link to="/">Login</Link>
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

        <div style={{ marginBottom: "1rem" }}>
          <label>
            Passwort wiederholen<br />
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Registriere…" : "Account erstellen"}
        </button>
      </form>

      {error && <p style={{ marginTop: "1rem", color: "red" }}>{error}</p>}
    </div>
  )
}

export default SignUpPage
