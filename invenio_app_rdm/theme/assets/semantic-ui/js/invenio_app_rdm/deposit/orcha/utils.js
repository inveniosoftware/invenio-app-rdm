export const isOrchaEnabled = (config) => Boolean(config?.orcha_enabled);

export const isSuggestionExactMatch = (field, { value }, values) => {
  const metadata = values?.metadata ?? {};
  const eq = (a, b) => (a ?? "").trim() === (b ?? "").trim();

  switch (field) {
    case "doi":
      return eq(values?.pids?.doi?.identifier?.toLowerCase(), value?.toLowerCase());
    case "description":
      return eq(metadata.description, `<p>${value}</p>`);
    case "creators": {
      const names = new Set(
        (metadata.creators ?? []).map((creator) =>
          [creator.person_or_org?.family_name, creator.person_or_org?.given_name]
            .filter(Boolean)
            .join(", ")
            .toLowerCase()
        )
      );
      return (
        Array.isArray(value) && value.every((c) => names.has(c.name.toLowerCase()))
      );
    }
    case "license":
      return (
        Array.isArray(value) &&
        value.every((l) => (metadata.rights ?? []).some((r) => r.id === l.id))
      );
    case "funding":
      return (
        Array.isArray(value) &&
        value.every((e) =>
          (metadata.funding ?? []).some(
            (f) => f.award?.id === e.award?.id && f.funder?.id === e.funder?.id
          )
        )
      );
    default:
      return eq(metadata[field], value);
  }
};
