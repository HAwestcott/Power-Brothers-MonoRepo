import { InvocationContext } from "@azure/functions";

export function getLogger(context: InvocationContext): InvocationContext {
  return context;
}
