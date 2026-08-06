import React, { useState } from 'react';
import { Button, Input, Label, MoneyInput, Select, FormLayout, PageContainer } from '@mymoney/ui';
import type { Account, CreateAccountDto, UpdateAccountDto, AccountType, Currency } from '@entities/account';
import { useInstitutions } from '../../catalogs/api/useCatalogs';

interface AccountFormProps {
  initialData?: Account | null;
  onSubmit: (data: CreateAccountDto | UpdateAccountDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AccountForm({ initialData, onSubmit, onCancel, isLoading }: AccountFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<AccountType>(initialData?.type || 'CHECKING');
  const [currency] = useState<Currency>(initialData?.currency || 'USD');
  const [initialBalance, setInitialBalance] = useState(initialData?.current_balance.value || '0.00');
  const [institutionId, setInstitutionId] = useState(initialData?.institution_id || '');
  const [specificType, setSpecificType] = useState(initialData?.specific_type || '');

  const { data: institutions } = useInstitutions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (initialData) {
      onSubmit({
        name,
        type,
        currency,
        institution_id: institutionId || undefined,
        specific_type: specificType || undefined,
      });
    } else {
      onSubmit({
        name,
        type,
        currency,
        initial_balance: initialBalance,
        color: '#10B981',
        icon: 'wallet',
        institution_id: institutionId || undefined,
        specific_type: specificType || undefined,
      });
    }
  };

  return (
    <FormLayout onSubmit={handleSubmit}>
      <div className="col-span-12 space-y-1">
        <Label htmlFor="name">Nombre de la cuenta</Label>
        <Input 
          id="name" 
          name="name"
          placeholder="Ej: Ahorros Banreservas" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
      </div>

      <div className="col-span-12 md:col-span-6 space-y-1">
        <Select 
          id="type"
          name="type"
          label="Tipo General"
          value={type}
          onChange={(e) => setType(e.target.value as AccountType)}
          disabled={!!initialData}
        >
          <option value="CHECKING">Corriente</option>
          <option value="SAVINGS">Ahorros</option>
          <option value="CASH">Efectivo</option>
          <option value="CREDIT">Tarjeta de Crédito</option>
          <option value="INVESTMENT">Inversión</option>
        </Select>
      </div>

      <div className="col-span-12 md:col-span-6 space-y-1">
        <Select 
          id="institution_id"
          name="institution_id"
          label="Institución (Opcional)"
          value={institutionId}
          onChange={(e) => setInstitutionId(e.target.value)}
          searchable
        >
          <option value="">Selecciona una institución...</option>
          {institutions?.map(i => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </Select>
      </div>

      <div className="col-span-12 space-y-1">
        <Label htmlFor="specific_type">Tipo Específico (Ej: Ahorro Flexible) - Opcional</Label>
        <Input 
          id="specific_type" 
          name="specific_type"
          placeholder="Ej: Ahorro Flexible, Plan Jubilación..." 
          value={specificType} 
          onChange={(e) => setSpecificType(e.target.value)} 
        />
      </div>

      {!initialData && (
        <div className="col-span-12 space-y-1">
          <Label htmlFor="initial_balance">Balance Inicial</Label>
          <MoneyInput
            id="initial_balance"
            name="initial_balance"
            value={parseFloat(initialBalance) || 0}
            onValueChange={(val) => setInitialBalance(val?.toString() || '0')}
          />
        </div>
      )}

      <PageContainer.Footer className="col-span-12">
        <Button type="button" variant="outline" onClick={onCancel} disabled={!!isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!!isLoading}>
          {isLoading ? 'Guardando...' : initialData ? 'Guardar Cambios' : 'Crear Cuenta'}
        </Button>
      </PageContainer.Footer>
    </FormLayout>
  );
}
