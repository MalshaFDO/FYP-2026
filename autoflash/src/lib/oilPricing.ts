export type OilPriceMap = Record<string, number>;

export const oilPricing: Record<string, OilPriceMap> = {
  toyota: {
    "0W-20": 4500,
    "0W-30": 4300,
    "5W-30": 4000,
    "10W-30": 3500,
    "10W-40": 3200,
  },

  mobil: {
    "0W-20": 4200,
    "5W-30": 3800,
    "10W-40": 3000,
  },

  castrol: {
    "0W-20": 4300,
    "5W-30": 3900,
    "10W-40": 3100,
  },

  honda: {
    "0W-20": 4600,
    "5W-30": 4200,
  },
};
