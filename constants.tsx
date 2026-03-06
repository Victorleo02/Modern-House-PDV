
import React from 'react';
import { Vendor } from './types';

export const STORE_INFO = {
  name: 'Modern House',
  razonSocial: 'Modern House Móveis e Decorações LTDA',
  cnpj: '12.345.678/0001-90',
  address: 'Av. das Indústrias, 1500 - Setor Corporativo, São Paulo - SP',
  phone: '(11) 4002-8922'
};

export const INITIAL_VENDORS: Vendor[] = [
  { code: 'V001', name: 'Carlos Oliveira' },
  { code: 'V002', name: 'Ana Silva' },
  { code: 'V003', name: 'Roberto Santos' }
];

export const BARCODE_PREFIX = 'MH';
