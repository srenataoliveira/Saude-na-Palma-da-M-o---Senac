const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');

class Especialidade extends Model {
  static async getAll() {
    const especialidades = await Especialidade.findAll({
      order: [['nome', 'ASC']]
    });

    return especialidades.map((especialidade) => especialidade.toJSON());
  }

  // O paciente só enxerga especialidades ativas.
  static async getAtivas() {
    const especialidades = await Especialidade.findAll({
      where: { status: true },
      order: [['nome', 'ASC']]
    });

    return especialidades.map((especialidade) => especialidade.toJSON());
  }

  static async findById(id) {
    const especialidade = await Especialidade.findByPk(id);

    return especialidade ? especialidade.toJSON() : undefined;
  }

  static async createEspecialidade(dados) {
    const especialidade = await Especialidade.create(
      Especialidade.filtrarCampos(dados)
    );

    return especialidade.toJSON();
  }

  static async updateEspecialidade(id, dados) {
    const especialidade = await Especialidade.findByPk(id);

    if (!especialidade) {
      return undefined;
    }

    await especialidade.update(Especialidade.filtrarCampos(dados));

    return especialidade.toJSON();
  }

  static async deleteEspecialidade(id) {
    const especialidade = await Especialidade.findByPk(id);

    if (!especialidade) {
      return;
    }

    await especialidade.destroy();
  }

  static filtrarCampos(dados) {
    const permitidos = {};

    for (const campo of ['nome', 'descricao', 'status']) {
      if (dados[campo] !== undefined) {
        permitidos[campo] = dados[campo];
      }
    }

    return permitidos;
  }
}

Especialidade.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },

    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: true }
    },

    descricao: {
      type: DataTypes.TEXT
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    sequelize,
    modelName: 'Especialidade',
    tableName: 'especialidades',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = Especialidade;
