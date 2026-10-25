const { DataTypes, Model, Op } = require('sequelize');
const sequelize = require('../sequelize');

class Disponibilidade extends Model {
  static async getAll() {
    const disponibilidades = await Disponibilidade.findAll({
      order: [
        ['id_profissional', 'ASC'],
        ['dia_semana', 'ASC'],
        ['horario_inicio', 'ASC']
      ]
    });

    return disponibilidades.map((disponibilidade) => disponibilidade.toJSON());
  }

  static async getByProfissionalId(idProfissional) {
    const disponibilidades = await Disponibilidade.findAll({
      where: { id_profissional: idProfissional },
      order: [
        ['dia_semana', 'ASC'],
        ['horario_inicio', 'ASC']
      ]
    });

    return disponibilidades.map((disponibilidade) => disponibilidade.toJSON());
  }

  static async findById(id) {
    const disponibilidade = await Disponibilidade.findByPk(id);

    return disponibilidade ? disponibilidade.toJSON() : null;
  }

  // Duas janelas do mesmo profissional, no mesmo dia, não podem se sobrepor.
  static async existeSobreposicao(
    { id_profissional, dia_semana, horario_inicio, horario_fim },
    ignorarId = null
  ) {
    const where = {
      id_profissional,
      dia_semana,
      horario_inicio: { [Op.lt]: horario_fim },
      horario_fim: { [Op.gt]: horario_inicio }
    };

    if (ignorarId) {
      where.id = { [Op.ne]: ignorarId };
    }

    const encontrada = await Disponibilidade.findOne({
      attributes: ['id'],
      where
    });

    return Boolean(encontrada);
  }

  // O horário pedido cabe inteiro dentro de alguma janela do profissional?
  static async cobreHorario(idProfissional, diaSemana, horarioInicio, horarioFim) {
    const janela = await Disponibilidade.findOne({
      attributes: ['id'],
      where: {
        id_profissional: idProfissional,
        dia_semana: diaSemana,
        horario_inicio: { [Op.lte]: horarioInicio },
        horario_fim: { [Op.gte]: horarioFim }
      }
    });

    return Boolean(janela);
  }

  static async createDisponibilidade(dados) {
    const camposPermitidos = [
      'id_profissional',
      'dia_semana',
      'horario_inicio',
      'horario_fim'
    ];

    const dadosPermitidos = {};

    for (const campo of camposPermitidos) {
      if (dados[campo] !== undefined) {
        dadosPermitidos[campo] = dados[campo];
      }
    }

    const disponibilidade = await Disponibilidade.create(dadosPermitidos);

    return disponibilidade.toJSON();
  }

  // O dono (id_profissional) não muda depois de criado.
  static async updateDisponibilidade(id, dados) {
    const disponibilidade = await Disponibilidade.findByPk(id);

    if (!disponibilidade) {
      return null;
    }

    const camposPermitidos = ['dia_semana', 'horario_inicio', 'horario_fim'];

    const dadosPermitidos = {};

    for (const campo of camposPermitidos) {
      if (dados[campo] !== undefined) {
        dadosPermitidos[campo] = dados[campo];
      }
    }

    await disponibilidade.update(dadosPermitidos);

    return disponibilidade.toJSON();
  }

  static async deleteDisponibilidade(id) {
    const disponibilidade = await Disponibilidade.findByPk(id);

    if (!disponibilidade) {
      return false;
    }

    await disponibilidade.destroy();

    return true;
  }
}

Disponibilidade.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    id_profissional: {
      type: DataTypes.UUID,
      allowNull: false
    },
    dia_semana: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { isInt: true, min: 0, max: 6 }
    },
    horario_inicio: {
      type: DataTypes.TIME,
      allowNull: false
    },
    horario_fim: {
      type: DataTypes.TIME,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'Disponibilidade',
    tableName: 'disponibilidades',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = Disponibilidade;
