import TextLintTester from "textlint-tester";

import rule from "./index.ts";

const tester = new TextLintTester();
tester.run("no-doubled-additive-conjunction", rule, {
  valid: [
    "text",
    {
      text: "It is bugs, but it should be ignored",
      options: {
        allows: ["it should be ignored"],
      },
    },
  ],
  invalid: [
    {
      text: "It is bugs.",
      errors: [
        {
          message: "Found bugs.",
          range: [6, 10],
        },
      ],
    },
    {
      text: `It has many bugs.

One more bugs`,
      errors: [
        {
          message: "Found bugs.",
          range: [12, 16],
        },
        {
          message: "Found bugs.",
          range: [28, 32],
        },
      ],
    },
  ],
});
