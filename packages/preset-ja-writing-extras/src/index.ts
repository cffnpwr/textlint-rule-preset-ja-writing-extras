import noDash from "@cffnpwr/textlint-rule-no-dash";
import noDoubledAdditiveConjunction from "@cffnpwr/textlint-rule-no-doubled-additive-conjunction";
import sentencePerLine from "@cffnpwr/textlint-rule-sentence-per-line";

export default {
  rules: {
    "no-dash": noDash,
    "sentence-per-line": sentencePerLine,
    "no-doubled-additive-conjunction": noDoubledAdditiveConjunction,
  },
  rulesConfig: {
    "no-dash": true,
    "sentence-per-line": true,
    "no-doubled-additive-conjunction": true,
  },
};
