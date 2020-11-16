import { Font } from "../../Font.js";
import { testGSUB } from "./gsub/test-gsub.js";

const font = new Font("mehr nastaliq");

describe("Basic font testing", () => {
  beforeAll((done) => {
    font.onerror = (err) => {
      throw err;
    };
    font.onload = async () => done();
    font.src = "./fonts/MehrNastaliqWeb-Regular.ttf";
  });

  test("font loaded", () => {
    expect(font.opentype).toBeDefined();
  });

  test("GSUB format 6/8 functionality", () => {
    testGSUB(font, {
      script: [],
      feature: [],
      lookup: [
        type6LookupTest,
        type8LookupTest,
      ]
    })
  });
});

function type6LookupTest(font, script, langsys, feature, lookupId, lookup) {
  if (lookup.lookupType !== 6) return;
  console.log(script, langsys, feature, lookupId);
}

function type8LookupTest(font, script, langsys, feature, lookupId, lookup) {
  if (lookup.lookupType !== 6) return;
  console.log(script, langsys, feature, lookupId);
}
