const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');

class Clinica extends Model {
  static async getAll() {
    const clinicas = await Clinica.findAll({ order: [['nome', 'ASC']] });

    return clinicas.map((clinica) => clinica.toJSON());
  }

  // O paciente só enxerga clínicas ativas.
  static async getAtivas() {
    const clinicas = await Clinica.findAll({
      where: { status: true },
      order: [['nome', 'ASC']]
    });

    return clinicas.map((clinica) => clinica.toJSON());
  }

  static async findById(id) {
    const clinica = await Clinica.findByPk(id);

    return clinica ? clinica.toJSON() : undefined;
  }

  static async createClinica(dados) {
    const clinica = await Clinica.create(Clinica.filtrarCampos(dados));

    return clinica.toJSON();
  }

  static async updateClinica(id, dados) {
    const clinica = await Clinica.findByPk(id);

    if (!clinica) {
      return undefined;
    }

    await clinica.update(Clinica.filtrarCampos(dados));

    return clinica.toJSON();
  }

  static async deleteClinica(id) {
    const clinica = await Clinica.findByPk(id);

    if (!clinica) {
      return;
    }

    await clinica.destroy();
  }

  static filtrarCampos(dados) {
    const camposPermitidos = [
      'nome',
      'cnpj',
      'endereco',
      'telefone',
      'email',
      'horario_funcionamento',
      'status'
    ];

    const permitidos = {};

    for (const campo of camposPermitidos) {
      if (dados[campo] !== undefined) {
        permitidos[campo] = dados[campo];
      }
    }

    return permitidos;
  }
}

Clinica.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },

    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },

    cnpj: {
      type: DataTypes.STRING(20),
      allowNull: false
    },

    endereco: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    telefone: {
      type: DataTypes.STRING
    },

    email: {
      type: DataTypes.STRING,
      validate: { isEmail: true }
    },

    horario_funcionamento: {
      type: DataTypes.STRING
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    sequelize,
    modelName: 'Clinica',
    tableName: 'clinicas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = Clinica;
