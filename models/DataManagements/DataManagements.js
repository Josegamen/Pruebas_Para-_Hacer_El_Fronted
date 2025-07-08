const mongoose = require('mongoose');

// Esquema flexible con campo obligatorio y referencias
const DataManagementsSchema = new mongoose.Schema({
  document_management: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document_Management',
  }
}, {
  strict: false,      // 🔓 Acepta campos no definidos
  timestamps: true    // 🕒 createdAt y updatedAt
});

module.exports = mongoose.model('DataManagements', DataManagementsSchema);
