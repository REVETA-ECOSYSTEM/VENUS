import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { analyzeProperty, PropertyAnalysisRequest } from "@venus/landmark";

type RouteResult = {
  statusCode: number;
  body: unknown;
};

export async function routeRequest(method: string, path: string, body?: unknown): Promise<RouteResult> {
  if (method === "GET" && path === "/health") {
    return { statusCode: 200, body: { status: "ok" } };
  }

  if (method === "POST" && path === "/landmark/analyze-property") {
    const analysis = analyzeProperty(body as PropertyAnalysisRequest);
    return { statusCode: 200, body: analysis };
  }

  return {
    statusCode: 404,
    body: {
      error: "not_found",
      message: `No route registered for ${method} ${path}`
    }
  };
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) return undefined;
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

export function createApiGatewayServer() {
  return createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const result = await routeRequest(req.method ?? "GET", url.pathname, await readJson(req));
    res.writeHead(result.statusCode, { "content-type": "application/json" });
    res.end(JSON.stringify(result.body));
  });
}

if (process.env.VENUS_API_GATEWAY_LISTEN === "true") {
  const port = Number(process.env.PORT ?? 3000);
  createApiGatewayServer().listen(port, () => {
    console.log(`VENUS API Gateway listening on :${port}`);
  });
}
