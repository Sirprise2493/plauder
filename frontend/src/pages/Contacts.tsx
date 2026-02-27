import { useAuth } from "../hooks/useAuth";

export default function Contacts() {
  const { user, signOut } = useAuth();

  return (
    <div style={{ padding: 24 }}>
      <h1>Kontakte</h1>
      <p>
        Eingeloggt als: <strong>{user?.username}</strong> ({user?.email})
      </p>

      <button onClick={() => void signOut()}>Logout</button>
    </div>
  );
}
