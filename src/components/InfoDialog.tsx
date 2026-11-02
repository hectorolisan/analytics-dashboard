import { ExternalLink, Info, X } from 'lucide-react'
import { useRef, type ReactNode } from 'react'
import { Credit } from './Credit'

const link = 'inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline'

export function InfoButton({ className = '', labelClassName = '' }: { className?: string; labelClassName?: string }) {
  const ref = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button
        type="button"
        title="Sobre los datos"
        onClick={() => ref.current?.showModal()}
        className={className}
      >
        <Info className="size-4 shrink-0" aria-hidden />
        <span className={labelClassName}>Sobre los datos</span>
      </button>
      <dialog
        ref={ref}
        aria-labelledby="info-title"
        // clic en el fondo cierra
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
        className="card m-auto max-h-[85dvh] w-[min(40rem,calc(100%-2rem))] flex-col overflow-hidden p-0 text-foreground backdrop:bg-black/50 backdrop:backdrop-blur-sm open:flex"
      >
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6 text-sm leading-relaxed">
          <header className="flex items-start gap-3">
            <div className="mr-auto">
              <p className="text-[11px] font-semibold tracking-[0.3em] text-muted-foreground uppercase">Sobre los datos</p>
              <h2 id="info-title" className="mt-1 text-2xl">
                Sistema eléctrico peninsular
              </h2>
            </div>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
            >
              <X className="size-4" />
              <span className="sr-only">Cerrar</span>
            </button>
          </header>

          <p>
            Demanda y generación eléctrica por tecnología de la península ibérica española, del 1 ene 2008 al 13 may 2026,
            publicadas por Red Eléctrica (REE) como datos abiertos.
          </p>

          <Block title="Origen">
            <ul className="space-y-1.5">
              <li>
                Dataset{' '}
                <a className={link} href="https://huggingface.co/datasets/daniel-dona/ree-data" target="_blank" rel="noreferrer">
                  daniel-dona/ree-data
                  <ExternalLink className="size-3" aria-hidden />
                </a>{' '}
                en Hugging Face · licencia CC BY 4.0.
              </li>
              <li>
                Datos originales de la API de{' '}
                <a className={link} href="https://www.ree.es/" target="_blank" rel="noreferrer">
                  Red Eléctrica
                  <ExternalLink className="size-3" aria-hidden />
                </a>
                : 1.931.443 registros en MW cada 5 minutos.
              </li>
            </ul>
          </Block>

          <Block title="Procesado">
            <ul className="list-disc space-y-1.5 pl-5 marker:text-muted-foreground">
              <li>
                Agregado por día con DuckDB (<code className="text-xs">scripts/build_dataset.py</code>): potencia media × 24 h = GWh/día. El pico es
                el máximo de los registros de 5 min.
              </li>
              <li>Se descartan los días con menos de 200 registros.</li>
              <li>Los periodos de más de 90 días se agrupan por semanas o bloques de 4 semanas.</li>
            </ul>
          </Block>

          <Block title="A tener en cuenta">
            <ul className="list-disc space-y-1.5 pl-5 marker:text-muted-foreground">
              <li>Solar = fotovoltaica + térmica. Hidráulica es neta: los días de bombeo puede ser negativa.</li>
              <li>«Cogeneración y otras» incluye cogeneración, gas natural, vapor y autogeneración.</li>
              <li>
                Antes de 2015 REE agrupa solar térmica, biomasa y cogeneración en el régimen especial, así que la cuota renovable de esos años
                sale por debajo de la real.
              </li>
              <li>En REE el saldo internacional negativo es exportación (comprobado con el balance generación − demanda).</li>
            </ul>
          </Block>
        </div>
        <footer className="border-t px-6 py-4">
          <Credit />
        </footer>
      </dialog>
    </>
  )
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 font-sans text-xs font-semibold tracking-[0.3em] text-muted-foreground uppercase">{title}</h3>
      {children}
    </section>
  )
}
