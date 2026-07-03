// 🚧 En construcción.
//
// Cliente base para la API de WebAbility (https://api.webability.info).
// Seguirá el mismo esquema de autenticación que el cliente Go de referencia
// (github.com/webability/webability-go): ClientID + Token, firma HMAC-SHA256 en los
// headers X-WA-Client / X-WA-Timestamp / X-WA-Digest. El Token nunca viaja
// en el request.

export class WaApi {
  constructor(clientId, token, baseUrl = "https://api.webability.info") {
    this.clientId = clientId;
    this.token = token;
    this.baseUrl = baseUrl;
  }
}
