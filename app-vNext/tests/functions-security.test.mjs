import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const functionsSource = await readFile(new URL("../../functions/index.js", import.meta.url), "utf8");

test("paid provider endpoints require a server-issued access claim", () => {
  assert.match(functionsSource, /verifiedUser\?\.easylifeAiAccess === true/);
  assert.match(functionsSource, /verifiedUser\?\.easylifeOperator === true/);
  for (const exportName of ["analyzeTaskBrainDump", "planProjectWithAi"]) {
    const start = functionsSource.indexOf(`exports.${exportName}`);
    assert.ok(start >= 0, `${exportName} export is missing`);
    const body = functionsSource.slice(start, functionsSource.indexOf("\nexports.", start + 1) > 0 ? functionsSource.indexOf("\nexports.", start + 1) : undefined);
    assert.ok(body.indexOf("hasAiProviderAccess(verifiedUser)") >= 0, `${exportName} lacks provider entitlement`);
    assert.ok(body.indexOf("hasAiProviderAccess(verifiedUser)") < body.indexOf("openAiApiKey.value()"), `${exportName} checks entitlement too late`);
  }
});

test("assistant operator phrase is backed by an operator claim before provider execution", () => {
  const gate = functionsSource.slice(functionsSource.indexOf("function getAssistantIntakeProviderBlockReason"), functionsSource.indexOf("function truncateAssistantField"));
  assert.match(gate, /verifiedUser\?\.\[assistantIntakeOperatorClaimName\] !== true/);
  assert.ok(gate.indexOf("operator-authorization-required") < gate.indexOf("operator-confirmation-missing"));
});
