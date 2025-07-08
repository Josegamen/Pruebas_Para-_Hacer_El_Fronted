const upload = require("./FilesMulter");

const middlewaresFiles = upload.fields([
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

module.exports = middlewaresFiles;
