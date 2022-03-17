export interface CoffeeSupporter {
  support_note: string
  support_coffees: number
  payer_name: string
}
export interface CoffeeSupportersResponse {
  data: CoffeeSupporter[]
}
