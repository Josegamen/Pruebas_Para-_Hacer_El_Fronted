const Document_Management = require("../../models/DocumentManagement/DocumentManagement");
const Contractor = require("../../models/Users/Contractor");
const User = require("../../models/Users/Functionary");
const fs = require("fs");
const path = require("path");

exports.getAllDocumentManagementById = async (req, res) => {
  try {
    const documentget = await Document_Management.findById(req.params.id);

    if (!documentget) {
      return res.status(404).json({
        success: false,
        message: "Gestion Documental no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Gestion Documental encontrada",
      data: documentget,
    });
  } catch (error) {
    console.log(
      "[DocumentManagementController] Erro al encontrar una gestion documental",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Error al encontrar la Gestion Documental",
      error: error.message,
    });
  }
};

// Todos los documentos
exports.getAllDocumentManagement = async (req, res) => {
  try {
    const Documents = await Document_Management.find();

    return res.status(200).json({
      success: true,
      message: "Cargado con exito los documentos",
      data: Documents,
    });
  } catch (error) {
    console.log("[Document_Management] Error al cargar los documentos", error);
    return res.status(500).json({
      success: false,
      message: "Error al cargar los documentos",
      error: error.messages,
    });
  }
};

exports.CreateDocument_Management = async (req, res) => {
  console.log(req.files);
  try {
    // Archivos
    const {
      filing_letter,
      certificate_of_compliance,
      signed_certificate_of_compliance,
      activity_report,
      tax_quality_certificate,
      social_security,
      rut,
      rit,
      Trainings,
      initiation_record,
      account_certification,
    } = req.files;
    // verificar que venga
    if (
      !filing_letter ||
      !certificate_of_compliance ||
      !signed_certificate_of_compliance ||
      !activity_report ||
      !tax_quality_certificate ||
      !social_security ||
      !rut ||
      !rit ||
      !Trainings ||
      !initiation_record ||
      !account_certification
    ) {
      res.status(400).json({
        success: false,
        message: "Le falta archivos",
      });
    }
    Base_Url = "C:\\Users\\JoseD\\OneDrive\\Documentos\\ADCU_WEB_BACKEND";
    // Carta de radicacion de cuenta de cobro
    const File1 = path.relative(Base_Url, filing_letter?.[0]?.path);
    // Certificado de cumplimiento
    const File2 = path.relative(Base_Url, certificate_of_compliance?.[0]?.path);
    // Ceritifcado de cumplimiento firmado
    const File3 = path.relative(
      Base_Url,
      signed_certificate_of_compliance?.[0]?.path
    );
    // Reporte de actividad
    const File4 = path.relative(
      Base_Url,
      activity_report?.[0]?.path
    );
    // Certificado de calidad tributaria
    const File5 = path.relative(
      Base_Url,
      tax_quality_certificate?.[0]?.path
    );
    // social security
    const File6 = path.relative(
      Base_Url,
      social_security?.[0]?.path
    );
    //rut
    const File7 = path.relative(
      Base_Url,
      rut?.[0]?.path
    );
    // rit
    const File8 = path.relative(
      Base_Url,
      rit?.[0]?.path
    );
    // Capacitaciones
    const File9 = path.relative(
      Base_Url,
      Trainings?.[0]?.path
    );
    // Acta de inicio
    const File10 = path.relative(
      Base_Url,
      initiation_record?.[0]?.path
    );
    // Certificacion de cuenta
    const File11 = path.relative(
      Base_Url,
      account_certification?.[0]?.path
    );

    // console.log("ola" + archivoNew);
    // Fecha de creacion
    const creation_date = new Date();

    // Lo que viene del usuario
    const {
      description,
      ip,
      retention_time,
      state,
      version,
    } = req.body;
    console.log(description);

    // Usuario contratista
    const user = req.params.user_contract;
    const user_contrac = await Contractor.findOne({user:user});
 


    if (
      !description ||
      !ip ||
      !retention_time ||
      !state ||
      !version ||
      !user_contrac

    ) {
      return res.status(400).json({
        success: false,
        message: "Falta datos",
      });
    }



    const newDocumentManagement = new Document_Management({
      creation_date,
      retention_time:'20 añops',
      ip:req.ip,
      state :"Activo",
      description,
      version,
      user_create :user,
      user_edition: "No se ha editado",
      user_contrac,
      filing_letter: File1,
      certificate_of_compliance: File2,
      signed_certificate_of_compliance: File3,
      activity_report: File4,
      tax_quality_certificate: File5,
      social_security: File6,
      rut: File7,
      rit: File8,
      Trainings: File9,
      initiation_record: File10,
      account_certification: File11,
    });

    const Document_ManagementSaved = await newDocumentManagement.save();
    return res.status(200).json({
      success: true,
      message: "Documentos cargados exitosamente",
      data: Document_ManagementSaved,
    });
  } catch (error) {
    if (error.code == 11000) {
      return res.status(400).json({
        success: false,
        message: "No puede subir 2 veces los mismo archivos",
      });
    }
    console.log(
      "[DocumentManagentController] Error al crear un documento",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Error al cargar los documentos",
      error: error.message,
    });
  }
};

exports.UpdateDocument_Management = async (req, res) => {
  try {
    const documentId = req.params.id;
    const document = await Document_Management.findById(documentId);
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Documento no encontrado" });
    }

    const userId = req.params.user_contract;
    const newFiles = req.files;
    const updatedFields = {};

    for (const field in newFiles) {
      const newFilePath = newFiles[field][0].path;
      // Guardar el nuevo path relativo
      const relativePath = path.relative(
        path.resolve(__dirname, "../../"),
        newFilePath
      );
      updatedFields[field] = relativePath;
    }

    updatedFields.user_edition = "usuario que edita"; // Aquí puedes poner el nombre real si lo tienes

    const updatedDoc = await Document_Management.findByIdAndUpdate(
      documentId,
      updatedFields,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Documento actualizado correctamente",
      data: updatedDoc,
    });
  } catch (error) {
    console.error("[UpdateDocument_Management] Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el documento",
      error: error.message,
    });
  }
};

exports.DeleteDocument_Management = async (req, res) => {
  const { id, user_contract } = req.params;

  try {
    // 1. Buscar y eliminar el documento en la base de datos
    const deletedDoc = await Document_Management.findByIdAndDelete(id);

    if (!deletedDoc) {
      return res.status(404).json({
        success: false,
        message: "No se encontró el documento con ese ID",
      });
    }

    // 2. Eliminar la carpeta del usuario
    const folderPath = path.join(__dirname, `../../Files/${user_contract}`);

    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true }); // elimina la carpeta y todo su contenido
    }

    return res.status(200).json({
      success: true,
      message: "Documento y carpeta eliminados correctamente",
    });
  } catch (error) {
    console.error("[DeleteDocument_Management] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar el documento",
      error: error.message,
    });
  }
};
