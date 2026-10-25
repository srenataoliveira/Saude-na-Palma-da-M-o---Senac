const { DataTypes, Model, Op } = require('sequelize');
const sequelize = require('../sequelize');

const Paciente = require('./Paciente');
const Profissional = require('./Profissional');
const Clinica = require('./Clinica');

const STATUS_VALIDOS = ['Agendado', 'Cancelado', 'Concluido'];

class AgendamentoDB extends Model {}

AgendamentoDB.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    id_paciente: {
      type: DataTypes.UUID,
      allowNull: false
    },
    id_profissional: {
      type: DataTypes.UUID,
      allowNull: false
    },
    id_clinica: {
      type: DataTypes.UUID,
      allowNull: false
    },
    id_triagem: {
      type: DataTypes.UUID,
      allowNull: true
    },
    data_consulta: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    horario_inicio: {
      type: DataTypes.TIME,
      allowNull: false
    },
    horario_fim: {
      type: DataTypes.TIME,
      allowNull: false
    },
    // A coluna no banco é VARCHAR; por isso STRING + isIn (e não ENUM).
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Agendado',
      validate: { isIn: [STATUS_VALIDOS] }
    }
  },
  {
    sequelize,
    modelName: 'AgendamentoDB',
    tableName: 'agendamentos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

AgendamentoDB.belongsTo(Paciente, {
  foreignKey: 'id_paciente',
  as: 'pacienteRel'
});

AgendamentoDB.belongsTo(Profissional, {
  foreignKey: 'id_profissional',
  as: 'profissionalRel'
});

AgendamentoDB.belongsTo(Clinica, {
  foreignKey: 'id_clinica',
  as: 'clinicaRel'
});

function condicaoConflito(idProfissional, dataConsulta, horarioInicio, horarioFim) {
  return {
    id_profissional: idProfissional,
    data_consulta: dataConsulta,
    // Consulta cancelada libera o horário.
    status: { [Op.ne]: 'Cancelado' },
    horario_inicio: { [Op.lt]: horarioFim },
    horario_fim: { [Op.gt]: horarioInicio }
  };
}

const Agendamento = {
  STATUS_VALIDOS,

  async getByPacienteId(idPaciente) {
    const agendamentos = await AgendamentoDB.findAll({
      where: { id_paciente: idPaciente },
      include: [
        {
          model: Paciente,
          as: 'pacienteRel',
          attributes: ['nome_completo'],
          required: true
        },
        {
          model: Profissional,
          as: 'profissionalRel',
          attributes: ['nome'],
          required: true
        },
        {
          model: Clinica,
          as: 'clinicaRel',
          attributes: ['nome'],
          required: true
        }
      ],
      order: [
        ['data_consulta', 'ASC'],
        ['horario_inicio', 'ASC']
      ]
    });

    return agendamentos.map((item) => {
      const dados = item.toJSON();

      return {
        id: dados.id,
        id_paciente: dados.id_paciente,
        id_profissional: dados.id_profissional,
        id_clinica: dados.id_clinica,
        id_triagem: dados.id_triagem,
        paciente: dados.pacienteRel.nome_completo,
        profissional: dados.profissionalRel.nome,
        clinica: dados.clinicaRel.nome,
        data_consulta: dados.data_consulta,
        horario_inicio: dados.horario_inicio,
        horario_fim: dados.horario_fim,
        status: dados.status,
        created_at: dados.created_at,
        updated_at: dados.updated_at
      };
    });
  },

  // Agenda do profissional. Mostra só o necessário sobre o paciente:
  // sem CPF, telefone ou e-mail.
  async getByProfissionalId(idProfissional) {
    const agendamentos = await AgendamentoDB.findAll({
      where: { id_profissional: idProfissional },
      include: [
        {
          model: Paciente,
          as: 'pacienteRel',
          attributes: ['id', 'nome_completo', 'data_nascimento'],
          required: true
        },
        {
          model: Clinica,
          as: 'clinicaRel',
          attributes: ['nome'],
          required: true
        }
      ],
      order: [
        ['data_consulta', 'ASC'],
        ['horario_inicio', 'ASC']
      ]
    });

    return agendamentos.map((item) => {
      const dados = item.toJSON();

      return {
        id: dados.id,
        id_triagem: dados.id_triagem,
        id_paciente: dados.pacienteRel.id,
        paciente: dados.pacienteRel.nome_completo,
        data_nascimento: dados.pacienteRel.data_nascimento,
        clinica: dados.clinicaRel.nome,
        data_consulta: dados.data_consulta,
        horario_inicio: dados.horario_inicio,
        horario_fim: dados.horario_fim,
        status: dados.status
      };
    });
  },

  async findById(id) {
    const agendamento = await AgendamentoDB.findByPk(id);

    return agendamento ? agendamento.toJSON() : undefined;
  },

  async verificarConflito(
    idProfissional,
    dataConsulta,
    horarioInicio,
    horarioFim
  ) {
    const resultado = await AgendamentoDB.findOne({
      attributes: ['id'],
      where: condicaoConflito(
        idProfissional,
        dataConsulta,
        horarioInicio,
        horarioFim
      )
    });

    return resultado ? resultado.toJSON() : undefined;
  },

  // Consulta horários ocupados para pacientes escolherem horários livres.
  // Retorna estritamente data e horários; nenhum dado do paciente ou agendamento.
  async getHorariosOcupados(idProfissional, dataInicio, dataFim) {
    const whereClause = {
      id_profissional: idProfissional,
      status: { [Op.ne]: 'Cancelado' }
    };

    if (dataInicio && dataFim) {
      whereClause.data_consulta = { [Op.between]: [dataInicio, dataFim] };
    } else if (dataInicio) {
      whereClause.data_consulta = { [Op.gte]: dataInicio };
    } else if (dataFim) {
      whereClause.data_consulta = { [Op.lte]: dataFim };
    }

    const agendamentos = await AgendamentoDB.findAll({
      attributes: ['data_consulta', 'horario_inicio', 'horario_fim'],
      where: whereClause,
      order: [
        ['data_consulta', 'ASC'],
        ['horario_inicio', 'ASC']
      ]
    });

    return agendamentos.map((item) => {
      const dados = item.toJSON();
      return {
        data: dados.data_consulta,
        horario_inicio: dados.horario_inicio,
        horario_fim: dados.horario_fim
      };
    });
  },

  async create(agendamento) {
    const camposPermitidos = [
      'id_paciente',
      'id_profissional',
      'id_clinica',
      'id_triagem',
      'data_consulta',
      'horario_inicio',
      'horario_fim',
      'status'
    ];

    const dados = {};

    for (const campo of camposPermitidos) {
      if (agendamento[campo] !== undefined) {
        dados[campo] = agendamento[campo];
      }
    }

    const novoAgendamento = await AgendamentoDB.create(dados);

    return novoAgendamento.toJSON();
  },

  // Depois de criado, só o status muda (cancelar, concluir).
  async update(id, agendamento) {
    const registro = await AgendamentoDB.findByPk(id);

    if (!registro) {
      return undefined;
    }

    const dados = {};

    if (agendamento.status !== undefined) {
      dados.status = agendamento.status;
    }

    await registro.update(dados);

    return registro.toJSON();
  }
};

module.exports = Agendamento;
