// 🚧 Stub — calca el contrato del SDK de Go (github.com/webability/webability-go/mail).
//
// La capa de transporte (index.js) ya está implementada; lo que falta aquí es
// conectar send()/status() a request()/get()/post(). Los nombres de campo
// usan snake_case (rrtype-style, igual que el wire JSON) por consistencia con
// dns.js — sin conversión a camelCase.

/** Estados posibles de queue_status en el resultado de send()/status(). */
export const QueueStatus = Object.freeze({
  PENDING: "pending",
  PROCESSING: "processing",
  SENT: "sent",
  ERROR: "error",
});

export class Mail {
  constructor(api) {
    this.api = api;
  }

  /**
   * Envía un correo a un solo destinatario. POST /v1/mail/send
   *
   * req: {
   *   from: { email, name },
   *   to: { email, name, vars },
   *   subject, html, text, tags,
   *   track_opens, track_clicks,
   *   wait_send, // si es true, el servidor espera (hasta ~20s) el resultado
   *              // real antes de responder, en vez de "pending" inmediato.
   * }
   * -> { status, queue_key, queue_status, error_detail, to }
   *
   * 🚧 Pendiente de implementar.
   */
  async send(req) {
    throw new Error("Mail.send() aún no está implementado en el SDK de JS.");
  }

  /**
   * Consulta el estatus real de un envío hecho con send().
   * GET /v1/mail/status/{queue_key}
   * -> { status, queue_key, queue_status, error_detail }
   *
   * 🚧 Pendiente de implementar.
   */
  async status(queueKey) {
    throw new Error("Mail.status() aún no está implementado en el SDK de JS.");
  }
}
