import { describe, expect, test } from "@jest/globals";
import { expectations } from "./expectations.js";

function testGSUB(tables) {
  const { cmap, name, GSUB } = tables;

  expect(GSUB).toBeDefined();
  expect(cmap).toBeDefined();
  expect(name).toBeDefined();

  function letterFor(glyphid) {
    let reversed = cmap.reverse(glyphid);
    return reversed.unicode ?? `[${glyphid}:??]`;
  }

  let scripts = GSUB.getSupportedScripts();
  expect(scripts).toEqual(Object.keys(expectations));

  scripts.forEach((script) => {
    let langsys = GSUB.getSupportedLangSys(script);

    expect(langsys).toEqual(expectations[script].langsys);

    langsys.forEach((lang) => {
      let langSysTable = GSUB.getLangSysTable(script, lang);
      let features = GSUB.getFeatures(langSysTable);
      let featureCount = features.length;

      expect(featureCount).toEqual(expectations[script].features[lang].length);

      features.forEach((feature) => {
        const lookupIDs = feature.lookupListIndices;

        expect(lookupIDs).toEqual(
          expectations[script].features[lang].lookups[feature.featureTag]
        );

        lookupIDs.forEach((id) => {
          const lookup = GSUB.getLookup(id);

          // one-for-one substitutions
          if (lookup.lookupType === 1) {
            lookup.subtableOffsets.forEach((_, i) => {
              const subtable = lookup.getSubTable(i);
              const coverage = subtable.getCoverageTable();
              let glyphs = coverage.glyphArray;
              if (!glyphs) {
                glyphs = coverage.rangeRecords.map(
                  (r) => `${r.startGlyphID}-${r.endGlyphID}`
                );
              }
            });
          }

          // ligature substitutions
          if (lookup.lookupType === 4) {
            lookup.subtableOffsets.forEach((_, i) => {
              const subtable = lookup.getSubTable(i);
              const coverage = subtable.getCoverageTable();

              subtable.ligatureSetOffsets.forEach((_, setIndex) => {
                const ligatureSet = subtable.getLigatureSet(setIndex);

                ligatureSet.ligatureOffsets.forEach((_, ligIndex) => {
                  const ligatureTable = ligatureSet.getLigature(ligIndex);

                  const sequence = [
                    coverage.glyphArray[setIndex],
                    ...ligatureTable.componentGlyphIDs,
                  ];

                  // console.log(
                  //   `ligature set [${setIndex}], ligature table [${ligIndex}]: ${script}[${lang}].${feature.featureTag}[${id}]: ligature (coverage:${coverage.coverageFormat}) [ ${
                  //     sequence.map(letterFor).join(` + `)
                  //   } ] -> ${
                  //     letterFor(ligatureTable.ligatureGlyph)
                  //   }`
                  // );
                });
              });
            });
          }
        }); // end lookup foreach
      }); // end feature foreach
    }); // end langsys foreach
  }); // end script foreach
}

export { testGSUB };
