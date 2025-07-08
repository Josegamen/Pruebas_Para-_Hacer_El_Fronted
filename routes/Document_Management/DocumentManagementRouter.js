const express = require("express");
const router = express.Router();
const Document_Management_Controller = require("../../controllers/Document_Management/DocumentManagementController");
const middlewaresFiles = require("../../middlewares/DocumentManagementController/Files");
const {
  VerifyUserContract,
} = require("../../middlewares/DocumentManagementController/verifyUserContract");

const { verifyToken } = require("../../middlewares/Token/authJwt");
const { checkRole } = require("../../middlewares/Role/role");

const updateFiles = require("../../middlewares/DocumentManagementController/FilesMulterUpdate");

// Ver todas las gestione documental
router.get(
  "/",
  verifyToken,
  checkRole("admin", "funcionario"),
  Document_Management_Controller.getAllDocumentManagement
);

// Gestion documental por id
router.get(
  "/:id",
  verifyToken,
  checkRole("admin", "funcionario", "contratista"),
  Document_Management_Controller.getAllDocumentManagementById
);

// Crear la gestion documental
router.post(
  "/:user_contract",
  verifyToken,
  checkRole("admin", "funcionario", "contratista"),
  VerifyUserContract,
  middlewaresFiles,
  Document_Management_Controller.CreateDocument_Management
);

router.put(
  "/:id/:user_contract",
  verifyToken,
  checkRole("admin", "funcionario", "contratista"),
  VerifyUserContract,
  updateFiles,
  Document_Management_Controller.UpdateDocument_Management
);

router.delete(
  "/:id/:user_contract",
   verifyToken,
  checkRole("admin", "funcionario"),
  Document_Management_Controller.DeleteDocument_Management
);

module.exports = router;
