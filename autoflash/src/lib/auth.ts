import jwt from "jsonwebtoken";

export function getUserFromToken(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      throw new Error("No token provided");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, "SECRET_KEY") as {
      userId: string;
      email: string;
    };

    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
}