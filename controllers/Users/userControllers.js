const User = require("../../models/Users/User");
const bcrypt = require("bcryptjs");
const Contractor = require("../../models/Users/Contractor");
const Functionary = require("../../models/Users/Functionary");
const Contracto = require("../../models/Contracto/ContractManagement");

//Obtener todos los usuarios (ADMIN)

exports.getAllUsers = async (req, res) => {
  console.log("[CONTROLLER USER] Ejecutando getAllUsers");
  try {
    const users = await User.find().select("-password");

    const userAll = await Promise.all(
      users.map(async (user) => {
        let date = {};

        if (user.role === "funcionario") {
          const functionary = await Functionary.findOne({ user: user._id });
          if (functionary) {
            date.state = functionary.state;
          }
        }

        if (user.role === "contratista") {
          const contract = await Contractor.findOne({
            user: user._id,
          }).populate("contract");
          if (contract) {
            date.state = contract.state;
            date.contract = contract.contract;
          }
        }

        return {
          ...user.toObject(),
          ...date,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: userAll,
    });
  } catch (error) {
    console.log("[CONTROLLER USER] Error en getAllUsers", error.message);
    return res.status(500).json({
      success: false,
      message: "Error al obtener usuarios",
      error: error.message,
    });
  }
};

// Obtener usuarios especifico
exports.getUserById = async (req, res) => {
  try {
    let date = {};
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    if (user.role === "funcionario") {
      const functionary = await Functionary.findOne({ user: user._id });
      if (functionary) {
        date.state = functionary.state;
      }
    }

    if (user.role === "contratista") {
      const contract = await Contractor.findOne({ user: user._id }).populate(
        "contract"
      );
      if (contract) {
        date.state = contract.state;
        date.contract = contract.contract;
      }
    }

    res.status(200).json({
      success: true,
      date: { ...user.toObject(), ...date },
    });
  } catch (error) {
    console.log("[CONTROLLER USER] Error en getAllUsers", error.messagge);
    res.status(500).json({
      success: true,
      message: "Error al obtener usuario",
      error: error.message,
    });
  }
};

// CREAR EL USUARIO

exports.createUser = async (req, res) => {
  try {
    // Constantes para almacenar el valor
    // Validar los datos personales
    const {
      name,
      lastname,
      idcard,
      telephone,
      email,
      password,
      role,
      state,
      contractId,
      post,
    } = req.body;

    if (
      !name ||
      !lastname ||
      !idcard ||
      !telephone ||
      !email ||
      !password ||
      !role ||
      !state ||
      !post
    ) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios",
      });
    }

    if(password.length < 8){
      return res.status(400).json({
        success:false,
        message:'La contraseña tiene que ser mayor a 8 caracteres'
      })
    }

    if (role !== "contratista" && role !== "funcionario" && role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Rol no existente",
      });
    }

    if (role === "contratista" && !contractId) {
      return res.status(400).json({
        success: false,
        message: "Debe proporcionar un contrato para el rol contratista",
      });
    }

    // Crear el usuario
    const user = new User({
      name,
      lastname,
      idcard,
      telephone,
      email,
      password,
      role,
    });

    const savedUser = await user.save();

    if (savedUser.role == "admin") {
      console.log("[COMTROLLER USER] Usuario creado", savedUser._id);
      return res.status(200).json({
        success: true,
        message: "Usuario creado exitosamente",
        data: {
          name: savedUser.name,
          lastname: savedUser.lastname,
          idcard: savedUser.idcard,
          telephone: savedUser.telephone,
          email: savedUser.email,
          role: savedUser.role,
          state: savedUser.state,
          _id: savedUser._id,
          __v: savedUser.__v,
        },
      });
    }

    // Mesaje para verificar el usuario
    console.log("[CONTROLLER USER] Usuario creado:", savedUser._id);

    // Crear el usuario depediendo el rol
    // Funcionarios
    if (role == "funcionario") {
      const functionary = new Functionary({
        post,
        state,
        user: savedUser._id,
      });
      // Mesaje para verificar el usuario
      const savedFuncionary = await functionary.save();
      console.log(
        "[CONTROLLER USER] Rol funcionario asignado a usuario:",
        savedFuncionary._id
      );

      // Consults completa
      const fullFunctionary = await Functionary.findById(
        savedFuncionary._id
      ).populate({ path: "user", select: "-password" });
      return res.status(201).json({
        success: true,
        message: "Usuario asigando a el rol funcionario exitosamente",
        data: fullFunctionary,
      });
    }

    // Contratista
    else if (role == "contratista") {
      const contractor = new Contractor({
        post,
        state,
        user: savedUser._id,
        contract: contractId,
      });
      console.log(
        "[CONTROLLER USER] Asigando el Rol a el usuario creado",
        contractor.length
      );
      // Guarda en la base de datos el usuario contratista
      const saveContractor = await contractor.save();

      return res.status(201).json({
        success: true,
        message:
          "Usuario asigando a el rol contratista con el contrato exitosamente",
        data: saveContractor,
      });
    }
  } catch (error) {
    console.log("[CONTROLLLERS USER] Erro la crear un usuario", error.message);
    res.status(500).json({
      success: false,
      message: "Error al crear usuario",
      error: error.message,
    });
  }
};

// Actualizar el usuario
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select("-password");

    //  Si no existe el usuario mandar mensaje
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Modificar el estado del usuario
    let state;
    if ("state" in req.body) {
      if (updatedUser.role === "funcionario") {
        const functionary = await Functionary.findOne({
          user: updatedUser._id,
        }).select("state");
        if (functionary) {
          functionary.state = req.body.state;
          await functionary.save();
          state = functionary.state;
        }
      }

      if (updatedUser.role === "contratista") {
        const contractor = await Contractor.findOne({ user: updatedUser._id });
        if (contractor) {
          contractor.state = req.body.state;
          await contractor.save();
          state = contractor.state;
        }
      }
    }
    let mesaje = state || "No hay en el estado ";

    console.log(req.body.contractId);
     if ("contractId" in req.body && updatedUser.role === "contratista"){
      // Verificar contrado
      try{
        const verifyContract = await Contracto.findById(req.body.contractId);
        if(!verifyContract){
          return res.status(404).json({
            success:false,
            message:'Contrato no existe'
          })
        }

      }catch(error){
        console.log(
          "[CONTROLLERS USER] Error al encontrar un contrato",
          error
        );

      }
    }

    // Cambiar el contrato de un contratista
    if ("contractId" in req.body && updatedUser.role === "contratista") {
      try {
        const contractId = await Contractor.findOne({ user: updatedUser._id });

        if (contractId) {
          contractId.contract = req.body.contractId;
          await contractId.save();
          console.log(
            "[CONTROLLERS USER] Se cambio el contrato para el usuario "
          );
        }
      } catch (error) {
        console.log(
          "[CONTROLLERS USER] Erro al cambiar el contrato de un contratista",
          error
        );
      }
    }

    // Cambiar la contraseña del usuario
    if ("password" in req.body) {
      if(req.body.password < 8){
        return res.status(400).json({
          success:false,
          message:'La contraseña tiene que ser mayor a 8 caracteres'
        })
      }
      updatedUser.password = req.body.password;
      await updatedUser.save();
    }

    return res.status(200).json({
      success: true,
      message: "Usuario actualizado exitosamente",
      data: { ...updatedUser.toObject(), mesaje },
    });
  } catch (error) {
    // Manejar errores
    if (error.code === 11000) {
      const campo = Object.keys(error.keyValue);
      const valor = error.keyValue[campo];
      return res.status(400).json({
        success: false,
        message: `Ya existe un ${campo} con : ${valor} `,
      });
    }

    console.log("[CONTROLLLERS USER] Erro al actualizar el usuario", error);

    return res.status(500).json({
      success: false,
      message: "Erro al actualizar el usuario",
      error: error.message,
    });
  }
};

// Eliminar usuario
exports.deleteUser = async (req, res) => {
  try {
    console.log("[CONTROLLER] Ejecutando deleteUser para ID", req.params.id);
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    // El Id donde el usuario coincida con funcionario
    if (!deletedUser) {
      console.log("[CONTROLLER USER] Usuario no encontrador para eliminar");
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Contratista
    if (deletedUser.role === "contratista") {
      try {
        const deletedContract = await Contractor.findOneAndDelete({
          user: deletedUser._id,
        });
        if (deletedContract) {
          console.log(
            "[CONTROLLER USER] Se elimino el contratista asociado al usuario",
            deletedContract._id
          );
        }
      } catch (error) {
        console.log(
          "[CONTROLLER USER] Error al eliminar el contratista asociado al usuario",
          error
        );
      }
    }

    // Funcionarios
    if (deletedUser.role === "funcionario") {
      try {
        const deletedFuncionary = await Functionary.findOneAndDelete({
          user: deletedUser._id,
        });
        if (deletedFuncionary) {
          console.log(
            "[CONTROLLER USER] Se elimino el contratista asociado al usuario",
            deletedFuncionary._id
          );
        }
      } catch (error) {
        console.log(
          "[CONTROLLER USER] Error al eliminar el contratista asociado al usuario",
          error
        );
      }
    }

    console.log("[CONTROLLER] usuario eliminar", deletedUser._id);

    return res.status(200).json({
      success: true,
      message: "Usuario eliminado correctamente",
    });
  } catch (error) {
    console.error("[CONTROLLER Error al eliminar usuario]", error.message); //Diagnostico
    return res.status(500).json({
      success: true,
      message: "Error al eliminar el usuario",
      error: error.message,
    });
  }
};
