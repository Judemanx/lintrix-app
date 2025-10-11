import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor backend funcionando 🚀");
});

app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
