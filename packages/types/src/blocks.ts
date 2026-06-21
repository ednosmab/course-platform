import { z } from 'zod';

/**
 * Contract para blocos com estado interactivos.
 * Todo bloco que precisa de save DEVE implementar estas props.
 *
 * Exemplo de uso:
 * ```tsx
 * type QuizState = { selectedOptionId: string | null; submitted: boolean };
 * type Props = { block: QuizBlock } & InteractiveBlockProps<QuizState>;
 *
 * function QuizBlockRenderer({ block, defaultState, onStateChange }: Props) {
 *   const [selected, setSelected] = useState(defaultState?.selectedOptionId ?? null);
 *   // ...
 *   onStateChange?.(block.id, { selectedOptionId: selected, submitted: true });
 * }
 * ```
 */
export interface InteractiveBlockProps<TState> {
  /** Estado restaurado do banco de dados (null na primeira vez) */
  defaultState?: TState | null;
  /** Chamado quando o utilizador altera o estado do bloco */
  onStateChange?: (blockId: string, state: TState) => void;
}

/**
 * Schema Zod para estado saveable de um bloco interactiva.
 * Usado para auto-descoberta: se o bloco tem stateSchema, é interactiva.
 */
export const InteractiveStateSchema = z.object({
  interactive: z.literal(true).optional(),
  stateSchema: z.record(z.string(), z.any()).optional(),
}).strict();

/**
 * Verifica se um bloco tem estado interactiva.
 * Baseado na presença de `stateSchema` no schema Zod do bloco.
 */
export function isInteractiveBlock(block: { type: string; [key: string]: unknown }): boolean {
  return 'stateSchema' in block && block.stateSchema !== undefined;
}
