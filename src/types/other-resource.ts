interface OtherResource {
  id: string;
  details: string;
  name: string;
  category: "Tool" | "Equipment" | "Material";
  quantity: number;
  pricingType: "fixed" | "hourly";
  price: number;
}
