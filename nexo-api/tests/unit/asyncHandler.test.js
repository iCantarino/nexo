import { describe, it } from "node:test";
import assert from "node:assert";
import { asyncHandler, HttpError } from "../../src/utils/asyncHandler.js";

describe("asyncHandler", () => {
  it("deve repassar erro assíncrono para next", async () => {
    const erro = new Error("falha");
    const fn = async () => {
      throw erro;
    };
    const next = (err) => {
      assert.strictEqual(err, erro);
    };
    asyncHandler(fn)({}, {}, next);
  });

  it("deve executar handler bem-sucedido sem chamar next", async () => {
    const fn = async (req, res) => {
      res.ok = true;
    };
    const res = {};
    const next = () => {
      throw new Error("next não deveria ser chamado");
    };
    await asyncHandler(fn)({}, res, next);
    assert.strictEqual(res.ok, true);
  });
});

describe("HttpError", () => {
  it("deve armazenar statusCode e message", () => {
    const err = new HttpError(404, "Não encontrado");
    assert.strictEqual(err.statusCode, 404);
    assert.strictEqual(err.message, "Não encontrado");
  });
});
