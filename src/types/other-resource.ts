export interface OtherResource {
  id: string;
  name: string;
  details: string;
  category: "Tool" | "Equipment" | "Materials";
  quantity: number;
  pricePerQuantity: number;
  provider: string;
}
