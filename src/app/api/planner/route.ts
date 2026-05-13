import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const dataPath = path.join(dataDir, "planner.json");

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export async function GET() {
  try {
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json(null, { status: 404 });
    }
    const content = fs.readFileSync(dataPath, "utf-8");
    return NextResponse.json(JSON.parse(content));
  } catch {
    return NextResponse.json({ error: "Failed to read planner data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    ensureDataDir();
    fs.writeFileSync(dataPath, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json(body);
  } catch {
    return NextResponse.json({ error: "Failed to save planner data" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  return POST(req);
}
