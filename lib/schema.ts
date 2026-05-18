export type DrugStatus = 'VERIFIED' | 'FLAGGED' | 'UNKNOWN'
export type InteractionStatus = 'SAFE' | 'CAUTION' | 'DANGEROUS'

export interface Drug {
  id: string
  name: string
  nafdacNumber: string
  manufacturer: string
  activeIngredient: string
  dosage: string
  category: string
  status: DrugStatus
  alternatives: string[]
  lastVerified: string
}

export interface InteractionResult {
  drugs: string[]
  status: InteractionStatus
  explanation: string
  recommendation: string
  checkedAt: string
}

export interface VerifyResponse {
  source: 'registry' | 'ai'
  drug: Drug
  warning?: string
  explanation?: string
}

export interface VerifyFallback {
  name: string
  nafdacNumber: string
  manufacturer: string
  status: DrugStatus
  activeIngredient: string
  alternatives: string[]
  explanation?: string
  warning?: string
}

export interface InteractionApiPayload {
  status: InteractionStatus
  explanation: string
  recommendation: string
}
