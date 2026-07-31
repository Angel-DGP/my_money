export const UNIT_OF_WORK = Symbol('UNIT_OF_WORK');

export interface IUnitOfWork {
  /**
   * Executes a callback within a transactional context.
   * Any repository operations invoked inside the callback should participate in the same transaction.
   * @param work The callback to execute.
   * @returns The result of the callback.
   */
  execute<T>(work: () => Promise<T>): Promise<T>;
}
