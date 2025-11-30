const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Ganti path ini dengan path file serviceAccountKey.json kamu
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Endpoint untuk kirim data histori ke Firestore
app.post("/api/kirimdata", async (req, res) => {
  try {
    console.log("Data diterima:", req.body);

    const { acStatus, companyId, date, humidity, room, roomId, temperature, toboxId } = req.body;

    // Validasi input
    if (!acStatus || !companyId || !date || humidity === undefined || !room || !roomId || temperature === undefined || !toboxId) {
      return res.status(400).json({
        success: false,
        message: "Semua field harus diisi"
      });
    }

    // Kirim data ke Firestore
    await db.collection("history").add({
      acStatus: acStatus,
      companyId: companyId,
      date: date,
      humidity: humidity,
      room: room,
      roomId: roomId,
      temperature: temperature,
      toboxId: toboxId,
      timestamp: admin.firestore.FieldValue.serverTimestamp() // Menambahkan timestamp otomatis
    });

    return res.status(200).json({
      success: true,
      message: "Data histori berhasil dikirim ke Firestore"
    });
  } catch (error) {
    console.error("Error mengirim data:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Port default
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
