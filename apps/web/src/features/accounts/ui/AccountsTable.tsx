import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Icon, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Amount } from '@mymoney/ui';
import { Account } from '../../../entities/account/types/account.types';

interface AccountsTableProps {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

export function AccountsTable({ accounts, onEdit, onDelete }: AccountsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead align="right">Balance Actual</TableHead>
          <TableHead align="right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((account) => (
          <TableRow key={account.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: account.color || '#E5E7EB' }}
                >
                  <Icon name={(account.icon as any) || 'wallet'} size="sm" className="text-white mix-blend-difference" />
                </div>
                <span className="font-medium text-text-base">{account.name}</span>
              </div>
            </TableCell>
            <TableCell>
              <span className="text-sm text-text-muted">{account.type}</span>
            </TableCell>
            <TableCell align="right">
              <Amount 
                value={parseFloat(account.current_balance.value)} 
              />
            </TableCell>
            <TableCell align="right">
              <Dropdown>
                <DropdownTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label="Opciones">
                    <Icon name="more-horizontal" size="sm" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu align="end">
                  <DropdownItem onClick={() => onEdit(account)}>
                    <Icon name="pencil" size="sm" className="mr-2" />
                    Editar
                  </DropdownItem>
                  <DropdownItem 
                    variant="danger" 
                    onClick={() => onDelete(account)}
                  >
                    <Icon name="trash-2" size="sm" className="mr-2" />
                    Eliminar
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
