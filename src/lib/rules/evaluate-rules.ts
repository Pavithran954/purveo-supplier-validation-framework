import type { Supplier, ValidationRule } from "@/src/types";

export function evaluateRules(supplier: Supplier, rules: ValidationRule[]): ValidationRule[] {
  return rules.filter((rule) => {
    if (!rule.enabled) return false;
    const actualValue = supplier.fieldValues[rule.condition.field];
    const expectedValue = rule.condition.value;

    switch (rule.condition.operator) {
      case "equals":
        return actualValue === expectedValue;
      case "not_equals":
        return actualValue !== expectedValue;
      case "greater_than":
        return Number(actualValue) > Number(expectedValue);
      case "less_than":
        return Number(actualValue) < Number(expectedValue);
      case "contains":
        return String(actualValue).toLowerCase().includes(String(expectedValue).toLowerCase());
      default:
        return false;
    }
  });
}
