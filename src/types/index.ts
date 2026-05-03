export type UserRole         = 'client' | 'lawyer' | 'admin'
export type CaseStatus       = 'draft' | 'pending_review' | 'open' | 'assigned' | 'closed' | 'disputed'
export type CaseCategory     = 'landlord' | 'consumer' | 'contract' | 'employment' | 'family' | 'other'
export type BidStatus        = 'submitted' | 'accepted' | 'rejected' | 'withdrawn'
export type TransactionStatus = 'escrow' | 'released' | 'refunded'

export interface Profile {
  id: string; email: string; role: UserRole
  full_name: string | null; avatar_url: string | null
  created_at: string; updated_at: string
}

export interface LawyerProfile {
  id: string; profile_id: string; bar_number: string
  jurisdictions: string[]; specialties: string[]; bio: string | null
  stripe_account_id: string | null; is_verified: boolean
  id_document_url: string | null; created_at: string; updated_at: string
}

export interface Case {
  id: string; client_id: string
  original_description: string; anonymized_description: string | null
  category: CaseCategory; jurisdiction: string
  budget_min: number; budget_max: number
  status: CaseStatus; is_anonymous: boolean
  created_at: string; updated_at: string
}

export interface Bid {
  id: string; case_id: string; lawyer_id: string
  price: number; cover_letter: string; turnaround_hours: number
  status: BidStatus; created_at: string; updated_at: string
}

export interface Transaction {
  id: string; case_id: string; bid_id: string | null
  amount: number; fee: number; net_lawyer: number
  status: TransactionStatus
  stripe_payment_intent_id: string | null; stripe_transfer_id: string | null
  created_at: string; updated_at: string
}

export interface Review {
  id: string; case_id: string; client_id: string; lawyer_id: string
  rating: number; comment: string | null; created_at: string
}

export interface Message {
  id: string; case_id: string; sender_id: string
  content: string; created_at: string
}
