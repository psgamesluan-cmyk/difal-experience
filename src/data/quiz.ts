export interface QuizQuestion {
  topic: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
}

export const quizQuestions: QuizQuestion[] = [
  {
    topic: 'Conceito',
    prompt: 'O DIFAL é um imposto separado do ICMS, aplicado automaticamente a toda venda entre estados?',
    options: ['Sim, em qualquer venda interestadual.', 'Não. É um diferencial ligado ao ICMS e sua aplicação depende do cenário previsto em lei.', 'Sim, mas apenas em vendas pela internet.', 'Não, porque o ICMS nunca é repartido entre estados.'],
    correctIndex: 1,
    explanation: 'O DIFAL não é uma cobrança universal para toda venda interestadual. A destinação a consumidor final, a condição do destinatário e as normas aplicáveis importam.',
  },
  {
    topic: 'Finalidade',
    prompt: 'Qual é a finalidade central da sistemática introduzida pela EC nº 87/2015?',
    options: ['Direcionar a parcela correspondente ao diferencial ao estado de destino nas operações abrangidas.', 'Eliminar a incidência do ICMS na origem.', 'Criar uma alíquota interestadual única para operações internas.', 'Transferir todo o ICMS da venda ao estado de destino.'],
    correctIndex: 0,
    explanation: 'A mudança constitucional passou a considerar também o estado de destino nas operações para consumidor final em outro estado, contribuinte ou não, conforme o texto constitucional.',
  },
  {
    topic: 'Operação interestadual',
    prompt: 'Qual situação caracteriza, em termos gerais, uma operação interestadual?',
    options: ['A mercadoria percorre uma distância longa dentro do mesmo estado.', 'A operação envolve origem e destino situados em estados diferentes.', 'A venda ocorre exclusivamente pela internet.', 'A mercadoria é entregue ao consumidor no mesmo município.'],
    correctIndex: 1,
    explanation: 'O caráter interestadual decorre da operação entre estados. A distância física ou o canal da venda, isoladamente, não define a incidência do DIFAL.',
  },
  {
    topic: 'Condição do destinatário',
    prompt: 'Por que é importante identificar se o consumidor final é contribuinte do ICMS?',
    options: ['Porque a condição do destinatário influencia a responsabilidade geral pelo diferencial.', 'Porque toda pessoa jurídica é contribuinte.', 'Porque consumidores não contribuintes nunca participam da sistemática.', 'Porque a condição define automaticamente as alíquotas de todos os estados.'],
    correctIndex: 0,
    explanation: 'A Constituição diferencia a responsabilidade pelo diferencial conforme o destinatário seja contribuinte ou não. A classificação depende do contexto tributário, não apenas de ser pessoa física ou jurídica.',
  },
  {
    topic: 'Responsabilidade',
    prompt: 'Na regra geral constitucional, quando o consumidor final não é contribuinte, quem responde pelo diferencial?',
    options: ['O remetente da mercadoria ou serviço.', 'Sempre o destinatário.', 'O transportador.', 'O estado de origem, sem participação do remetente.'],
    correctIndex: 0,
    explanation: 'O art. 155, § 2º, VIII, “b”, da Constituição atribui, em regra, a responsabilidade ao remetente ou prestador quando o destinatário não é contribuinte.',
  },
  {
    topic: 'Alíquotas',
    prompt: 'O que precisa ser conferido antes de comparar as alíquotas de uma operação interestadual?',
    options: ['Somente o valor da mercadoria.', 'Origem, destino, data, mercadoria e regras específicas da operação.', 'Apenas se a venda aconteceu pela internet.', 'A distância física entre os estados.'],
    correctIndex: 1,
    explanation: 'A alíquota interestadual depende da trajetória e pode ter tratamento próprio para mercadorias importadas; a alíquota interna depende da legislação do destino e do produto.',
  },
  {
    topic: 'Base de cálculo',
    prompt: 'Por que o total informado na nota não deve ser tratado automaticamente como base de cálculo do DIFAL?',
    options: ['Porque a base e seus componentes dependem da hipótese legal e podem variar entre origem e destino.', 'Porque notas fiscais nunca informam valores tributáveis.', 'Porque frete e seguro são sempre excluídos.', 'Porque o valor da mercadoria não tem relação com o ICMS.'],
    correctIndex: 0,
    explanation: 'A LC nº 190/2022 alterou a LC nº 87/1996 e prevê critérios de base distintos em hipóteses específicas. Componentes e regras estaduais precisam ser conferidos antes do cálculo.',
  },
  {
    topic: 'Aplicação prática',
    prompt: 'Um fornecedor de SP vende a consumidor final não contribuinte em outro estado. No caso didático apresentado, qual conclusão geral é adequada?',
    options: ['A situação pode envolver DIFAL; em regra, o remetente responde pelo diferencial, observadas as normas aplicáveis.', 'Toda venda de SP para outro estado gera necessariamente o mesmo valor de DIFAL.', 'Uma referência geral de alíquota dispensa a classificação fiscal do produto.', 'O destinatário não contribuinte é sempre responsável geral pelo diferencial.'],
    correctIndex: 0,
    explanation: 'A aplicação depende da operação e das normas pertinentes. A referência da alíquota interestadual não substitui a análise da base, da alíquota interna, do produto e da vigência.',
  },
]
