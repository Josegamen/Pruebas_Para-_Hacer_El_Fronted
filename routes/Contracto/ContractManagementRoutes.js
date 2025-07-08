const express = require("express");
const router = express.Router();
const ContactManagement = require("../../controllers/Contracto/ContractManagementController");
const { verifyToken } = require("../../middlewares/Token/authJwt");
const { checkRole } = require("../../middlewares/Role/role");

// Get
// Todos los contratos
router.get(
  "/",
  verifyToken,
  checkRole("admin", "funcionario"),
  ContactManagement.getAllContract
);

// Crear un contrato
router.post(
  "/",
  verifyToken,
  checkRole("admin", "funcionario"),
  ContactManagement.creatContract
);

// Contrato espesifico
router.get(
  "/:id",
  verifyToken,
  checkRole("admin", "funcionario", "contratista"),
  ContactManagement.getContractById
);

// Contrato actualizar
router.put(
  "/:id",
  verifyToken,
  checkRole("admin", "funcionario"),
  ContactManagement.updateContract
);

// Contrato eliminar
router.delete(
  "/:id",
  verifyToken,
  checkRole("admin"),
  ContactManagement.deleteContract
);

module.exports = router;
