import { getRuleChain } from "@/lib/linguistic-rules";
import type { Region, RuleChainType, RuleProgressEntry } from "@/types";

export function initializeRuleProgress(
  chainType: RuleChainType,
  region: Region,
): RuleProgressEntry[] {
  return getRuleChain(chainType, region).map((rule) => ({
    ruleId: rule.id,
    theoryComplete: false,
    practiceComplete: false,
  }));
}

export function getActiveRuleIndex(
  progress: RuleProgressEntry[],
  chainType: RuleChainType,
  region: Region,
): number {
  const rules = getRuleChain(chainType, region);
  for (let index = 0; index < rules.length; index++) {
    const entry = progress.find((item) => item.ruleId === rules[index].id);
    if (!entry?.theoryComplete || !entry?.practiceComplete) {
      return index;
    }
  }
  return rules.length - 1;
}
