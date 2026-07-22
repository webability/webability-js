// Cliente base para la API de WebAbility (https://api.webability.info).
//
// Firma cada request con HMAC-SHA256 (headers X-WA-Client, X-WA-Timestamp,
// X-WA-Digest) — mismo esquema que el SDK de Go
// (github.com/webability/webability-go/wa). El Token nunca viaja en el
// request: solo se usa localmente para calcular el digest.
//
// Requiere Node.js 18+ (usa `fetch` y `node:crypto`, ambos incluidos sin
// dependencias adicionales).

import { createHmac } from "node:crypto";

export const DEFAULT_BASE_URL = "https://api.webability.info";

// buildMessage construye el mensaje canónico a firmar:
// "{METODO}|{PATH}|{TIMESTAMP}|{CLIENTID}". path debe ser la ruta del
// request sin query string.
export function buildMessage(method, path, timestamp, clientId) {
  return `${method}|${path}|${timestamp}|${clientId}`;
}

// ApiError representa un error devuelto por la API en formato
// {status, code, message}, o un error HTTP genérico si el body no trae ese formato.
export class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(`wa api error ${code ?? statusCode}: ${message}`);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

// Response es la respuesta cruda de un request a la API.
export class Response {
  constructor(statusCode, headers, body) {
    this.statusCode = statusCode;
    this.headers = headers;
    this.body = body; // Buffer/Uint8Array crudo
  }

  // decode parsea el body como JSON.
  decode() {
    const text = Buffer.from(this.body).toString("utf-8");
    return text ? JSON.parse(text) : {};
  }
}

export class WaApi {
  constructor(clientId, token, baseUrl = DEFAULT_BASE_URL) {
    this.clientId = clientId;
    this.token = token;
    this.baseUrl = baseUrl;
  }

  // digest retorna hex(HMAC-SHA256(this.token, message)).
  digest(message) {
    return createHmac("sha256", this.token).update(message).digest("hex");
  }

  // request firma y envía un request HTTP a la API.
  // path debe ser la ruta absoluta (ej: "/v1/dns/zone"), sin el host y sin
  // query string. body, si no es null/undefined, se codifica como JSON y se
  // envía como cuerpo del request.
  async request(method, path, body) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const message = buildMessage(method, path, timestamp, this.clientId);

    const headers = {
      "X-WA-Client": this.clientId,
      "X-WA-Timestamp": timestamp,
      "X-WA-Digest": this.digest(message),
    };

    let requestBody;
    if (body !== undefined && body !== null) {
      headers["Content-Type"] = "application/json";
      requestBody = JSON.stringify(body);
    }

    let res;
    try {
      res = await fetch(this.baseUrl + path, { method, headers, body: requestBody });
    } catch (err) {
      throw new Error(`enviando request: ${err.message}`);
    }

    const buf = new Uint8Array(await res.arrayBuffer());
    const result = new Response(res.status, res.headers, buf);

    if (res.status >= 400) {
      let parsed = {};
      try {
        parsed = result.decode();
      } catch {
        // body no era JSON; se ignora, cae al mensaje genérico de abajo
      }
      if (parsed && parsed.message) {
        throw new ApiError(res.status, parsed.code, parsed.message);
      }
      throw new Error(`error HTTP ${res.status}`);
    }

    return result;
  }

  // get envía un GET a path.
  get(path) {
    return this.request("GET", path);
  }

  // post envía un POST a path con body codificado en JSON.
  post(path, body) {
    return this.request("POST", path, body);
  }

  // put envía un PUT a path con body codificado en JSON.
  put(path, body) {
    return this.request("PUT", path, body);
  }

  // delete envía un DELETE a path.
  delete(path) {
    return this.request("DELETE", path);
  }
}
