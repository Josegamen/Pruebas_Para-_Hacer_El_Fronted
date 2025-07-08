const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.params.user_contract;

    if (!userId) {
      return cb(new Error("Falta el ID del contratista"), null);
    }

    const dir = path.join(__dirname, `../../Files/${userId}`);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    // Solo permitir PDF
    if (extension !== ".pdf") {
      return cb(new Error("El archivo no es PDF"));
    }

    // Renombrar al nombre del campo del input + .pdf
    const newName = `${file.fieldname}${extension}`;
    cb(null, newName);
  }
});

const upload = multer({ storage });

module.exports = upload.fields([
  { name: "filing_letter", maxCount: 1 },
  { name: "certificate_of_compliance", maxCount: 1 },
  { name: "signed_certificate_of_compliance", maxCount: 1 },
  { name: "activity_report", maxCount: 1 },
  { name: "tax_quality_certificate", maxCount: 1 },
  { name: "social_security", maxCount: 1 },
  { name: "rut", maxCount: 1 },
  { name: "rit", maxCount: 1 },
  { name: "Trainings", maxCount: 1 },
  { name: "initiation_record", maxCount: 1 },
  { name: "account_certification", maxCount: 1 },
]);
