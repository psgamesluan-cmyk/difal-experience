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
    topic: 'Diferença de alíquotas',
    prompt: 'No exemplo hipotético, a alíquota de destino é 20% e a interestadual é 12%. Qual é a diferença?',
    options: ['8 pontos percentuais.', '8% do valor da compra, em qualquer operação real.', '32 pontos percentuais.', 'A diferença é zero porque as alíquotas se anulam.'],
    correctIndex: 0,
    explanation: 'A diferença aritmética é 20% − 12% = 8 pontos percentuais. Isso não define, por si só, uma apuração fiscal completa.',
  },
  {
    topic: 'Cálculo didático',
    prompt: 'Com base didática assumida de R$ 1.000,00 e diferença hipotética de 8 pontos percentuais, qual é o resultado simplificado?',
    options: ['R$ 8,00.', 'R$ 80,00, apenas como resultado ilustrativo.', 'R$ 200,00 como valor definitivo.', 'R$ 1.080,00 como valor a recolher em qualquer caso.'],
    correctIndex: 1,
    explanation: 'R$ 1.000,00 × 8% = R$ 80,00 no exercício simplificado. O resultado não é valor fiscal definitivo para uma operação real.',
  },
  {
    topic: 'Aplicação prática',
    prompt: 'Um fornecedor de SP vende a consumidor final não contribuinte em outro estado. No caso didático apresentado, qual conclusão geral é adequada?',
    options: ['A situação pode envolver DIFAL; em regra, o remetente responde pelo diferencial, observadas as normas aplicáveis.', 'Toda venda de SP para outro estado gera necessariamente DIFAL de 8%.', 'A alíquota hipotética do exemplo é a alíquota oficial vigente para RO.', 'O destinatário não contribuinte é sempre responsável geral pelo diferencial.'],
    correctIndex: 0,
    explanation: 'A aplicação depende da operação e das normas pertinentes. O exercício usa alíquotas hipotéticas e a regra geral não elimina particularidades legais ou estaduais.',
  },
]
