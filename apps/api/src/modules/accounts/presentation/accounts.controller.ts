import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse,  ApiCookieAuth } from '@nestjs/swagger';
import { SessionGuard } from '../../../auth/session.guard';
import { 
  CreateAccountUseCase,
  UpdateAccountUseCase,
  DeleteAccountUseCase,
  GetAccountUseCase,
  ListAccountsUseCase
} from '../application/use-cases';
import { CreateAccountDto, UpdateAccountDto, AccountDto } from '../presentation/dtos';

@ApiTags('Accounts')
@ApiCookieAuth('session_id')
@UseGuards(SessionGuard)
@Controller({ path: 'accounts', version: '1' })
export class AccountsController {
  constructor(
    private readonly createAccountUseCase: CreateAccountUseCase,
    private readonly updateAccountUseCase: UpdateAccountUseCase,
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
    private readonly getAccountUseCase: GetAccountUseCase,
    private readonly listAccountsUseCase: ListAccountsUseCase
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all active accounts for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Return all accounts.', type: [AccountDto] })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findAll(@Request() req: any) {
    const userId = req.user.id;
    return this.listAccountsUseCase.execute(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account details' })
  @ApiResponse({ status: 200, description: 'Return account details.', type: AccountDto })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.getAccountUseCase.execute(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'The account has been successfully created.', type: AccountDto })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(@Body() createAccountDto: CreateAccountDto, @Request() req: any) {
    const userId = req.user.id;
    return this.createAccountUseCase.execute(userId, createAccountDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an account' })
  @ApiResponse({ status: 200, description: 'The account has been successfully updated.', type: AccountDto })
  async update(
    @Param('id') id: string, 
    @Body() updateAccountDto: UpdateAccountDto, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: any
  ) {
    const userId = req.user.id;
    return this.updateAccountUseCase.execute(id, userId, updateAccountDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive an account' })
  @ApiResponse({ status: 204, description: 'The account has been successfully archived.' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    await this.deleteAccountUseCase.execute(id, userId);
  }
}
