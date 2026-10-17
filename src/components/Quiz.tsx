import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { quizQuestions } from '../data/quiz'

interface QuizProps {
  onGoContent: () => void
}

export function Quiz({ onGoContent }: QuizProps) {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [draftSelection, setDraftSelection] = useState<number | null>(null)
  const [confirmedSelection, setConfirmedSelection] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [finished, setFinished] = useState(false)
  const [showAllExplanations, setShowAllExplanations] = useState(false)
  const question = quizQuestions[questionIndex]!
  const incorrectQuestions = useMemo(() => quizQuestions.flatMap((item, index) => answers[index] === item.correctIndex ? [] : [{ item, index }]), [answers])
  const score = answers.reduce((total, answer, index) => total + Number(answer === quizQuestions[index]?.correctIndex), 0)
  const percentage = Math.round(score / quizQuestions.length * 100)

  const confirmAnswer = () => {
    if (draftSelection === null || confirmedSelection !== null) return
    setConfirmedSelection(draftSelection)
    setAnswers((current) => [...current, draftSelection])
  }

  const continueQuiz = () => {
    if (confirmedSelection === null) return
    if (questionIndex === quizQuestions.length - 1) {
      setFinished(true)
      return
    }
    setQuestionIndex((current) => current + 1)
    setDraftSelection(null)
    setConfirmedSelection(null)
  }

  const restart = () => {
    setQuestionIndex(0)
    setDraftSelection(null)
    setConfirmedSelection(null)
    setAnswers([])
    setFinished(false)
    setShowAllExplanations(false)
  }

  if (finished) {
    const message = score <= 3
      ? 'Vale revisar alguns conceitos fundamentais.'
      : score <= 6
        ? 'Você compreendeu boa parte do conteúdo.'
        : 'Excelente domínio dos conceitos apresentados.'
    const reviewList = showAllExplanations
      ? quizQuestions.map((item, index) => ({ item, index }))
      : incorrectQuestions

    return (
      <div className="quiz-result" aria-live="polite">
        <div className="quiz-result__summary">
          <div className="score-ring" style={{ '--score': `${percentage}%` } as CSSProperties} role="img" aria-label={`${percentage}% de aproveitamento`}><span>{percentage}<small>%</small></span></div>
          <div>
            <p className="eyebrow">PERCURSO CONCLUÍDO</p>
            <h3>{message}</h3>
            <p>Este resultado é um recurso de revisão, não uma certificação de conhecimento.</p>
            <div className="score-stats"><span><strong>{score}</strong> acertos</span><span><strong>{quizQuestions.length - score}</strong> erros</span><span><strong>{percentage}%</strong> aproveitamento</span></div>
          </div>
        </div>
        <div className="quiz-review">
          <div className="quiz-review__heading"><div><span className="eyebrow">REVISÃO DO APRENDIZADO</span><h4>{incorrectQuestions.length === 0 ? 'Você acertou todas.' : 'Conceitos para revisar'}</h4></div>
            <button className="text-button" type="button" onClick={() => setShowAllExplanations((current) => !current)}>{showAllExplanations ? 'Ver somente erros' : 'Ver respostas e explicações'}</button></div>
          {reviewList.length === 0 ? <p className="quiz-review__empty">As oito respostas estão corretas. Você pode rever todas as explicações ou retornar ao conteúdo.</p> : <ol className="quiz-review__list">{reviewList.map(({ item, index }) => <li key={item.topic}>
            <span className="quiz-review__topic">{String(index + 1).padStart(2, '0')} · {item.topic}</span>
            <p>{item.prompt}</p>
            <small>{answers[index] === item.correctIndex ? 'Sua resposta foi correta.' : `Sua resposta: ${item.options[answers[index] ?? 0]}`}</small>
            <strong>Resposta correta: {item.options[item.correctIndex]}</strong>
            <small>{item.explanation}</small>
          </li>)}</ol>}
        </div>
        <div className="quiz-result__actions"><button className="button button--light" type="button" onClick={restart}>Refazer quiz <span aria-hidden="true">↻</span></button><button className="button button--outline-light" type="button" onClick={onGoContent}>Voltar ao conteúdo <span aria-hidden="true">↑</span></button></div>
      </div>
    )
  }

  return (
    <div className="quiz" aria-label="Quiz de revisão">
      <div className="quiz__progress-row"><span>QUESTÃO {String(questionIndex + 1).padStart(2, '0')} / {String(quizQuestions.length).padStart(2, '0')}</span><span>{answers.length} respondida{answers.length === 1 ? '' : 's'}</span></div>
      <div className="quiz__progress" role="progressbar" aria-valuemin={0} aria-valuemax={quizQuestions.length} aria-valuenow={questionIndex + 1} aria-label="Progresso do quiz"><span style={{ width: `${(questionIndex + 1) / quizQuestions.length * 100}%` }} /></div>
      <span className="quiz__topic">{question.topic}</span>
      <h3 className="quiz__question">{question.prompt}</h3>
      <div className="quiz__options" role="group" aria-label="Escolha uma resposta">
        {question.options.map((option, index) => {
          const isDraft = draftSelection === index
          const isCorrect = confirmedSelection !== null && index === question.correctIndex
          const isWrongChoice = confirmedSelection === index && !isCorrect
          return <button key={option} type="button" className={`quiz-option${isDraft ? ' is-selected' : ''}${isCorrect ? ' is-correct' : ''}${isWrongChoice ? ' is-incorrect' : ''}`} onClick={() => setDraftSelection(index)} aria-pressed={isDraft} disabled={confirmedSelection !== null}>
            <span className="quiz-option__letter">{String.fromCharCode(65 + index)}</span><span>{option}</span><span className="quiz-option__mark" aria-hidden="true">{isCorrect ? '✓' : isWrongChoice ? '×' : ''}</span>
          </button>
        })}
      </div>
      {confirmedSelection === null ? <button className="button button--light quiz__confirm" type="button" disabled={draftSelection === null} onClick={confirmAnswer}>Confirmar resposta <span aria-hidden="true">→</span></button> : <div className={`quiz__feedback${confirmedSelection === question.correctIndex ? ' quiz__feedback--correct' : ' quiz__feedback--incorrect'}`} role="status">
        <strong>{confirmedSelection === question.correctIndex ? 'Resposta correta.' : 'Resposta incorreta.'}</strong>
        <p>{question.explanation}</p>
        <button className="button button--light" type="button" onClick={continueQuiz}>{questionIndex === quizQuestions.length - 1 ? 'Ver resultado' : 'Próxima questão'} <span aria-hidden="true">→</span></button>
      </div>}
      <p className="quiz__note">Sem tempo limite. A resposta só é avaliada após a confirmação.</p>
    </div>
  )
}
