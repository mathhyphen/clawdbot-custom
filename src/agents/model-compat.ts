import type { Api, Model } from "@mariozechner/pi-ai";

function isOpenAiCompletionsModel(model: Model<Api>): model is Model<"openai-completions"> {
  return model.api === "openai-completions";
}

export function normalizeModelCompat(model: Model<Api>): Model<Api> {
  const baseUrl = model.baseUrl ?? "";
  const isZai = model.provider === "zai" || baseUrl.includes("api.z.ai");
  
  if (!isOpenAiCompletionsModel(model)) return model;

  const openaiModel = model as Model<"openai-completions">;
  const compat = openaiModel.compat ?? undefined;

  // If already explicitly set to false, respect it and stop.
  if (compat?.supportsDeveloperRole === false) return model;

  // Force false for Z.ai models.
  if (isZai) {
    openaiModel.compat = compat
      ? { ...compat, supportsDeveloperRole: false }
      : { supportsDeveloperRole: false };
  }

  return openaiModel;
}
