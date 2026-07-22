// dns.js — módulo DNS: zonas y registros del cliente. Envuelve /v1/dns/*.
//
// Nota de diseño: los objetos que entran y salen de este módulo usan
// exactamente los mismos nombres de campo que el JSON de la API (snake_case:
// rrtype, rrtypename, primaryns, defaultttl, etc.), sin convertir a camelCase.
// Es intencional: menos superficie de mapeo = menos riesgo de bugs, y es el
// mismo shape que devuelve `fetch(...).json()` directamente.

export class Dns {
  constructor(api) {
    this.api = api;
  }

  // listZones lista las zonas (dominios) del cliente. GET /v1/dns/zone
  // -> { status, zones: [Zone], count }
  async listZones() {
    const resp = await this.api.get("/v1/dns/zone");
    return resp.decode();
  }

  // getZone obtiene una zona (por clave numérica o por nombre de dominio)
  // junto con sus registros. GET /v1/dns/zone/{key|domain}
  // -> { status, zone: Zone, records: [Record], ns: [string] }
  async getZone(keyOrDomain) {
    const resp = await this.api.get(`/v1/dns/zone/${encodeURIComponent(String(keyOrDomain))}`);
    return resp.decode();
  }

  // addZone crea una nueva zona. POST /v1/dns/zone
  // -> { status, key, name }
  async addZone(name) {
    const resp = await this.api.post("/v1/dns/zone", { name });
    return resp.decode();
  }

  // addRecord agrega un registro a una zona. POST /v1/dns/zone/{key}/record
  // record: { name, rrtype, ttl, data, priority?, weight?, port?, tag? }
  // -> { status, key, zone }
  async addRecord(zoneKey, record) {
    const resp = await this.api.post(`/v1/dns/zone/${zoneKey}/record`, record);
    return resp.decode();
  }

  // updateRecord modifica un registro existente. PUT /v1/dns/record/{key}
  // fields: objeto con SOLO los campos a cambiar
  //   (name, ttl, data, priority, weight, port, tag, status) — los que no
  //   incluyas no se tocan.
  // -> { status, key }
  async updateRecord(recordKey, fields) {
    const resp = await this.api.put(`/v1/dns/record/${recordKey}`, fields);
    return resp.decode();
  }

  // deleteRecord elimina un registro. DELETE /v1/dns/record/{key}
  // -> { status, key }
  async deleteRecord(recordKey) {
    const resp = await this.api.delete(`/v1/dns/record/${recordKey}`);
    return resp.decode();
  }

  // deleteZone elimina una zona y todos sus registros. DELETE /v1/dns/zone/{key}
  // -> { status, key, name }
  async deleteZone(zoneKey) {
    const resp = await this.api.delete(`/v1/dns/zone/${zoneKey}`);
    return resp.decode();
  }
}
