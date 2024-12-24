export interface Contact {
  id: string
  entityId: string
  contactType: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  title?: string
  isPrimary: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateContactInput {
  contactType: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  title?: string
  isPrimary?: boolean
} 