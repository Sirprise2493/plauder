function UserInfoBox({ user }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 6, padding: "1rem" }}>
      <h2>Schnell mit ChatGPT generiert sollten es selbst machen und styling alles in CSS files reintun</h2>
      <p style={{ margin: 0 }}>
        <strong>ID:</strong> {user.id}
        <br />
        <strong>E-Mail:</strong> {user.email}
      </p>
    </div>
  )
}

export default UserInfoBox
