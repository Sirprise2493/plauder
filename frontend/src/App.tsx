import { useEffect, useState } from "react";

type ApiResponse = {
  message: string;
};

function App() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/hello")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: ApiResponse) => setData(json))
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>React + TypeScript + Rails + PostgreSQL</h1>
      {error && <p>Fehler: {error}</p>}
      {data ? <p>API sagt: {data.message}</p> : <p>Lade...</p>}
    </main>
  );
}

export default App;
