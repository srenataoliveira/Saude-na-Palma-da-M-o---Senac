const RESULTADOS_CLASSIFICACAO = Object.freeze({
  TELECONSULTA: 'TELECONSULTA',
  PRESENCIAL: 'PRESENCIAL',
  POSSIVEL_URGENCIA: 'POSSIVEL_URGENCIA'
});

function classificarTriagem(categoria, perguntas, respostas) {
  const respostasPorPergunta = new Map(
    respostas.map(resposta => [
      resposta.id_pergunta,
      resposta
    ])
  );

  function respondeuSim(textoPergunta) {
    const pergunta = perguntas.find(
      item => item.texto_pergunta === textoPergunta
    );

    if (!pergunta) {
      throw new Error('Pergunta necessária para classificação não encontrada.');
    }

    return respostasPorPergunta.get(pergunta.id)?.resposta_bool === true;
  }

  if (categoria.nome_categoria === 'Sintomas respiratórios') {
    const faltaDeAr = respondeuSim(
      'Você está sentindo falta de ar?'
    );

    const febre = respondeuSim(
      'Você está apresentando febre?'
    );

    if (faltaDeAr) {
      return RESULTADOS_CLASSIFICACAO.POSSIVEL_URGENCIA;
    }

    if (febre) {
      return RESULTADOS_CLASSIFICACAO.PRESENCIAL;
    }

    return RESULTADOS_CLASSIFICACAO.TELECONSULTA;
  }

  if (categoria.nome_categoria === 'Dor de cabeça e sintomas neurológicos') {
    const dorCabeca = respondeuSim(
      'Você está sentindo dor de cabeça?'
    );

    const dorSubita = respondeuSim(
      'A dor começou de forma súbita e muito intensa?'
    );

    const fraquezaDormencia = respondeuSim(
      'Você está sentindo fraqueza ou dormência em alguma parte do corpo?'
    );

    if (dorSubita || fraquezaDormencia) {
      return RESULTADOS_CLASSIFICACAO.POSSIVEL_URGENCIA;
    }

    if (dorCabeca) {
      return RESULTADOS_CLASSIFICACAO.PRESENCIAL;
    }

    return RESULTADOS_CLASSIFICACAO.TELECONSULTA;
  }

  if (categoria.nome_categoria === 'Sintomas gastrointestinais') {
    const dorAbdominal = respondeuSim(
      'Você está sentindo dor abdominal?'
    );

    const nauseasVomitos = respondeuSim(
      'Você está apresentando náuseas ou vômitos?'
    );

    const diarreia = respondeuSim(
      'Você está com diarreia?'
    );

    if (dorAbdominal && nauseasVomitos && diarreia) {
      return RESULTADOS_CLASSIFICACAO.POSSIVEL_URGENCIA;
    }

    if (dorAbdominal || nauseasVomitos) {
      return RESULTADOS_CLASSIFICACAO.PRESENCIAL;
    }

    return RESULTADOS_CLASSIFICACAO.TELECONSULTA;
  }

  if (categoria.nome_categoria === 'Dores musculares e articulares') {
    const doresMusculares = respondeuSim(
      'Você está sentindo dores musculares?'
    );

    const doresArticulares = respondeuSim(
      'Você está sentindo dores nas articulações?'
    );

    const inchacoDificuldade = respondeuSim(
      'Você apresenta inchaço ou dificuldade para movimentar alguma articulação?'
    );

    if (inchacoDificuldade) {
      return RESULTADOS_CLASSIFICACAO.POSSIVEL_URGENCIA;
    }

    if (doresMusculares || doresArticulares) {
      return RESULTADOS_CLASSIFICACAO.PRESENCIAL;
    }

    return RESULTADOS_CLASSIFICACAO.TELECONSULTA;
  }
  
  if (categoria.nome_categoria === 'Sintomas urinários') {
    const dorArdencia = respondeuSim(
      'Você está sentindo dor ou ardência ao urinar?'
    );

    const frequenciaUrinaria = respondeuSim(
      'Você está urinando com mais frequência que o habitual?'
    );

    const sangueUrina = respondeuSim(
      'Você percebeu sangue na urina?'
    );

    if (sangueUrina) {
      return RESULTADOS_CLASSIFICACAO.POSSIVEL_URGENCIA;
    }

    if (dorArdencia || frequenciaUrinaria) {
      return RESULTADOS_CLASSIFICACAO.PRESENCIAL;
    }

    return RESULTADOS_CLASSIFICACAO.TELECONSULTA;
  }

  if (categoria.nome_categoria === 'Problemas de pele') {
    const coceira = respondeuSim(
      'Você está apresentando coceira na pele?'
    );

    const manchasVermelhidao = respondeuSim(
      'Você percebeu manchas ou vermelhidão na pele?'
    );

    const feridasBolhasInchaco = respondeuSim(
      'Você está apresentando feridas, bolhas ou inchaço na pele?'
    );

    if (feridasBolhasInchaco) {
      return RESULTADOS_CLASSIFICACAO.POSSIVEL_URGENCIA;
    }

    if (manchasVermelhidao) {
      return RESULTADOS_CLASSIFICACAO.PRESENCIAL;
    }

    return RESULTADOS_CLASSIFICACAO.TELECONSULTA;
  }

  if (categoria.nome_categoria === 'Febre e mal-estar geral') {
    const febre = respondeuSim(
      'Você está apresentando febre?'
    );

    const cansacoFraqueza = respondeuSim(
      'Você está sentindo cansaço ou fraqueza fora do habitual?'
    );

    const calafriosSuor = respondeuSim(
      'Você está apresentando calafrios ou suor excessivo?'
    );

    if (febre && calafriosSuor) {
      return RESULTADOS_CLASSIFICACAO.POSSIVEL_URGENCIA;
    }

    if (febre || cansacoFraqueza) {
      return RESULTADOS_CLASSIFICACAO.PRESENCIAL;
    }

    return RESULTADOS_CLASSIFICACAO.TELECONSULTA;
  }

  if (categoria.nome_categoria === 'Sintomas de ouvido, nariz e garganta') {
    const dorOuvidoGarganta = respondeuSim(
      'Você está sentindo dor de ouvido ou dor de garganta?'
    );

    const congestaoCoriza = respondeuSim(
      'Você está apresentando congestão nasal ou coriza?'
    );

    const dificuldadeEngolir = respondeuSim(
      'Você está com dificuldade para engolir?'
    );

    if (dificuldadeEngolir) {
      return RESULTADOS_CLASSIFICACAO.POSSIVEL_URGENCIA;
    }

    if (dorOuvidoGarganta) {
      return RESULTADOS_CLASSIFICACAO.PRESENCIAL;
    }

    return RESULTADOS_CLASSIFICACAO.TELECONSULTA;
  }
  
  if (categoria.nome_categoria === 'Sintomas oculares') {
    const dorDesconforto = respondeuSim(
      'Você está sentindo dor ou desconforto nos olhos?'
    );

    const vermelhidaoSecrecao = respondeuSim(
      'Você está apresentando vermelhidão ou secreção nos olhos?'
    );

    const alteracaoVisao = respondeuSim(
      'Você percebeu alguma alteração ou perda de visão?'
    );

    if (alteracaoVisao) {
      return RESULTADOS_CLASSIFICACAO.POSSIVEL_URGENCIA;
    }

    if (dorDesconforto || vermelhidaoSecrecao) {
      return RESULTADOS_CLASSIFICACAO.PRESENCIAL;
    }

    return RESULTADOS_CLASSIFICACAO.TELECONSULTA;
  }
  
  if (categoria.nome_categoria === 'Outros sintomas') {
    const dorIntensa = respondeuSim(
      'Você está sentindo dor intensa?'
    );

    const febreMalEstar = respondeuSim(
      'Você está apresentando febre ou mal-estar?'
    );

    const dificuldadeAtividades = respondeuSim(
      'Os sintomas estão dificultando suas atividades diárias?'
    );

    if (dorIntensa) {
      return RESULTADOS_CLASSIFICACAO.POSSIVEL_URGENCIA;
    }

    if (febreMalEstar || dificuldadeAtividades) {
      return RESULTADOS_CLASSIFICACAO.PRESENCIAL;
    }

    return RESULTADOS_CLASSIFICACAO.TELECONSULTA;
  }
  
  // As demais categorias serão configuradas posteriormente.
  throw new Error('Categoria ainda não configurada para classificação.');
}

module.exports = {
  RESULTADOS_CLASSIFICACAO,
  classificarTriagem
};