/** Envolve um handler assíncrono de rota Express, repassando erros ao next(). */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/** Erro HTTP simples com statusCode, usado nos serviços/controllers. */
export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}
