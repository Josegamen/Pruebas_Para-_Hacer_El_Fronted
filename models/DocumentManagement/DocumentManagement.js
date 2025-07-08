const { type } = require("express/lib/response");
const { default: mongoose } = require("mongoose");

const Document_Management = new mongoose.Schema({
  creation_date: {
    type: Date,
    required: [true, "Fecha de creacion requerida"],
  },
  retention_time: {
    type: String,
    required: [true, "Tiempo de retencio requerido"],
  },
  ip: {
    type: String,
    required: [true, "La ip es requerida"],
  },
  state: {
    type: String,
    required: [true, "El Estado es requerido"],
    enum: ["Activo", "Inactivo"],
    default: "Activo",
    
  },
  description: {
    type: String,
    required: [true, "La descripcion es requerida"],
  },
  version: {
    type: String,
    required: [true, "La version es requeridad"],
  },
  user_create: {
    type: String,
    required: [true, "El usuario de creacion es  requerido"],
  },
  user_edition: {
    type: String,
    required: [true, "El usuario de edicion es  requerido"],
  },
  user_contrac: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contractors",
    required: [true, "Usuario contratista es obligatorio"],
  },
  // Carta de radicacion de cuenta de cobro
  filing_letter: {
    type: String,
    required: [true, "Carta de radicacion es obligatoria"],
    unique: true,
  },
  // Certificado de cumplimiento
  certificate_of_compliance: {
    type: String,
    required: [true, "Certificado de cumplimiento requerido"],
    unique: true,
  },

  // Ceritifcado de cumplimiento firmado
  signed_certificate_of_compliance: {
    type: String,
    required: [true, "Certificado de cumplimiento firmado requerido"],
    unique: true,
  },
  //Informe de activdad 
  activity_report: {
    type: String,
    required: [true, "Reporte de actividades requerido"],
    unique: true,
  },
  // Certificado de calidad tributaria
  tax_quality_certificate: {
    type: String,
    required: [true, "Certificado de calidad tributaria requerida"],
    unique: true,
  },
  // social security
  social_security: {
    type: String,
    required: [true, "Copia de plantilla de pago requerida"],
    unique: true,
  },
  rut: {
    type: String,
    required: [true, "El rut es requerido "],
    unique: true,
  },
  rit: {
    type: String,
    required: [true, "El rit es requerido"],
    unique: true,
  },
  // Capacitaciones
  Trainings: {
    type: String,
    required: [true, "capacitaciones es requerido"],
    unique: true,
  },
  // Acta de inicio
  initiation_record: {
    type: String,
    required: [true, "Acta de inicio requerido"],
    unique: true,
  },
  // Certificacion de cuenta
  account_certification: {
    type: String,
    required: [true, "Certificacion de cuenta requeridad"],
    unique: true,
  },
});

module.exports = mongoose.model("Document_Management", Document_Management);
