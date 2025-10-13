const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistorialSuspension = sequelize.define('HistorialSuspension', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fecha_suspension: {
        type: DataTypes.DATE,
        allowNull: false
    },
    motivo: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    observaciones: {
        type: DataTypes.TEXT
    },
    suspendido_por: {
        type: DataTypes.STRING(100)
    },
    fecha_reactivacion: {
        type: DataTypes.DATE
    },
    reactivado_por: {
        type: DataTypes.STRING(100)
    }
}, {
    tableName: 'historial_suspensiones',
    timestamps: true,
    underscored: true
});

module.exports = HistorialSuspension;