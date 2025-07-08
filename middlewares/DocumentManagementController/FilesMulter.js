const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Contractors = require("../../models/Contracto/ContractManagement");
const storage = multer.diskStorage({
  destination: (req, file, cd) => {
    const userId = req.params.user_contract;
    if (!userId) {
      return cb(new Error("Falta el ID del contratista"), null);
    }
    // Verificar si vienen los campos completos
    const nameFiles = [
      "filing_letter",
      "certificate_of_compliance",
      "signed_certificate_of_compliance",
      "activity_report",
      "tax_quality_certificate",
      "social_security",
      "rut",
      "rit",
      "Trainings",
      "initiation_record",
      "account_certification",
    ];
    if (!nameFiles.includes(file.fieldname)) {
      return cd(new Error("Faltan archivos"));
    }
    // Verificar crear el directorio absoluta
    const directorio = path.join(__dirname, `../../Files/${userId}`);
    try {
      //Crear la carpeta
      fs.mkdirSync(directorio, { recursive: true });
    } catch (error) {
      console.log("Error al crear la carpeta", error);
    }
    // Manda los archivos al directorio
    cd(null, directorio);
  },
  filename: (req, file, cd) => {
    // Renombra los archivos al original
    const extension = path.extname(file.originalname).toLocaleLowerCase();
    if (extension !== ".pdf") {
      return cd(new Error("El archivo no es PDF"));
    }
    const newName = `${file.fieldname}${extension}`;
    cd(null, newName);
  },
});

const upload = multer({ storage });

module.exports = upload;
