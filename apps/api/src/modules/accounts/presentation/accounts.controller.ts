import { AuthenticatedRequest } from '../../../common/interfaces/authenticated-request.interface';
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
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { 
  CreateAccountUseCase,
  UpdateAccountUseCase,
  DeleteAccountUseCase,
  GetAccountUseCase,
  ListAccountsUseCase
} from '../application/use-cases';
import { CreateAccountDto, UpdateAccountDto, AccountDto } from '../presentation/dtos';
import { ApiResponse as CustomApiResponse } from '@mymoney/shared';

@ApiTags('Accounts')
@ApiCookieAuth('session_id')
@UseGuards(JwtAuthGuard)
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
  async findAll(@Request() req: AuthenticatedRequest): Promise<CustomApiResponse<AccountDto[]>> {
    const userId = req.user.id;
    const data = await this.listAccountsUseCase.execute(userId);
    return { data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account details' })
  @ApiResponse({ status: 200, description: 'Return account details.', type: AccountDto })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest): Promise<CustomApiResponse<AccountDto>> {
    const userId = req.user.id;
    const data = await this.getAccountUseCase.execute(id, userId);
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'The account has been successfully created.', type: AccountDto })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(@Body() createAccountDto: CreateAccountDto, @Request() req: AuthenticatedRequest): Promise<CustomApiResponse<AccountDto>> {
    const userId = req.user.id;
    const data = await this.createAccountUseCase.execute(userId, createAccountDto);
    return { data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an account' })
  @ApiResponse({ status: 200, description: 'The account has been successfully updated.', type: AccountDto })
  async update(
    @Param('id') id: string, 
    @Body() updateAccountDto: UpdateAccountDto, 
  @Request() req: AuthenticatedRequest
  ): Promise<CustomApiResponse<AccountDto>> {
    const userId = req.user.id;
    const data = await this.updateAccountUseCase.execute(id, userId, updateAccountDto);
    return { data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive an account' })
  @ApiResponse({ status: 204, description: 'The account has been successfully archived.' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    await this.deleteAccountUseCase.execute(id, userId);
  }
}
