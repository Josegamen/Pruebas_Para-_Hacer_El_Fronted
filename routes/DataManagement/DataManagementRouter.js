const express = require("express");
const DataManagementControllers = require("../../controllers/Data_management/DataManagementControllers");
const router = express.Router();
const { verifyToken } = require("../../middlewares/Token/authJwt");
const { checkRole } = require("../../middlewares/Role/role");

// ✅ GET: Obtener todos los documentos
router.get(
  "/",
  verifyToken,
  checkRole("admin", "funcionario"),
  DataManagementControllers.getData
);

// Obtener una comparacion por id
router.get(
  "/:id",
  verifyToken,
  checkRole("admin", "funcionario", "contratista"),
  DataManagementControllers.getDataById
);

// ✅ POST: Guardar documento desde Python u otra fuente
router.post("/Saved", DataManagementControllers.SavedData);

// Llamar para comenzar la creacion
router.post(
  "/",
  verifyToken,
  checkRole("admin", "funcionario", "contratista"),
  DataManagementControllers.CreateData
);

// ✅ DELETE: Eliminar documento (si lo usas desde el frontend)
router.delete("/:id",verifyToken,
  checkRole("admin"), DataManagementControllers.DeleteData);

module.exports = router;
