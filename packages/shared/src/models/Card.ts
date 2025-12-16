import { Card as CardType, CreateCardRequest, UpdateCardRequest } from '../types'

export class CardModel {
  static toDTO(card: any): CardType {
    return {
      id: card.id,
      name: card.name,
      cardNumber: card.card_number,
      barcodeData: card.barcode_data || undefined,
      balance: card.balance ? Number(card.balance) : undefined,
      balanceLastUpdated: card.balance_last_updated
        ? new Date(card.balance_last_updated)
        : undefined,
      imageUrl: card.image_url || undefined,
      createdAt: new Date(card.created_at),
      updatedAt: new Date(card.updated_at),
    }
  }

  static toDatabase(card: CreateCardRequest | UpdateCardRequest): any {
    const dbCard: any = {}
    if ('name' in card && card.name) dbCard.name = card.name
    if ('cardNumber' in card && card.cardNumber)
      dbCard.card_number = card.cardNumber
    if ('barcodeData' in card && card.barcodeData)
      dbCard.barcode_data = card.barcodeData
    if ('imageUrl' in card && card.imageUrl) dbCard.image_url = card.imageUrl
    return dbCard
  }
}

