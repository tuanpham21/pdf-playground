import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePDFLoader } from '../../hooks/usePDFLoader'

describe('usePDFLoader', () => {
  beforeEach(() => {
    // Reset state between tests
  })

  it('should initialize with null PDF and not loading', () => {
    const { result } = renderHook(() => usePDFLoader())

    expect(result.current.pdf).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should provide file picker function', () => {
    const { result } = renderHook(() => usePDFLoader())

    expect(typeof result.current.openFilePicker).toBe('function')
  })

  it('should provide loadFromUrl function', () => {
    const { result } = renderHook(() => usePDFLoader())

    expect(typeof result.current.loadFromUrl).toBe('function')
  })

  it('should provide loadFromFile function', () => {
    const { result } = renderHook(() => usePDFLoader())

    expect(typeof result.current.loadFromFile).toBe('function')
  })
})
