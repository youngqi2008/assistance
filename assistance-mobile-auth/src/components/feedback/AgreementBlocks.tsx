import type {
  AgreementBlock,
  AgreementDocKey,
  AgreementTableCell,
} from '../../agreements/agreementContent'

function TableCellView({
  cell,
  onOpenDoc,
}: {
  cell: AgreementTableCell
  onOpenDoc?: (docKey: AgreementDocKey) => void
}) {
  if (typeof cell === 'string') {
    return cell
  }

  if (cell.kind === 'text') {
    return cell.text
  }

  if (!onOpenDoc) {
    return '协议不存在'
  }

  return (
    <button
      type="button"
      className="text-left text-[var(--color-primary)] underline underline-offset-2"
      onClick={() => onOpenDoc(cell.docKey)}
    >
      {cell.text}
    </button>
  )
}

function BlockView({
  block,
  onOpenDoc,
}: {
  block: AgreementBlock
  onOpenDoc?: (docKey: AgreementDocKey) => void
}) {
  if (block.kind === 'table') {
    return (
      <div className="my-2 overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-[12px] leading-5">
          <tbody>
            {block.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    colSpan={typeof cell === 'object' && cell.kind === 'text' ? cell.colSpan : undefined}
                    className="border border-[#dfe3e8] px-2 py-1 align-top text-[var(--color-text-primary)]"
                  >
                    <TableCellView cell={cell} onOpenDoc={onOpenDoc} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  switch (block.kind) {
    case 'h1':
      return <h3 className="mt-4 text-center text-[16px] font-semibold leading-snug text-[var(--color-text-primary)] first:mt-0">{block.text}</h3>
    case 'h2':
      return <h4 className="mt-4 text-[14px] font-semibold leading-snug text-[var(--color-text-primary)]">{block.text}</h4>
    case 'h3':
      return <h5 className="mt-3 text-[13px] font-semibold leading-snug text-[var(--color-text-primary)]">{block.text}</h5>
    case 'b':
      return <p className="mt-3 whitespace-pre-wrap text-[13px] font-semibold leading-6 text-[var(--color-text-primary)]">{block.text}</p>
    case 'li':
      return (
        <p className="mt-1 flex gap-2 whitespace-pre-wrap text-[13px] leading-6 text-[var(--color-text-secondary)]">
          <span aria-hidden="true" className="shrink-0">·</span>
          <span>{block.text}</span>
        </p>
      )
    default:
      return <p className="mt-2 whitespace-pre-wrap text-[13px] leading-6 text-[var(--color-text-secondary)]">{block.text}</p>
  }
}

type AgreementBlocksProps = {
  blocks: AgreementBlock[]
  onOpenDoc?: (docKey: AgreementDocKey) => void
}

export function AgreementBlocks({ blocks, onOpenDoc }: AgreementBlocksProps) {
  return (
    <>
      {blocks.map((block, idx) => (
        <BlockView key={idx} block={block} onOpenDoc={onOpenDoc} />
      ))}
    </>
  )
}
