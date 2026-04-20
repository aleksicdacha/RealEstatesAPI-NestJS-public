let counter = 0;

export function createMockClient(overrides: Partial<any> = {}): any {
  counter++;
  return {
    id: `uuid-client-${counter}`,
    status: 'active',
    name: `Client ${counter}`,
    address: `Address ${counter}`,
    email: `client${counter}@test.com`,
    phone: `+38160000${String(counter).padStart(4, '0')}`,
    transactionType: 'seller',
    paymentType: 'cash',
    comment: null,
    moneyAmount: null,
    ownerJmbg: null,
    ownerBirthplace: null,
    ownerIdCardNumber: null,
    ownerIdCardIssuePlace: null,
    property: null,
    representative: null,
    ...overrides,
  };
}
