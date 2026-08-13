import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITransactionRepository, TRANSACTION_REPOSITORY } from '../../domain/transaction.repository.interface';
import { TransactionDto } from '../../presentation/dtos/transaction.dto';

/**
 * Use case: Obtener una transacción por ID verificando propiedad del usuario.
 *
 * Devuelve `NotFoundException` si la transacción no existe o no pertenece al usuario,
 * evitando filtrar información sobre existencia de recursos de otros usuarios.
 */
@Injectable()
export class GetTransactionByIdUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(id: string, userId: string): Promise<TransactionDto> {
    // Pasa userId para filtrado a nivel de DB (defensa en profundidad)
    const transaction = await this.transactionRepository.findById(id, userId);

    if (!transaction) {
      throw new NotFoundException(`Transaction with id "${id}" not found`);
    }

    return TransactionDto.fromDomain(transaction);
  }
}

