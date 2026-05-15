export type VehicleTypeKey = "sedan" | "suv" | "pickup" | "minivan";

export type PricingRow = {
  quickWash: number;
  bodywashVacuum: number;
  washVacuumWax: number;
  fullBodywash: number;
  fullService: number;
  engineWash: number;
  brakeService: number;
  oilChange: number;
  oilFilter: number;
  underBodyWash: number;
  windowWasher: number;
  caliperGrease: number;
  brakeCaliperLube: number;
  brakeDrumCleaning: number;
  sumpWasher: number;
  chemicalCost: number;
  rexine: number;
  interiorFumigation: number;
  n2: number;
  serviceCharge: number;
};

export type ServicePricingConfig = {
  bodywash: Record<VehicleTypeKey, PricingRow>;
  fullService: Record<VehicleTypeKey, PricingRow>;
  bodywashAddons: {
    leatherTreatment: number;
    rainX: number;
    tarRemoval: number;
    engineWash: Record<VehicleTypeKey, number>;
    headLightPolish: number;
    underBodyWax: Record<VehicleTypeKey, number>;
  };
  fullServiceAddons: {
    wheelAlignment: number;
    brakeFluid: number;
    coolantFlush: number;
    batteryHealth: number;
    tireRotation: number;
    engineWash: Record<VehicleTypeKey, number>;
    quickWash: Record<VehicleTypeKey, number>;
    bodywashVacuum: Record<VehicleTypeKey, number>;
    washVacuumWax: Record<VehicleTypeKey, number>;
    fullBodywash: Record<VehicleTypeKey, number>;
  };
  quote: {
    oilFilter: number;
    serviceCharge: number;
  };
};

const row = (values: Partial<PricingRow>): PricingRow => ({
  quickWash: 0,
  bodywashVacuum: 0,
  washVacuumWax: 0,
  fullBodywash: 0,
  fullService: 0,
  engineWash: 0,
  brakeService: 0,
  oilChange: 0,
  oilFilter: 0,
  underBodyWash: 0,
  windowWasher: 0,
  caliperGrease: 0,
  brakeCaliperLube: 0,
  brakeDrumCleaning: 0,
  sumpWasher: 0,
  chemicalCost: 0,
  rexine: 0,
  interiorFumigation: 0,
  n2: 0,
  serviceCharge: 0,
  ...values,
});

export const defaultServicePricingConfig: ServicePricingConfig = {
  bodywash: {
    sedan: row({ quickWash: 900, bodywashVacuum: 1450, washVacuumWax: 1950, fullBodywash: 3600 }),
    suv: row({ quickWash: 1100, bodywashVacuum: 1750, washVacuumWax: 2250, fullBodywash: 4100 }),
    pickup: row({ quickWash: 1250, bodywashVacuum: 2000, washVacuumWax: 2450, fullBodywash: 4600 }),
    minivan: row({ quickWash: 1550, bodywashVacuum: 2400, washVacuumWax: 2800, fullBodywash: 4850 }),
  },
  fullService: {
    sedan: row({ fullService: 4650, engineWash: 1750, brakeService: 1950, oilChange: 1650, oilFilter: 2500, underBodyWash: 1750, windowWasher: 450, caliperGrease: 450, brakeCaliperLube: 450, brakeDrumCleaning: 500, sumpWasher: 400, chemicalCost: 550, rexine: 600, interiorFumigation: 450, n2: 200, serviceCharge: 3000 }),
    suv: row({ fullService: 5650, engineWash: 1950, brakeService: 1950, oilChange: 1950, oilFilter: 2500, underBodyWash: 1950, windowWasher: 450, caliperGrease: 450, brakeCaliperLube: 450, brakeDrumCleaning: 500, sumpWasher: 400, chemicalCost: 550, rexine: 650, interiorFumigation: 450, n2: 200, serviceCharge: 3000 }),
    pickup: row({ fullService: 5750, engineWash: 2450, brakeService: 1950, oilChange: 1950, oilFilter: 2500, underBodyWash: 3250, windowWasher: 450, caliperGrease: 450, brakeCaliperLube: 500, brakeDrumCleaning: 400, sumpWasher: 400, chemicalCost: 550, rexine: 650, interiorFumigation: 450, n2: 200, serviceCharge: 3000 }),
    minivan: row({ fullService: 5950, engineWash: 1950, brakeService: 1950, oilChange: 1950, oilFilter: 2500, underBodyWash: 2800, windowWasher: 450, caliperGrease: 450, brakeCaliperLube: 450, brakeDrumCleaning: 500, sumpWasher: 400, chemicalCost: 550, rexine: 650, interiorFumigation: 450, n2: 200, serviceCharge: 3000 }),
  },
  bodywashAddons: {
    leatherTreatment: 3850,
    rainX: 650,
    tarRemoval: 650,
    engineWash: {
      sedan: 1750,
      suv: 1950,
      pickup: 2450,
      minivan: 1950,
    },
    headLightPolish: 1200,
    underBodyWax: {
      sedan: 1600,
      suv: 1950,
      pickup: 2450,
      minivan: 2800,
    },
  },
  fullServiceAddons: {
    wheelAlignment: 3500,
    brakeFluid: 1800,
    coolantFlush: 2500,
    batteryHealth: 750,
    tireRotation: 1500,
    engineWash: {
      sedan: 1750,
      suv: 1950,
      pickup: 2450,
      minivan: 1950,
    },
    quickWash: {
      sedan: 900,
      suv: 1100,
      pickup: 1250,
      minivan: 1550,
    },
    bodywashVacuum: {
      sedan: 1450,
      suv: 1750,
      pickup: 2000,
      minivan: 2400,
    },
    washVacuumWax: {
      sedan: 1950,
      suv: 2250,
      pickup: 2450,
      minivan: 2800,
    },
    fullBodywash: {
      sedan: 3600,
      suv: 4100,
      pickup: 4600,
      minivan: 4850,
    },
  },
  quote: {
    oilFilter: 2500,
    serviceCharge: 3000,
  },
};

export const mapServicePricingConfig = (config: any): ServicePricingConfig => ({
  bodywash: {
    sedan: { ...defaultServicePricingConfig.bodywash.sedan, ...(config?.bodywash?.sedan || {}) },
    suv: { ...defaultServicePricingConfig.bodywash.suv, ...(config?.bodywash?.suv || {}) },
    pickup: { ...defaultServicePricingConfig.bodywash.pickup, ...(config?.bodywash?.pickup || {}) },
    minivan: { ...defaultServicePricingConfig.bodywash.minivan, ...(config?.bodywash?.minivan || {}) },
  },
  fullService: {
    sedan: { ...defaultServicePricingConfig.fullService.sedan, ...(config?.fullService?.sedan || {}) },
    suv: { ...defaultServicePricingConfig.fullService.suv, ...(config?.fullService?.suv || {}) },
    pickup: { ...defaultServicePricingConfig.fullService.pickup, ...(config?.fullService?.pickup || {}) },
    minivan: { ...defaultServicePricingConfig.fullService.minivan, ...(config?.fullService?.minivan || {}) },
  },
  bodywashAddons: {
    leatherTreatment: Number(config?.bodywashAddons?.leatherTreatment ?? defaultServicePricingConfig.bodywashAddons.leatherTreatment),
    rainX: Number(config?.bodywashAddons?.rainX ?? defaultServicePricingConfig.bodywashAddons.rainX),
    tarRemoval: Number(config?.bodywashAddons?.tarRemoval ?? defaultServicePricingConfig.bodywashAddons.tarRemoval),
    engineWash: {
      sedan: Number(config?.bodywashAddons?.engineWash?.sedan ?? defaultServicePricingConfig.bodywashAddons.engineWash.sedan),
      suv: Number(config?.bodywashAddons?.engineWash?.suv ?? defaultServicePricingConfig.bodywashAddons.engineWash.suv),
      pickup: Number(config?.bodywashAddons?.engineWash?.pickup ?? defaultServicePricingConfig.bodywashAddons.engineWash.pickup),
      minivan: Number(config?.bodywashAddons?.engineWash?.minivan ?? defaultServicePricingConfig.bodywashAddons.engineWash.minivan),
    },
    headLightPolish: Number(config?.bodywashAddons?.headLightPolish ?? defaultServicePricingConfig.bodywashAddons.headLightPolish),
    underBodyWax: {
      sedan: Number(config?.bodywashAddons?.underBodyWax?.sedan ?? defaultServicePricingConfig.bodywashAddons.underBodyWax.sedan),
      suv: Number(config?.bodywashAddons?.underBodyWax?.suv ?? defaultServicePricingConfig.bodywashAddons.underBodyWax.suv),
      pickup: Number(config?.bodywashAddons?.underBodyWax?.pickup ?? defaultServicePricingConfig.bodywashAddons.underBodyWax.pickup),
      minivan: Number(config?.bodywashAddons?.underBodyWax?.minivan ?? defaultServicePricingConfig.bodywashAddons.underBodyWax.minivan),
    },
  },
  fullServiceAddons: {
    wheelAlignment: Number(config?.fullServiceAddons?.wheelAlignment ?? defaultServicePricingConfig.fullServiceAddons.wheelAlignment),
    brakeFluid: Number(config?.fullServiceAddons?.brakeFluid ?? defaultServicePricingConfig.fullServiceAddons.brakeFluid),
    coolantFlush: Number(config?.fullServiceAddons?.coolantFlush ?? defaultServicePricingConfig.fullServiceAddons.coolantFlush),
    batteryHealth: Number(config?.fullServiceAddons?.batteryHealth ?? defaultServicePricingConfig.fullServiceAddons.batteryHealth),
    tireRotation: Number(config?.fullServiceAddons?.tireRotation ?? defaultServicePricingConfig.fullServiceAddons.tireRotation),
    engineWash: {
      sedan: Number(config?.fullServiceAddons?.engineWash?.sedan ?? defaultServicePricingConfig.fullServiceAddons.engineWash.sedan),
      suv: Number(config?.fullServiceAddons?.engineWash?.suv ?? defaultServicePricingConfig.fullServiceAddons.engineWash.suv),
      pickup: Number(config?.fullServiceAddons?.engineWash?.pickup ?? defaultServicePricingConfig.fullServiceAddons.engineWash.pickup),
      minivan: Number(config?.fullServiceAddons?.engineWash?.minivan ?? defaultServicePricingConfig.fullServiceAddons.engineWash.minivan),
    },
    quickWash: {
      sedan: Number(config?.fullServiceAddons?.quickWash?.sedan ?? defaultServicePricingConfig.fullServiceAddons.quickWash.sedan),
      suv: Number(config?.fullServiceAddons?.quickWash?.suv ?? defaultServicePricingConfig.fullServiceAddons.quickWash.suv),
      pickup: Number(config?.fullServiceAddons?.quickWash?.pickup ?? defaultServicePricingConfig.fullServiceAddons.quickWash.pickup),
      minivan: Number(config?.fullServiceAddons?.quickWash?.minivan ?? defaultServicePricingConfig.fullServiceAddons.quickWash.minivan),
    },
    bodywashVacuum: {
      sedan: Number(config?.fullServiceAddons?.bodywashVacuum?.sedan ?? defaultServicePricingConfig.fullServiceAddons.bodywashVacuum.sedan),
      suv: Number(config?.fullServiceAddons?.bodywashVacuum?.suv ?? defaultServicePricingConfig.fullServiceAddons.bodywashVacuum.suv),
      pickup: Number(config?.fullServiceAddons?.bodywashVacuum?.pickup ?? defaultServicePricingConfig.fullServiceAddons.bodywashVacuum.pickup),
      minivan: Number(config?.fullServiceAddons?.bodywashVacuum?.minivan ?? defaultServicePricingConfig.fullServiceAddons.bodywashVacuum.minivan),
    },
    washVacuumWax: {
      sedan: Number(config?.fullServiceAddons?.washVacuumWax?.sedan ?? defaultServicePricingConfig.fullServiceAddons.washVacuumWax.sedan),
      suv: Number(config?.fullServiceAddons?.washVacuumWax?.suv ?? defaultServicePricingConfig.fullServiceAddons.washVacuumWax.suv),
      pickup: Number(config?.fullServiceAddons?.washVacuumWax?.pickup ?? defaultServicePricingConfig.fullServiceAddons.washVacuumWax.pickup),
      minivan: Number(config?.fullServiceAddons?.washVacuumWax?.minivan ?? defaultServicePricingConfig.fullServiceAddons.washVacuumWax.minivan),
    },
    fullBodywash: {
      sedan: Number(config?.fullServiceAddons?.fullBodywash?.sedan ?? defaultServicePricingConfig.fullServiceAddons.fullBodywash.sedan),
      suv: Number(config?.fullServiceAddons?.fullBodywash?.suv ?? defaultServicePricingConfig.fullServiceAddons.fullBodywash.suv),
      pickup: Number(config?.fullServiceAddons?.fullBodywash?.pickup ?? defaultServicePricingConfig.fullServiceAddons.fullBodywash.pickup),
      minivan: Number(config?.fullServiceAddons?.fullBodywash?.minivan ?? defaultServicePricingConfig.fullServiceAddons.fullBodywash.minivan),
    },
  },
  quote: {
    oilFilter: Number(config?.quote?.oilFilter ?? defaultServicePricingConfig.quote.oilFilter),
    serviceCharge: Number(config?.quote?.serviceCharge ?? defaultServicePricingConfig.quote.serviceCharge),
  },
});

export async function fetchServicePricingConfig() {
  try {
    const res = await fetch("/api/service-pricing", { cache: "no-store" });
    const data = await res.json();
    if (res.ok && data?.success) {
      return mapServicePricingConfig(data.config);
    }
  } catch (error) {
    console.error("Fetch service pricing error:", error);
  }

  return defaultServicePricingConfig;
}
