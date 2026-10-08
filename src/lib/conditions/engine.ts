import { DynamicField, FieldCondition, DocumentRequirement } from "@/types/builder";
import { normalizeDocumentCategory } from "@/src/data/documents/registry";

export function evaluateCondition(condition: FieldCondition, values: Record<string, any>): boolean {
  const actual = values[condition.fieldId];

  switch (condition.operator) {
    case 'IS_NOT_EMPTY':
      return actual !== undefined && actual !== null && String(actual).trim() !== '';
    case 'EQUALS':
      return String(actual ?? '').trim() === String(condition.value ?? '').trim();
    case 'NOT_EQUALS':
      return String(actual ?? '').trim() !== String(condition.value ?? '').trim();
    case 'GREATER_THAN': {
      const numActual = Number(actual);
      const numExpected = Number(condition.value);
      return !isNaN(numActual) && !isNaN(numExpected) && numActual > numExpected;
    }
    case 'LESS_THAN': {
      const numActual = Number(actual);
      const numExpected = Number(condition.value);
      return !isNaN(numActual) && !isNaN(numExpected) && numActual < numExpected;
    }
    default:
      return true;
  }
}

export function isFieldVisible(field: DynamicField, values: Record<string, any>): boolean {
  if (!field.visibilityRule || !field.visibilityRule.conditions || field.visibilityRule.conditions.length === 0) {
    return true;
  }

  // Filter out any self-referencing condition (e.g. field depending on its own answer), which creates impossible chicken-and-egg loops
  const validConditions = field.visibilityRule.conditions.filter((cond) => cond.fieldId !== field.id);
  if (validConditions.length === 0) {
    return true;
  }

  const { matchType } = field.visibilityRule;
  if (matchType === 'ANY') {
    return validConditions.some((cond) => evaluateCondition(cond, values));
  }
  // Default to ALL
  return validConditions.every((cond) => evaluateCondition(cond, values));
}

export function isDocumentRequiredForCategory(
  doc: DocumentRequirement,
  category: string
): boolean {
  if (!doc.categoryTrigger || doc.categoryTrigger === 'ALL') {
    return true;
  }
  return (
    normalizeDocumentCategory(doc.categoryTrigger) ===
    normalizeDocumentCategory(category)
  );
}
