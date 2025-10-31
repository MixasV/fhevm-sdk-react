/**
 * Tests for new error classes
 */

import {
  NetworkError,
  ContractError,
  WalletError,
  FHEVMError,
} from '../errors'

describe('New Error classes', () => {
  describe('NetworkError', () => {
    test('should create network error', () => {
      const error = new NetworkError('Network failed')
      
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(FHEVMError)
      expect(error).toBeInstanceOf(NetworkError)
      expect(error.code).toBe('NETWORK_ERROR')
      expect(error.message).toBe('Network failed')
      expect(error.name).toBe('NetworkError')
    })

    test('should have proper stack trace', () => {
      const error = new NetworkError('Test error')
      expect(error.stack).toBeDefined()
      expect(error.stack).toContain('NetworkError')
    })
  })

  describe('ContractError', () => {
    test('should create contract error', () => {
      const error = new ContractError('Contract call failed')
      
      expect(error).toBeInstanceOf(FHEVMError)
      expect(error).toBeInstanceOf(ContractError)
      expect(error.code).toBe('CONTRACT_ERROR')
      expect(error.message).toBe('Contract call failed')
      expect(error.name).toBe('ContractError')
    })
  })

  describe('WalletError', () => {
    test('should create wallet error', () => {
      const error = new WalletError('Wallet connection failed')
      
      expect(error).toBeInstanceOf(FHEVMError)
      expect(error).toBeInstanceOf(WalletError)
      expect(error.code).toBe('WALLET_ERROR')
      expect(error.message).toBe('Wallet connection failed')
      expect(error.name).toBe('WalletError')
    })
  })

  describe('Error inheritance', () => {
    test('all custom errors should be catchable as FHEVMError', () => {
      const errors = [
        new NetworkError('test'),
        new ContractError('test'),
        new WalletError('test'),
      ]

      errors.forEach(error => {
        expect(error).toBeInstanceOf(FHEVMError)
        expect(error.code).toBeDefined()
      })
    })

    test('all custom errors should be catchable as Error', () => {
      const errors = [
        new NetworkError('test'),
        new ContractError('test'),
        new WalletError('test'),
      ]

      errors.forEach(error => {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe('test')
      })
    })
  })
})
