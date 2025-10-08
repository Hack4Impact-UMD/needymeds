import nock from "nock";
import { DSNTService } from "../services/dsnt.service";

// mock the secrets module so we don't hit AWS locally
jest.mock("../secrets/secrets", () => ({
  getDSNTSecret: async () => ({
    username: "u", password: "p",
    baseUrl: "https://argusprod.dstsystems.com/pharmacy-drug-pricing/1.0/service"
  })
}));

describe("DSNTService.priceByNDC", () => {
  const service = new DSNTService();
  const host = "https://argusprod.dstsystems.com";

  afterEach(() => nock.cleanAll());

  it("returns data on 200", async () => {
    nock(host)
      .get("/pharmacy-drug-pricing/1.0/service/PharmacyPricing")
      .query({ quantity: "100", ndc: "59148000713", radius: "100", zipCode: "10003" })
      .reply(200, { prices: [{ pharmacyId: "X", price: 12.34 }] });

    const data = await service.priceByNDC({
      ndc: "59148000713", quantity: 100, radius: 100, zipCode: "10003",
    });
    expect(data).toEqual({ prices: [{ pharmacyId: "X", price: 12.34 }] });
  });

  it("bubbles 4xx with safe message", async () => {
    nock(host)
      .get("/pharmacy-drug-pricing/1.0/service/PharmacyPricing")
      .query({ quantity: "100", ndc: "59148000713", radius: "100", zipCode: "10003" })
      .reply(400, { message: "bad request" });

    await expect(service.priceByNDC({
      ndc: "59148000713", quantity: 100, radius: 100, zipCode: "10003",
    })).rejects.toMatchObject({ message: "DS&T returned 400", status: 400 });
  });

  it("retries on 502 then succeeds", async () => {
    const scope = nock(host)
      .get(/PharmacyPricing/).twice().reply(502, {})
      .get(/PharmacyPricing/).reply(200, { ok: true });

    const data = await service.priceByNDC({
      ndc: "59148000713", quantity: 100, radius: 5, zipCode: "10003",
    });
    expect(data).toEqual({ ok: true });
    expect(scope.isDone()).toBe(true);
  });
});
