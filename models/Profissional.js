const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');
const { normalizarEmail } = require('../utils/validacao');

class Profissional extends Model {
  // Visão completa (sem a senha). Uso restrito ao administrador e ao próprio profissional.
  static async getAll() {
    const profissionais = await Profissional.findAll({
      order: [['nome', 'ASC']]
    });

    return profissionais.map((profissional) => profissional.toJSON());
  }

  // Visão pública: o que o paciente precisa para escolher um profissional.
  // Nunca inclui CPF, e-mail, telefone ou senha.
  static async getPublicos() {
    const profissionais = await Profissional.unscoped().findAll({
      attributes: [
        'id',
        'nome',
        'conselho',
        'registro_conselho',
        'uf_conselho',
        'id_clinica',
        'id_especialidade',
        'status'
      ],
      where: { status: true },
      order: [['nome', 'ASC']]
    });

    return profissionais.map((profissional) => profissional.toJSON());
  }

  static async findById(id) {
    const profissional = await Profissional.findByPk(id);
    return profissional ? profissional.toJSON() : null;
  }

  // Único ponto que lê senha_hash: o login do profissional.
  static async findByEmail(email) {
    return Profissional.unscoped().findOne({
      where: sequelize.where(
        sequelize.fn('lower', sequelize.col('email')),
        normalizarEmail(email)
      )
    });
  }

  static async createProfissional(dados) {
    const camposPermitidos = [
      'id_clinica',
      'id_especialidade',
      'nome',
      'cpf',
      'registro_conselho',
      'conselho',
      'uf_conselho',
      'telefone',
      'email',
      'senha_hash',
      'status'
    ];

    const dadosPermitidos = {};

    for (const campo of camposPermitidos) {
      if (dados[campo] !== undefined) {
        dadosPermitidos[campo] = dados[campo];
      }
    }

    const criado = await Profissional.create(dadosPermitidos);
    const { senha_hash, ...publico } = criado.toJSON();

    return publico;
  }

  // Edição feita pelo administrador. CPF não muda por aqui.
  static async updateProfissional(id, dados) {
    const profissional = await Profissional.findByPk(id);

    if (!profissional) return null;

    const camposPermitidos = [
      'id_clinica',
      'id_especialidade',
      'nome',
      'registro_conselho',
      'conselho',
      'uf_conselho',
      'telefone',
      'email',
      'status'
    ];

    const dadosPermitidos = {};

    for (const campo of camposPermitidos) {
      if (dados[campo] !== undefined) {
        dadosPermitidos[campo] = dados[campo];
      }
    }

    await profissional.update(dadosPermitidos);

    return profissional.toJSON();
  }

  // Edição feita pelo próprio profissional.
  static async updatePerfil(id, dados) {
    const profissional = await Profissional.findByPk(id);

    if (!profissional) return null;

    const dadosPermitidos = {};

    for (const campo of ['nome', 'telefone']) {
      if (dados[campo] !== undefined) {
        dadosPermitidos[campo] = dados[campo];
      }
    }

    await profissional.update(dadosPermitidos);

    return profissional.toJSON();
  }
}

Profissional.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    id_clinica: {
      type: DataTypes.UUID,
      allowNull: true
    },
    id_especialidade: {
      type: DataTypes.UUID,
      allowNull: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },
    cpf: {
      type: DataTypes.STRING(14),
      allowNull: false,
      validate: { is: /^\d{11}$/ }
    },
    registro_conselho: {
      type: DataTypes.STRING,
      allowNull: false
    },
    conselho: {
      type: DataTypes.STRING,
      allowNull: false
    },
    uf_conselho: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    telefone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true }
    },
    senha_hash: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    sequelize,
    modelName: 'Profissional',
    tableName: 'profissionais',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    defaultScope: { attributes: { exclude: ['senha_hash'] } }
  }
);

module.exports = Profissional;
