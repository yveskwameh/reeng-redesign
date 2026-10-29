import { faq } from '../content/faq'

export const idOf = (q: string) => `faq-${faq.findIndex((f) => f.q === q)}`

/** One question: the whole row toggles it; the answer grows open under it. */
export function QA({
  q,
  a,
  open,
  onToggle,
  className = '',
  rowClassName = 'py-5',
}: {
  q: string
  a: string
  open: boolean
  onToggle: () => void
  className?: string
  rowClassName?: string
}) {
  const id = idOf(q)
  return (
    <li className={className}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
          className={`flex w-full cursor-pointer items-center justify-between gap-6 text-left text-base text-ink md:text-lg ${rowClassName}`}
        >
          {q}
          <span
            aria-hidden
            className={`flex size-7 shrink-0 items-center justify-center rounded-full text-lg leading-none transition duration-300 ${
              open ? 'rotate-45 bg-violet text-white' : 'bg-mist text-ink'
            }`}
          >
            +
          </span>
        </button>
      </h3>
      <div id={id} className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <p className="overflow-hidden pr-10 text-ash">
          <span className="block pb-5">{a}</span>
        </p>
      </div>
    </li>
  )
}
