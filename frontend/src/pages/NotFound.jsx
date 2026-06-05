import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>404 — Page Not Found</h2>
      <button onClick={() => navigate("/")}>Go Home</button>
    </div>
  );
};

export default NotFound;