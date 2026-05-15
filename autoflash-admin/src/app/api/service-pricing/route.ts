import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ServicePricing from "@/models/servicePricing";

const normalizeNumber = (value: unknown) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeRow = (row: any = {}) => ({
  quickWash: normalizeNumber(row.quickWash),
  bodywashVacuum: normalizeNumber(row.bodywashVacuum),
  washVacuumWax: normalizeNumber(row.washVacuumWax),
  fullBodywash: normalizeNumber(row.fullBodywash),
  fullService: normalizeNumber(row.fullService),
  engineWash: normalizeNumber(row.engineWash),
  brakeService: normalizeNumber(row.brakeService),
  oilChange: normalizeNumber(row.oilChange),
  oilFilter: normalizeNumber(row.oilFilter),
  underBodyWash: normalizeNumber(row.underBodyWash),
  windowWasher: normalizeNumber(row.windowWasher),
  caliperGrease: normalizeNumber(row.caliperGrease),
  brakeCaliperLube: normalizeNumber(row.brakeCaliperLube),
  brakeDrumCleaning: normalizeNumber(row.brakeDrumCleaning),
  sumpWasher: normalizeNumber(row.sumpWasher),
  chemicalCost: normalizeNumber(row.chemicalCost),
  rexine: normalizeNumber(row.rexine),
  interiorFumigation: normalizeNumber(row.interiorFumigation),
  n2: normalizeNumber(row.n2),
  serviceCharge: normalizeNumber(row.serviceCharge),
});

const buildPayload = (body: any) => ({
  bodywash: {
    sedan: normalizeRow(body?.bodywash?.sedan),
    suv: normalizeRow(body?.bodywash?.suv),
    pickup: normalizeRow(body?.bodywash?.pickup),
    minivan: normalizeRow(body?.bodywash?.minivan),
  },
  fullService: {
    sedan: normalizeRow(body?.fullService?.sedan),
    suv: normalizeRow(body?.fullService?.suv),
    pickup: normalizeRow(body?.fullService?.pickup),
    minivan: normalizeRow(body?.fullService?.minivan),
  },
  bodywashAddons: {
    leatherTreatment: normalizeNumber(body?.bodywashAddons?.leatherTreatment),
    rainX: normalizeNumber(body?.bodywashAddons?.rainX),
    tarRemoval: normalizeNumber(body?.bodywashAddons?.tarRemoval),
    engineWash: {
      sedan: normalizeNumber(body?.bodywashAddons?.engineWash?.sedan),
      suv: normalizeNumber(body?.bodywashAddons?.engineWash?.suv),
      pickup: normalizeNumber(body?.bodywashAddons?.engineWash?.pickup),
      minivan: normalizeNumber(body?.bodywashAddons?.engineWash?.minivan),
    },
    headLightPolish: normalizeNumber(body?.bodywashAddons?.headLightPolish),
    underBodyWax: {
      sedan: normalizeNumber(body?.bodywashAddons?.underBodyWax?.sedan),
      suv: normalizeNumber(body?.bodywashAddons?.underBodyWax?.suv),
      pickup: normalizeNumber(body?.bodywashAddons?.underBodyWax?.pickup),
      minivan: normalizeNumber(body?.bodywashAddons?.underBodyWax?.minivan),
    },
  },
  fullServiceAddons: {
    wheelAlignment: normalizeNumber(body?.fullServiceAddons?.wheelAlignment),
    brakeFluid: normalizeNumber(body?.fullServiceAddons?.brakeFluid),
    coolantFlush: normalizeNumber(body?.fullServiceAddons?.coolantFlush),
    batteryHealth: normalizeNumber(body?.fullServiceAddons?.batteryHealth),
    tireRotation: normalizeNumber(body?.fullServiceAddons?.tireRotation),
    engineWash: {
      sedan: normalizeNumber(body?.fullServiceAddons?.engineWash?.sedan),
      suv: normalizeNumber(body?.fullServiceAddons?.engineWash?.suv),
      pickup: normalizeNumber(body?.fullServiceAddons?.engineWash?.pickup),
      minivan: normalizeNumber(body?.fullServiceAddons?.engineWash?.minivan),
    },
    quickWash: {
      sedan: normalizeNumber(body?.fullServiceAddons?.quickWash?.sedan),
      suv: normalizeNumber(body?.fullServiceAddons?.quickWash?.suv),
      pickup: normalizeNumber(body?.fullServiceAddons?.quickWash?.pickup),
      minivan: normalizeNumber(body?.fullServiceAddons?.quickWash?.minivan),
    },
    bodywashVacuum: {
      sedan: normalizeNumber(body?.fullServiceAddons?.bodywashVacuum?.sedan),
      suv: normalizeNumber(body?.fullServiceAddons?.bodywashVacuum?.suv),
      pickup: normalizeNumber(body?.fullServiceAddons?.bodywashVacuum?.pickup),
      minivan: normalizeNumber(body?.fullServiceAddons?.bodywashVacuum?.minivan),
    },
    washVacuumWax: {
      sedan: normalizeNumber(body?.fullServiceAddons?.washVacuumWax?.sedan),
      suv: normalizeNumber(body?.fullServiceAddons?.washVacuumWax?.suv),
      pickup: normalizeNumber(body?.fullServiceAddons?.washVacuumWax?.pickup),
      minivan: normalizeNumber(body?.fullServiceAddons?.washVacuumWax?.minivan),
    },
    fullBodywash: {
      sedan: normalizeNumber(body?.fullServiceAddons?.fullBodywash?.sedan),
      suv: normalizeNumber(body?.fullServiceAddons?.fullBodywash?.suv),
      pickup: normalizeNumber(body?.fullServiceAddons?.fullBodywash?.pickup),
      minivan: normalizeNumber(body?.fullServiceAddons?.fullBodywash?.minivan),
    },
  },
  quote: {
    oilFilter: normalizeNumber(body?.quote?.oilFilter || body?.fullService?.sedan?.oilFilter || 2500),
    serviceCharge: normalizeNumber(body?.quote?.serviceCharge || body?.fullService?.sedan?.serviceCharge || 3000),
  },
});

export async function GET() {
  try {
    await connectDB();
    const doc = await ServicePricing.findOne({}).lean();
    return NextResponse.json({
      success: true,
      config: doc || buildPayload({}),
    });
  } catch (error: any) {
    console.error("FETCH SERVICE PRICING ERROR:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load service pricing" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const config = buildPayload(body);

    const doc = await ServicePricing.findOneAndUpdate(
      {},
      { $set: config },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();

    return NextResponse.json({ success: true, config: doc || config });
  } catch (error: any) {
    console.error("UPDATE SERVICE PRICING ERROR:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save service pricing" },
      { status: 500 }
    );
  }
}
