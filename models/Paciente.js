const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');
const { normalizarEmail } = require('../utils/validacao');

class Paciente extends Model {
  // Remove a senha criptografada de qualquer resposta.
  static dadosPublicos(paciente) {
    if (!paciente) return null;

    const dados = paciente.toJSON();
    delete dados.senha_hash;

    return dados;
  }

  // Usa o escopo padrão, que já esconde senha_hash.
  static async findById(id) {
    const paciente = await Paciente.findByPk(id);
    return Paciente.dadosPublicos(paciente);
  }

  // Único ponto que lê senha_hash: o login precisa dela para comparar.
  static async findByEmail(email) {
    return Paciente.unscoped().findOne({
      where: sequelize.where(
        sequelize.fn('lower', sequelize.col('email')),
        normalizarEmail(email)
      )
    });
  }

  static async createPaciente(dados) {
    const camposPermitidos = [
      'nome_completo',
      'cpf',
      'data_nascimento',
      'telefone',
      'email',
      'senha_hash',
      'contato_emergencia_nome',
      'contato_emergencia_telefone',
      'contato_emergencia_email',
      'relacao_contato'
    ];

    const dadosPermitidos = {};

    for (const campo of camposPermitidos) {
      if (dados[campo] !== undefined) {
        dadosPermitidos[campo] = dados[campo];
      }
    }

    const paciente = await Paciente.create(dadosPermitidos);
    return Paciente.dadosPublicos(paciente);
  }

  // CPF e e-mail não entram aqui: são a identidade da conta.
  static async updatePaciente(id, dados) {
    const paciente = await Paciente.findByPk(id);

    if (!paciente) return null;

    const camposPermitidos = [
      'nome_completo',
      'data_nascimento',
      'telefone',
      'contato_emergencia_nome',
      'contato_emergencia_telefone',
      'contato_emergencia_email',
      'relacao_contato'
    ];

    const dadosPermitidos = {};

    for (const campo of camposPermitidos) {
      if (dados[campo] !== undefined) {
        dadosPermitidos[campo] = dados[campo];
      }
    }

    await paciente.update(dadosPermitidos);

    return Paciente.dadosPublicos(paciente);
  }
}

Paciente.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    nome_completo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },
    cpf: {
      type: DataTypes.STRING(14),
      allowNull: false,
      validate: { is: /^\d{11}$/ }
    },
    data_nascimento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Informe a data de nascimento' },
        isDate: { msg: 'Data de nascimento inválida' }
      }
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
      allowNull: false
    },
    contato_emergencia_nome: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contato_emergencia_telefone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contato_emergencia_email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: true }
    },
    relacao_contato: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Paciente',
    tableName: 'pacientes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    defaultScope: { attributes: { exclude: ['senha_hash'] } }
  }
);

module.exports = Paciente;
