import type { TextlintRuleModule } from "@textlint/types";

import noArbitraryLineBreak from "@cffnpwr/textlint-rule-no-arbitrary-line-break";
import noDash from "@cffnpwr/textlint-rule-no-dash";
import noDoubledAdditiveConjunction from "@cffnpwr/textlint-rule-no-doubled-additive-conjunction";
import sentencePerLine from "@cffnpwr/textlint-rule-sentence-per-line";

const preset: {
  rules: Record<string, TextlintRuleModule>;
  rulesConfig: Record<string, boolean>;
} = {
  rules: {
    "no-dash": noDash,
    "sentence-per-line": sentencePerLine,
    "no-arbitrary-line-break": noArbitraryLineBreak,
    "no-doubled-additive-conjunction": noDoubledAdditiveConjunction,
  },
  rulesConfig: {
    "no-dash": true,
    "sentence-per-line": true,
    "no-arbitrary-line-break": true,
    "no-doubled-additive-conjunction": true,
  },
};

export default preset;
