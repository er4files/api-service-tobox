const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.post("/api/kirimdata", async (req, res) => {
  try {
    console.log("Data diterima:", req.body);

    const {
      acStatus,
      companyId,
      date,
      humidity,
      room,
      roomId,
      temperature,
      timestamp,  // This should be passed as a string
      toboxId
    } = req.body;

    // Validasi data
    if (!acStatus || !companyId || !date || !humidity || !room || !roomId || !temperature || !timestamp || !toboxId) {
      return res.status(400).json({
        success: false,
        message: "Semua field harus diisi"
      });
    }

    // Convert timestamp string to Date object
    const formattedTimestamp = new Date(timestamp);

    // Check if the date is valid
    if (isNaN(formattedTimestamp.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Timestamp tidak valid"
      });
    }

    // Kirim data ke Firestore
    await db.collection("history").add({
      acStatus,
      companyId,
      date,
      humidity,
      room,
      roomId,
      temperature: Number(temperature),
      timestamp: formattedTimestamp,  // Use the Date object
      toboxId
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
