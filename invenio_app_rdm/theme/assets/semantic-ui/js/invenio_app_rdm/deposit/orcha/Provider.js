import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { SuggestionsContext } from "./Context";

const STATUS = {
  IDLE: "idle",
  TRIGGERING: "triggering",
  STREAMING: "streaming",
  SUCCESS: "success",
  ERROR: "error",
};

const SUGGESTION_PENDING = "pending";
const SUGGESTION_APPLIED = "applied";
const SUGGESTION_DENIED = "denied";


const getDraftId = (record) => {
  const id = record?.id;
  return id && id !== "null" && id !== "undefined" ? id : null;
};

const creatorField = (creator) => ({
  person_or_org: {
    type: "personal",
    family_name: creator.name.split(", ")[0] ?? creator.name,
    given_name: creator.name.split(", ")[1] ?? "",
    identifiers: creator.orcid ? [{ identifier: creator.orcid, scheme: "orcid" }] : [],
  },
  affiliations: creator.affiliation ? [{ name: creator.affiliation }] : [],
  role: "",
});

const applyToFormik = (formik, field, value) => {
  switch (field) {
    case "creators":
      formik.setFieldValue("metadata.creators", value.map(creatorField));
      break;
    case "doi":
      formik.setFieldValue("pids.doi", {
        identifier: value,
        provider: "external",
      });
      break;
    case "description":
      formik.setFieldValue("metadata.description", `<p>${value}</p>`);
      break;
    default:
      formik.setFieldValue(`metadata.${field}`, value);
  }
};

const appendCreatorsToFormik = (formik, creators) => {
  const currentCreators = formik.values?.metadata?.creators ?? [];
  formik.setFieldValue("metadata.creators", [
    ...currentCreators,
    ...creators.map(creatorField),
  ]);
};

const appendCreatorToFormik = (formik, creator) => {
  appendCreatorsToFormik(formik, [creator]);
};

export const SuggestionsProvider = ({ children }) => {
  const [state, setState] = useState({
    status: STATUS.IDLE,
    error: null,
    suggestions: [],
    activeFileKey: null,
  });
  const eventSourceRef = useRef(null);
  const streamTimeoutIdRef = useRef(null);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (streamTimeoutIdRef.current) {
        clearTimeout(streamTimeoutIdRef.current);
        streamTimeoutIdRef.current = null;
      }
    };
  }, []);

  const closeEventSource = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const clearStreamTimeout = () => {
    if (streamTimeoutIdRef.current) {
      clearTimeout(streamTimeoutIdRef.current);
      streamTimeoutIdRef.current = null;
    }
  };

  const updateSuggestionStatus = (field, status) => {
    setState((prev) => ({
      ...prev,
      suggestions: prev.suggestions.map((s) =>
        s.field === field ? { ...s, status } : s
      ),
    }));
  };

  const removeSuggestedCreator = (index, emptyStatus) => {
    setState((prev) => ({
      ...prev,
      suggestions: prev.suggestions.map((s) => {
        if (s.field !== "creators" || !Array.isArray(s.value)) return s;

        const value = s.value.filter((_, currentIndex) => currentIndex !== index);
        return {
          ...s,
          value,
          status: value.length > 0 ? SUGGESTION_PENDING : emptyStatus,
        };
      }),
    }));
  };

  const trigger = (record, fileKey = null) => {
    if (!record) return;
    const draftId = getDraftId(record);
    if (!draftId) {
      setState((prev) => ({
        ...prev,
        status: STATUS.ERROR,
        error: i18next.t("Save the draft before extracting metadata."),
        activeFileKey: fileKey,
      }));
      return;
    }

    closeEventSource();
    clearStreamTimeout();

    setState((prev) => ({
      ...prev,
      status: STATUS.TRIGGERING,
      error: null,
      activeFileKey: fileKey,
    }));

    const requestOptions = { method: "POST" };
    if (fileKey) {
      requestOptions.headers = { "Content-Type": "application/json" };
      requestOptions.body = JSON.stringify({ fileKey });
    }

    fetch(`/uploads/${encodeURIComponent(draftId)}/orcha`, requestOptions)
      .then((res) => {
        if (!res.ok) {
          return res.text().then((body) => {
            throw new Error(body || `HTTP ${res.status}`);
          });
        }
        return res.json();
      })
      .then(({ streamUrl, workflowUrl }) => {
        setState((prev) => ({ ...prev, status: STATUS.STREAMING }));

        const source = new EventSource(streamUrl);
        eventSourceRef.current = source;

        streamTimeoutIdRef.current = setTimeout(() => {
          closeEventSource();
          setState((prev) => ({
            ...prev,
            status: STATUS.ERROR,
            error: i18next.t("Workflow timed out."),
          }));
        }, 180 * 1000);

        source.onmessage = (event) => {
          if (event.data === "ERROR") {
            clearStreamTimeout();
            closeEventSource();
            setState((prev) => ({
              ...prev,
              status: STATUS.ERROR,
              error: i18next.t("Workflow failed."),
            }));
            return;
          }

          if (event.data !== "SUCCESS") return;

          clearStreamTimeout();
          closeEventSource();

          fetch(workflowUrl)
            .then((res) => {
              if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
              }
              return res.json();
            })
            .then((workflow) => {
              const suggestions = workflow?.result?.suggestions ?? [];
              if (!Array.isArray(suggestions)) {
                throw new Error("Malformed extracted metadata result.");
              }

              setState((prev) => ({
                ...prev,
                status: STATUS.SUCCESS,
                suggestions: suggestions.map((s) => ({
                  ...s,
                  status: SUGGESTION_PENDING,
                })),
              }));
            })
            .catch(() => {
              setState((prev) => ({
                ...prev,
                status: STATUS.ERROR,
                error: i18next.t("Failed to fetch extracted metadata result."),
              }));
            });
        };
        source.onerror = () => {
          if (!eventSourceRef.current) return;
          clearStreamTimeout();
          closeEventSource();
          setState((prev) => ({
            ...prev,
            status: STATUS.ERROR,
            error: i18next.t(
              "An unexpected error occurred while streaming the workflow results."
            ),
          }));
        };
      })
      .catch((err) => {
        setState((prev) => ({
          ...prev,
          status: STATUS.ERROR,
          error: i18next.t("Failed to start workflow: {{err}}", {
            err: err.message,
          }),
        }));
      });
  };

  const apply = (formik, field, valueIndex = null) => {
    const suggestion = state.suggestions.find((s) => s.field === field);
    if (!suggestion) return;

    if (field === "creators") {
      if (valueIndex === null) {
        const creators = Array.isArray(suggestion.value) ? suggestion.value : [];
        if (creators.length === 0) return;

        appendCreatorsToFormik(formik, creators);
        updateSuggestionStatus(field, SUGGESTION_APPLIED);
        return;
      }

      const creator = Array.isArray(suggestion.value)
        ? suggestion.value[valueIndex]
        : null;
      if (!creator) return;

      appendCreatorToFormik(formik, creator);
      removeSuggestedCreator(valueIndex, SUGGESTION_APPLIED);
      return;
    }

    applyToFormik(formik, field, suggestion.value);
    updateSuggestionStatus(field, SUGGESTION_APPLIED);
  };

  const deny = (field, valueIndex = null) => {
    const suggestion = state.suggestions.find((s) => s.field === field);
    if (!suggestion) return;

    if (field === "creators") {
      const creator = Array.isArray(suggestion.value)
        ? suggestion.value[valueIndex]
        : null;
      if (!creator) return;

      removeSuggestedCreator(valueIndex, SUGGESTION_DENIED);
      return;
    }

    updateSuggestionStatus(field, SUGGESTION_DENIED);
  };

  const dismissError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  const getSuggestion = (field) => {
    return state.suggestions.find((s) => s.field === field) ?? null;
  };

  const { status, error, activeFileKey } = state;
  const value = {
    status,
    error,
    activeFileKey,
    suggestionsCount: state.suggestions.length,
    isLoading: status === STATUS.TRIGGERING || status === STATUS.STREAMING,
    trigger,
    apply,
    deny,
    getSuggestion,
    dismissError,
  };

  return (
    <SuggestionsContext.Provider value={value}>{children}</SuggestionsContext.Provider>
  );
};

SuggestionsProvider.propTypes = {
  children: PropTypes.node,
};

SuggestionsProvider.defaultProps = {
  children: null,
};
