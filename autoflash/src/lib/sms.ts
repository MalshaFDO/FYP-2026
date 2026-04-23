import axios from "axios";

const SMS_API_URL = process.env.SMS_API_URL;
const SMS_USERNAME = process.env.SMS_USERNAME;
const SMS_PASSWORD = process.env.SMS_PASSWORD;
const SMS_SENDER_ID = process.env.SMS_SENDER_ID;
const SMS_TYPE = process.env.SMS_TYPE || "0";

function normalizeGatewayPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("94")) {
    return digits;
  }

  if (digits.startsWith("0") && digits.length === 10) {
    return `94${digits.slice(1)}`;
  }

  return digits;
}

export async function sendOtpSms(phone: string, otp: string) {
  if (!SMS_API_URL || !SMS_USERNAME || !SMS_PASSWORD || !SMS_SENDER_ID) {
    throw new Error(
      "SMS gateway settings are missing. Set SMS_API_URL, SMS_USERNAME, SMS_PASSWORD, and SMS_SENDER_ID."
    );
  }

  const formattedPhone = normalizeGatewayPhone(phone);
  const message = `Your AutoFlash verification code is ${otp}. It expires in 5 minutes.`;

  const response = await axios.post(SMS_API_URL, null, {
    params: {
      m: message,
      r: formattedPhone,
      a: SMS_SENDER_ID,
      u: SMS_USERNAME,
      p: SMS_PASSWORD,
      t: SMS_TYPE,
    },
  });

  if (response.data !== 200 && response.data !== "200") {
    throw new Error(`Mobitel SMS gateway rejected the request with code: ${response.data}`);
  }
}
