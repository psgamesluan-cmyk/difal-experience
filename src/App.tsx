import { useCallback, useEffect, useState } from 'react'
import { CaseStudy } from './components/CaseStudy'
import { ChapterFrame } from './components/ChapterFrame'
import { DifalCalculator } from './components/DifalCalculator'
import { Quiz } from './components/Quiz'
import { RouteDiagram } from './components/RouteDiagram'
import type { RecipientKind } from './lib/difal'

const chapters = [
  { id: 'conceito', label: 'Conceito', short: '01' },
  { id: 'por-que', label: 'Por que existe', short: '02' },
  { id: 'operacoes', label: 'Operações', short: '03' },
  { id: 'destinatario', label: 'Destinatário', short: '04' },
  { id: 'responsabilidade', label: 'Responsabilidade', short: '05' },
  { id: 'calculadora', label: 'Calculadora', short: '06' },
  { id: 'caso-pratico', label: 'Caso prático', short: '07' },
  { id: 'quiz', label: 'Quiz', short: '08' },
  { id: 'fontes', label: 'Fontes', short: '09' },
]

const participantCopy = {
  origin: { title: 'Estado de origem', body: 'Onde está o remetente. Nas operações abrangidas, aplica-se a alíquota interestadual e o imposto correspondente segue a disciplina constitucional.' },
  goods: { title: 'Circulação da mercadoria', body: 'O fluxo entre estados ilustra a operação interestadual; o trajeto físico, sozinho, não define todas as consequências tributárias.' },
  destination: { title: 'Estado de destino', body: 'Onde está o consumidor final. Nas hipóteses previstas, considera-se a diferença entre a alíquota interna do destino e a interestadual.' },
}

function ArrowIcon({ direction = 'right' }: { direction?: 'left' | 'right' }) {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d={direction === 'right' ? 'M2.5 9h12m-5-5 5 5-5 5' : 'M15.5 9h-12m5 5-5-5 5-5'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

function PresentationIcon({ active }: { active: boolean }) {
  return <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d={active ? 'M2 5V2h3M11 2h3v3M14 11v3h-3M5 14H2v-3' : 'M2 5V2h3M11 2h3v3M14 11v3h-3M5 14H2v-3'} stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />{active && <path d="M5 5l2-2m4 8 2-2M3 11l2-2m4-4 2-2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />}</svg>
}

export function App() {
  const [activeChapter, setActiveChapter] = useState('conceito')
  const [isPresentationMode, setIsPresentationMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<keyof typeof participantCopy>('origin')
  const [routeDirection, setRouteDirection] = useState<'sp-ro' | 'ro-sp'>('sp-ro')
  const [operationType, setOperationType] = useState<'internal' | 'interstate'>('interstate')
  const [recipient, setRecipient] = useState<RecipientKind>('nonTaxpayer')
  const [selectedRole, setSelectedRole] = useState<'seller' | 'buyer'>('seller')

  const goToChapter = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  useEffect(() => {
    const targets = [...chapters.map(({ id }) => document.getElementById(id)), document.getElementById('home')].filter((target): target is HTMLElement => target !== null)
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) setActiveChapter(visible.target.id === 'home' ? chapters[0]?.id ?? 'conceito' : visible.target.id)
    }, { rootMargin: '-20% 0px -58% 0px', threshold: [0.05, 0.25, 0.5] })
    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const updateFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', updateFullscreen)
    return () => document.removeEventListener('fullscreenchange', updateFullscreen)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      const isEditing = target instanceof HTMLElement && (target.isContentEditable || Boolean(target.closest('input, textarea, select, [role="slider"], [role="combobox"], [role="textbox"]')))
      if (isEditing || event.altKey || event.ctrlKey || event.metaKey) return
      const currentIndex = chapters.findIndex(({ id }) => id === activeChapter)
      if (event.key === 'Escape' || event.key === 'Esc') {
        event.preventDefault()
        if (document.fullscreenElement) void document.exitFullscreen()
        else if (isPresentationMode) setIsPresentationMode(false)
        return
      }
      if (!isPresentationMode) return
      if (['ArrowRight', 'PageDown'].includes(event.key)) {
        event.preventDefault()
        goToChapter(chapters[Math.min(chapters.length - 1, Math.max(0, currentIndex + 1))]?.id ?? 'quiz')
      } else if (['ArrowLeft', 'PageUp'].includes(event.key)) {
        event.preventDefault()
        goToChapter(chapters[Math.max(0, currentIndex - 1)]?.id ?? 'conceito')
      } else if (event.key === 'Home') {
        event.preventDefault()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (event.key === 'End') {
        event.preventDefault()
        goToChapter('quiz')
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [activeChapter, goToChapter, isPresentationMode])

  const activeIndex = chapters.findIndex(({ id }) => id === activeChapter)
  const togglePresentation = async () => {
    if (!isPresentationMode) {
      setIsPresentationMode(true)
      if (document.documentElement.requestFullscreen) {
        try { await document.documentElement.requestFullscreen() } catch { /* Modo de apresentação continua disponível sem tela cheia. */ }
      }
      return
    }
    setIsPresentationMode(false)
    if (document.fullscreenElement) await document.exitFullscreen()
  }

  return (
    <div className={`experience${isPresentationMode ? ' experience--presentation' : ''}`}>
      <a className="skip-link" href="#conceito">Pular para o conteúdo</a>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="DIFAL Experience, início"><span className="brand__mark">D</span><span className="brand__name">DIFAL<small>EXPERIENCE</small></span></a>
        <nav className="site-nav" aria-label="Navegação dos capítulos">{chapters.map((chapter) => <a key={chapter.id} href={`#${chapter.id}`} className={activeChapter === chapter.id ? 'is-active' : ''} aria-current={activeChapter === chapter.id ? 'location' : undefined}>{chapter.label}</a>)}</nav>
        <button className="presentation-toggle" type="button" onClick={() => void togglePresentation()} aria-pressed={isPresentationMode} aria-label={isPresentationMode ? 'Sair do modo de apresentação' : 'Entrar no modo de apresentação'}><span><PresentationIcon active={isPresentationMode} /></span><span className="presentation-toggle__label">{isPresentationMode ? 'Sair' : 'Apresentar'}</span></button>
      </header>
      <div className="reading-progress" aria-hidden="true"><span style={{ width: `${Math.max(0, (activeIndex + 1) / chapters.length * 100)}%` }} /></div>

      <main id="top">
        <section className="hero" id="home" aria-labelledby="hero-title">
          <div className="hero__texture" aria-hidden="true" />
          <div className="hero__inner">
            <div className="hero__copy">
              <p className="hero__eyebrow">TRIBUTAÇÃO <i /> ICMS <i /> OPERAÇÕES INTERESTADUAIS</p>
              <h1 id="hero-title">Quando uma venda cruza fronteiras, <em>como o imposto é distribuído?</em></h1>
              <p className="hero__subhead">Entenda o diferencial de alíquotas, a responsabilidade pelo recolhimento e o caminho do ICMS entre os estados.</p>
              <div className="hero__actions"><a className="button button--hero" href="#conceito">Explorar o conteúdo <ArrowIcon /></a><span className="hero__aside">APRESENTAÇÃO INTERATIVA<br />COM ESTUDO DE CASO E QUIZ</span></div>
            </div>
            <div className="hero__visual">
              <div className="route-direction-control" role="group" aria-label="Direção da operação interestadual">
                <button type="button" aria-pressed={routeDirection === 'sp-ro'} onClick={() => setRouteDirection('sp-ro')}>SP <span aria-hidden="true">→</span> RO</button>
                <button type="button" aria-pressed={routeDirection === 'ro-sp'} onClick={() => setRouteDirection('ro-sp')}>RO <span aria-hidden="true">→</span> SP</button>
              </div>
              <RouteDiagram direction={routeDirection} />
            </div>
          </div>
          <div className="hero__foot"><span>01 — 09</span><span>UM PERCURSO PELO DIFERENCIAL DE ALÍQUOTAS</span><a href="#conceito" aria-label="Rolar para o primeiro capítulo">↓</a></div>
        </section>

        <ChapterFrame id="conceito" number="01" label="O CONCEITO" title="O que é DIFAL?" intro="A diferença entre alíquotas é parte do raciocínio. A apuração também depende da operação, da base e das regras vigentes em cada estado.">
          <div className="concept-layout">
            <div className="concept-copy"><p className="lead-copy">DIFAL é a abreviação de <strong>Diferencial de Alíquotas do ICMS</strong>. Em determinadas operações interestaduais destinadas a consumidor final, corresponde à diferença entre a alíquota interna do estado de destino e a alíquota interestadual, conforme a legislação e as regras de apuração aplicáveis.</p>
              <div className="plain-language"><span className="eyebrow">EM OUTRAS PALAVRAS</span><p>Quando uma compra cruza um estado e chega a quem vai consumir a mercadoria, a lei pode considerar também a alíquota do local de destino. O DIFAL representa essa diferença no contexto do ICMS.</p></div>
              <p>Não é um imposto completamente separado do ICMS nem uma cobrança automática para toda venda entre estados. A operação, a destinação e a condição do comprador precisam ser consideradas.</p>
            </div>
            <div className="rate-illustration"><div className="rate-illustration__caption"><span className="eyebrow">CADA OPERAÇÃO TEM SUA REGRA</span><span>Identifique origem, destino, mercadoria e data.</span></div>
              <div className="rate-illustration__rule"><span>Alíquota interestadual</span><strong>Depende da trajetória e da mercadoria</strong></div>
              <div className="rate-illustration__rule rate-illustration__rule--destination"><span>Alíquota interna do destino</span><strong>Depende da lei estadual e do produto</strong></div>
              <div className="rate-difference"><span>Antes da conta</span><strong>Valide <small>base + regra</small></strong><span>sem presunção</span></div>
              <div className="note-box"><strong>Uma diferença não basta para apurar</strong><p>A regra pode estabelecer bases e responsabilidades distintas. Sem identificar a operação, os componentes fiscais e a vigência, não se deve apresentar um valor de DIFAL como resultado.</p></div>
            </div>
          </div>
        </ChapterFrame>

        <ChapterFrame id="por-que" number="02" label="O CONTEXTO" title="Quem recebe o ICMS quando a venda cruza um estado?" intro="A Emenda Constitucional nº 87/2015 alterou a sistemática das operações interestaduais destinadas a consumidor final, contribuinte ou não contribuinte do imposto." tone="mist">
          <div className="why-layout"><div className="why-copy"><p>A mudança buscou considerar o estado de destino nas operações interestaduais com consumidor final. Antes da EC nº 87/2015, a sistemática constitucional era diferente nas operações destinadas a quem não era contribuinte. A emenda ampliou o alcance do diferencial para esses cenários, respeitada a evolução legislativa e jurisprudencial.</p><p>O crescimento do comércio eletrônico tornou as vendas entre estados mais visíveis, mas não foi o único elemento por trás da mudança. O ponto central é a repartição do imposto entre origem e destino nas operações abrangidas.</p><div className="quote-callout"><span>IDEIA-CHAVE</span><p>Não se trata de dizer que o destino recebe todo o ICMS da venda. A alíquota interestadual e o diferencial seguem papéis distintos definidos pela Constituição.</p></div>
              <div className="participant-selector" role="group" aria-label="Explore as partes do fluxo"><span className="eyebrow">EXPLORE O FLUXO</span><div className="segmented-control">{(['origin', 'goods', 'destination'] as const).map((key) => <button key={key} type="button" className={selectedParticipant === key ? 'is-selected' : ''} aria-pressed={selectedParticipant === key} onClick={() => setSelectedParticipant(key)}>{key === 'origin' ? 'Origem' : key === 'goods' ? 'Mercadoria' : 'Destino'}</button>)}</div><p className="participant-explanation"><strong>{participantCopy[selectedParticipant].title}</strong>{participantCopy[selectedParticipant].body}</p></div>
            </div><RouteDiagram compact direction={routeDirection} emphasized={selectedParticipant === 'goods' ? 'flow' : selectedParticipant} /></div>
        </ChapterFrame>

        <ChapterFrame id="operacoes" number="03" label="O TIPO DE OPERAÇÃO" title="Quando uma operação é interestadual?" intro="A origem e o destino fiscal importam. A distância percorrida pela mercadoria não é, sozinha, o critério que resolve o tratamento tributário." >
          <div className="scenario-switch" role="group" aria-label="Compare os tipos de operação">{(['internal', 'interstate'] as const).map((type) => <button key={type} type="button" aria-pressed={operationType === type} className={operationType === type ? 'is-active' : ''} onClick={() => setOperationType(type)}>{type === 'internal' ? 'A · Operação interna' : 'B · Operação interestadual'}</button>)}</div>
          <div className="scenario-panel" key={operationType}><div className="scenario-panel__route"><span className="scenario-state">Estado A<small>origem</small></span><span className={`scenario-line${operationType === 'interstate' ? ' is-interstate' : ''}`}><i className="scenario-line__parcel" /><b>{operationType === 'internal' ? 'mesmo estado' : 'entre estados'}</b></span><span className="scenario-state">{operationType === 'internal' ? 'Estado A' : 'Estado B'}<small>destino</small></span></div><div className="scenario-panel__copy"><span className="eyebrow">{operationType === 'internal' ? 'CENÁRIO A' : 'CENÁRIO B'}</span><h3>{operationType === 'internal' ? 'Origem e destino no mesmo estado.' : 'Origem e destino em estados diferentes.'}</h3><p>{operationType === 'internal' ? 'Em uma operação interna, a saída e o destino estão no mesmo estado. O DIFAL interestadual não se aplica por esse simples fato; outras regras do ICMS podem incidir.' : 'Uma operação entre estados pode envolver alíquota interestadual. Isso não significa que o DIFAL seja devido em toda operação: a destinação a consumidor final, a condição do destinatário e as normas pertinentes precisam ser avaliadas.'}</p><div className="scenario-tag">{operationType === 'internal' ? 'OPERAÇÃO INTERNA' : 'DIFAL DEPENDE DO CENÁRIO'}</div></div></div>
        </ChapterFrame>

        <ChapterFrame id="destinatario" number="04" label="A CONDIÇÃO DE QUEM COMPRA" title="Dois consumidores. Responsabilidades diferentes." intro="A condição tributária do destinatário muda a regra geral de responsabilidade. Ser pessoa física ou jurídica, por si só, não responde à pergunta." tone="dark">
          <div className="recipient-toggle"><span className="eyebrow">QUEM ESTÁ COMPRANDO?</span><div className="segmented-control segmented-control--dark" role="group" aria-label="Escolha a categoria do consumidor final"><button type="button" className={recipient === 'taxpayer' ? 'is-selected' : ''} aria-pressed={recipient === 'taxpayer'} onClick={() => setRecipient('taxpayer')}>Contribuinte do ICMS</button><button type="button" className={recipient === 'nonTaxpayer' ? 'is-selected' : ''} aria-pressed={recipient === 'nonTaxpayer'} onClick={() => setRecipient('nonTaxpayer')}>Não contribuinte</button></div></div>
          <div className="recipient-result" aria-live="polite"><div className="recipient-result__flow"><span>VENDEDOR<br /><strong>Remetente</strong></span><i /><span>COMPRADOR<br /><strong>{recipient === 'taxpayer' ? 'Contribuinte' : 'Não contribuinte'}</strong></span></div><div className="recipient-result__answer"><span className="eyebrow">RESPONSÁVEL GERAL PELO DIFERENCIAL</span><h3>{recipient === 'taxpayer' ? 'Destinatário contribuinte' : 'Remetente'}</h3><p>{recipient === 'taxpayer' ? 'Em regra, o destinatário contribuinte é responsável pelo recolhimento da diferença, observadas as condições concretas e a legislação pertinente.' : 'Em regra, o remetente é responsável pelo recolhimento quando o consumidor final destinatário não é contribuinte do ICMS.'}</p></div></div>
          <div className="taxpayer-columns"><article><span className="eyebrow">01 · CONTRIBUINTE</span><h3>Quem participa da relação de incidência do ICMS.</h3><p>A condição depende do enquadramento tributário da pessoa e da atividade realizada. Em operação interestadual para consumidor final contribuinte, a regra geral atribui a ela o diferencial.</p></article><article><span className="eyebrow">02 · NÃO CONTRIBUINTE</span><h3>Quem não está enquadrado como contribuinte naquela situação.</h3><p>Uma operação interestadual destinada a consumidor final não contribuinte também pode estar sujeita ao diferencial. A regra geral atribui o recolhimento ao remetente, conforme as normas aplicáveis.</p></article></div>
          <div className="comparison-table-wrap"><table className="comparison-table"><caption>Comparação geral · sempre verifique o caso concreto</caption><thead><tr><th scope="col">Característica</th><th scope="col">Contribuinte</th><th scope="col">Não contribuinte</th></tr></thead><tbody><tr><th scope="row">Condição do destinatário</th><td>É contribuinte do ICMS no contexto considerado.</td><td>Não é contribuinte do ICMS no contexto considerado.</td></tr><tr><th scope="row">Responsabilidade geral pelo DIFAL</th><td>Destinatário contribuinte.</td><td>Remetente da mercadoria ou serviço.</td></tr><tr><th scope="row">Observação</th><td>Depende da operação e da legislação aplicável.</td><td>Requer observância da LC nº 190/2022 e das normas pertinentes.</td></tr></tbody></table></div>
          <p className="chapter-footnote">A natureza jurídica do comprador não pode ser inferida somente pelo fato de ser pessoa física ou empresa.</p>
        </ChapterFrame>

        <ChapterFrame id="responsabilidade" number="05" label="A REGRA GERAL" title="Quem recolhe o DIFAL?" intro="A Constituição diferencia a responsabilidade conforme o destinatário seja ou não contribuinte do ICMS. A regra geral não elimina os detalhes da operação nem a regulamentação aplicável." >
          <div className="responsibility-layout"><div className="responsibility-selector"><span className="eyebrow">SELECIONE UMA PARTE</span><div className="role-buttons" role="group" aria-label="Selecione vendedor ou comprador"><button type="button" className={selectedRole === 'seller' ? 'is-selected' : ''} aria-pressed={selectedRole === 'seller'} onClick={() => setSelectedRole('seller')}><span>01</span>Vendedor<br /><small>remetente</small></button><button type="button" className={selectedRole === 'buyer' ? 'is-selected' : ''} aria-pressed={selectedRole === 'buyer'} onClick={() => setSelectedRole('buyer')}><span>02</span>Comprador<br /><small>destinatário</small></button></div></div><div className="responsibility-detail" aria-live="polite"><span className="eyebrow">{selectedRole === 'seller' ? 'REMETENTE' : 'DESTINATÁRIO'}</span><h3>{selectedRole === 'seller' ? (recipient === 'nonTaxpayer' ? 'Responsável geral neste cenário' : 'A regra varia com a condição do destinatário') : (recipient === 'taxpayer' ? 'Responsável geral neste cenário' : 'Destinatário não contribuinte')}</h3><p>{selectedRole === 'seller' ? (recipient === 'nonTaxpayer' ? 'Quando a operação interestadual se destina a consumidor final não contribuinte, a Constituição atribui, em regra, ao remetente a responsabilidade pelo diferencial.' : 'Com destinatário contribuinte, a regra geral atribui a responsabilidade ao destinatário. O remetente continua sujeito às demais obrigações da operação.') : (recipient === 'taxpayer' ? 'Quando é contribuinte do ICMS, o destinatário responde, em regra, pelo diferencial entre a alíquota interna do destino e a interestadual.' : 'Quando não é contribuinte, o destinatário não é o responsável geral pelo DIFAL segundo a regra constitucional; em regra, responde o remetente.')}</p></div></div>
          <div className="constitutional-note"><span className="eyebrow">CONSTITUIÇÃO FEDERAL · ART. 155, § 2º, VIII</span><p>“a” destinatário contribuinte: responsabilidade pelo diferencial; “b” remetente ou prestador, se o destinatário não for contribuinte. Aplicação sujeita às normas que regem cada operação.</p><a href="#fontes">Consultar fontes oficiais <ArrowIcon /></a></div>
          <p className="chapter-footnote">A responsabilidade pelo diferencial não equivale à responsabilidade por todos os tributos, deveres fiscais ou custos envolvidos na venda.</p>
        </ChapterFrame>

        <ChapterFrame id="calculadora" number="06" label="TRIAGEM DA OPERAÇÃO" title="Confira se há regra para calcular." intro="Identifique a operação e os dados fiscais disponíveis. Quando faltar validação suficiente, a ferramenta explica a pendência e não estima um valor de recolhimento." tone="mist">
          <DifalCalculator />
        </ChapterFrame>

        <ChapterFrame id="caso-pratico" number="07" label="APLICAÇÃO PRÁTICA" title="Do pedido ao recolhimento." intro="Compare quatro trajetórias, veja quais referências federais podem ser identificadas e percorra as verificações que antecedem uma apuração confiável." >
          <CaseStudy onReviewConcept={() => goToChapter('conceito')} onGoQuiz={() => goToChapter('quiz')} />
        </ChapterFrame>

        <ChapterFrame id="quiz" number="08" label="REVISÃO DO APRENDIZADO" title="Você entendeu o DIFAL?" intro="Agora é sua vez. Teste o que aprendeu ao longo da apresentação. São oito questões, sem tempo limite e sem coleta de dados pessoais." tone="dark">
          <Quiz onGoContent={() => goToChapter('conceito')} />
        </ChapterFrame>

        <ChapterFrame id="fontes" number="09" label="PARA CONTINUAR" title="Fundamentação legal e fontes de consulta." intro="Fontes oficiais consultadas para a auditoria. Cada referência tem escopo e vigência; nenhuma, isoladamente, valida todos os cenários da calculadora." tone="mist">
          <div className="source-list">
            <article className="source-item"><span className="source-item__type">LEGISLAÇÃO</span><div><h3>Constituição da República Federativa do Brasil de 1988</h3><p>Art. 155, § 2º, VII e VIII: operações destinadas a consumidor final localizado em outro estado e responsabilidade pelo diferencial.</p></div><a href="https://www.planalto.gov.br/ccivil_03/constituicao/constituicaocompilado.htm" target="_blank" rel="noreferrer" aria-label="Abrir Constituição Federal compilada no Portal do Planalto">Abrir fonte <ArrowIcon /></a></article>
            <article className="source-item"><span className="source-item__type">LEGISLAÇÃO</span><div><h3>Emenda Constitucional nº 87, de 16 de abril de 2015</h3><p>Alterou o art. 155 da Constituição e estabeleceu a sistemática para operações e prestações interestaduais destinadas a consumidor final, contribuinte ou não.</p></div><a href="https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc87.htm" target="_blank" rel="noreferrer" aria-label="Abrir Emenda Constitucional 87 de 2015 no Portal do Planalto">Abrir fonte <ArrowIcon /></a></article>
            <article className="source-item"><span className="source-item__type">LEGISLAÇÃO</span><div><h3>Lei Complementar nº 87, de 13 de setembro de 1996 · Lei Kandir</h3><p>Normas gerais do ICMS, com alterações posteriores. Consulte o texto atualizado e as regras específicas pertinentes à operação.</p></div><a href="https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp87.htm" target="_blank" rel="noreferrer" aria-label="Abrir Lei Complementar 87 de 1996 no Portal do Planalto">Abrir fonte <ArrowIcon /></a></article>
            <article className="source-item"><span className="source-item__type">LEGISLAÇÃO</span><div><h3>Lei Complementar nº 190, de 4 de janeiro de 2022</h3><p>Alterou a Lei Kandir para regulamentar a cobrança do ICMS em operações interestaduais destinadas a consumidor final não contribuinte.</p></div><a href="https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp190.htm" target="_blank" rel="noreferrer" aria-label="Abrir Lei Complementar 190 de 2022 no Portal do Planalto">Abrir fonte <ArrowIcon /></a></article>
            <article className="source-item"><span className="source-item__type">LEGISLAÇÃO</span><div><h3>Resolução do Senado Federal nº 22, de 19 de maio de 1989</h3><p>Define 12% como regra geral interestadual e 7% para operações originadas nas Regiões Sul e Sudeste (exceto ES) com destinos regionais previstos no parágrafo único.</p></div><a href="https://legis.senado.leg.br/norma/586152/publicacao/15646891" target="_blank" rel="noreferrer" aria-label="Abrir Resolução do Senado 22 de 1989">Abrir fonte <ArrowIcon /></a></article>
            <article className="source-item"><span className="source-item__type">LEGISLAÇÃO</span><div><h3>Resolução do Senado Federal nº 13, de 25 de abril de 2012</h3><p>Prevê 4% em operações interestaduais com bens importados quando atendidos os critérios e respeitadas as exceções legais de conteúdo de importação e processamento.</p></div><a href="https://legis.senado.leg.br/norma/586999/publicacao?tipoDocumento=RSF&amp;tipoTexto=ATU" target="_blank" rel="noreferrer" aria-label="Abrir Resolução do Senado 13 de 2012">Abrir fonte <ArrowIcon /></a></article>
            <article className="source-item"><span className="source-item__type">LEGISLAÇÃO</span><div><h3>RICMS de Rondônia · Decreto nº 22.721/2018</h3><p>O Anexo I contém alíquotas internas específicas e residuais; 19,5% é regra modal residual desde 12/01/2024, sujeita às exceções e atualizações estaduais.</p></div><a href="https://legislacao.sefin.ro.gov.br/Download?arquivo=72c9e2d5be10c850f17e2de12f8ed220.pdf&amp;nome=D18-22721%20DECRETO%20NOVO%20RICMS%20-%20Consolid.%20ate%20Dec.%2031274-26.pdf" target="_blank" rel="noreferrer" aria-label="Abrir Regulamento do ICMS de Rondônia na SEFIN">Abrir fonte <ArrowIcon /></a></article>
            <article className="source-item"><span className="source-item__type">LEGISLAÇÃO</span><div><h3>Lei Complementar estadual nº 842/2015 · FECOEP/RO</h3><p>O adicional de 2% depende dos produtos e condições legalmente listados; não é aplicado automaticamente a toda operação destinada a Rondônia.</p></div><a href="https://legislacao.sefin.ro.gov.br/Download?arquivo=a25ba834c77832cb55c65319c5196e93.pdf&amp;nome=LC842-2015.pdf" target="_blank" rel="noreferrer" aria-label="Abrir Lei Complementar estadual 842 de 2015 na SEFIN">Abrir fonte <ArrowIcon /></a></article>
            <article className="source-item"><span className="source-item__type">LEGISLAÇÃO</span><div><h3>Lei paulista nº 6.374/1989</h3><p>Os arts. 33 e 34 tratam da composição da base e da alíquota interna geral de 18%, com exceções por mercadoria e operação.</p></div><a href="https://legislacao.fazenda.sp.gov.br/Paginas/lei034.aspx" target="_blank" rel="noreferrer" aria-label="Abrir Lei paulista 6374 de 1989 na Secretaria da Fazenda">Abrir fonte <ArrowIcon /></a></article>
            <article className="source-item"><span className="source-item__type source-item__type--case">JURISPRUDÊNCIA</span><div><h3>STF · Tema 1.093 da repercussão geral</h3><p>RE 1.287.019: a cobrança do diferencial introduzido pela EC nº 87/2015 pressupõe lei complementar que estabeleça normas gerais.</p></div><a href="https://portal.stf.jus.br/jurisprudenciaRepercussao/verAndamentoProcesso.asp?classeProcesso=RE&incidente=5994076&numeroProcesso=1287019&numeroTema=1093" target="_blank" rel="noreferrer" aria-label="Abrir Tema 1093 no portal do STF">Abrir fonte <ArrowIcon /></a></article>
            <article className="source-item"><span className="source-item__type source-item__type--case">JURISPRUDÊNCIA</span><div><h3>STF · ADI 7.066</h3><p>Julgamento sobre a anterioridade nonagesimal prevista no art. 3º da LC nº 190/2022. Esta referência não resume todas as discussões judiciais sobre o DIFAL.</p></div><a href="https://portal.stf.jus.br/processos/detalhe.asp?incidente=6330827" target="_blank" rel="noreferrer" aria-label="Abrir processo ADI 7066 no portal do STF">Abrir fonte <ArrowIcon /></a></article>
          </div>
          <aside className="academic-note"><span className="eyebrow">NOTA ACADÊMICA</span><p>Este material tem finalidade educacional e não substitui a consulta à legislação vigente, à regulamentação estadual ou a uma análise tributária específica.</p></aside>
        </ChapterFrame>
      </main>

      <footer className="site-footer"><a className="brand brand--footer" href="#home"><span className="brand__mark">D</span><span className="brand__name">DIFAL<small>EXPERIENCE</small></span></a><p>Uma apresentação educacional interativa sobre o diferencial de alíquotas do ICMS.</p><span>CONTEÚDO ACADÊMICO · BRASIL</span></footer>

      <div className="chapter-controls" aria-label="Navegação da apresentação"><button type="button" onClick={() => goToChapter(chapters[Math.max(0, activeIndex - 1)]?.id ?? 'conceito')} disabled={activeIndex <= 0} aria-label="Capítulo anterior"><ArrowIcon direction="left" /></button><span><strong>{String(Math.max(1, activeIndex + 1)).padStart(2, '0')}</strong> / {String(chapters.length).padStart(2, '0')}</span><button type="button" onClick={() => goToChapter(chapters[Math.min(chapters.length - 1, activeIndex + 1)]?.id ?? 'fontes')} disabled={activeIndex === chapters.length - 1} aria-label="Próximo capítulo"><ArrowIcon /></button></div>
      <span className="sr-only" aria-live="polite">{isFullscreen ? 'Tela cheia ativa.' : isPresentationMode ? 'Modo de apresentação ativo.' : ''}</span>
    </div>
  )
}

export default App
