import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { connect as connectFormik } from "formik";
import { Button, Message } from "semantic-ui-react";
import { useSuggestions } from "./Context";
import { isSuggestionExactMatch } from "./utils";
import { i18next } from "@translations/invenio_app_rdm/i18next";

const getDraftId = (record) => {
  const id = record?.id;
  return id && id !== "null" && id !== "undefined" ? id : null;
};

export const SuggestionsButtonComponent = ({ record, currentRecord, file, formik }) => {
  const suggestions = useSuggestions();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const extractedCountRef = useRef(null);
  const fileKey = file?.name ?? null;
  const isCurrentFile = !fileKey || suggestions?.activeFileKey === fileKey;
  const isButtonLoading = Boolean(suggestions?.isLoading && isCurrentFile);

  useEffect(() => {
    if (!isButtonLoading) {
      setElapsedSeconds(0);
      return undefined;
    }

    const startedAt = Date.now();
    setElapsedSeconds(0);
    const intervalId = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isButtonLoading]);

  if (!suggestions) return null;

  const {
    isLoading,
    status,
    error,
    workflowId,
    suggestions: extracted,
    trigger,
    dismissError,
  } = suggestions;
  const draftRecord = getDraftId(currentRecord) ? currentRecord : record;
  const draftId = getDraftId(draftRecord);
  const showError = error && isCurrentFile;

  if (status === "success" && extractedCountRef.current?.workflowId !== workflowId) {
    extractedCountRef.current = {
      workflowId,
      count: (extracted ?? []).filter(
        (s) => !isSuggestionExactMatch(s.field, s, formik?.values)
      ).length,
    };
  }
  const extractedCount = extractedCountRef.current?.count ?? 0;

  const showSuggestionsCount =
    status === "success" && isCurrentFile && extractedCount > 0;
  let label = i18next.t("Extract metadata");
  if (isButtonLoading) {
    label = i18next.t("Extracting metadata... {{seconds}}s", {
      seconds: elapsedSeconds,
    });
  } else if (status === "success" && isCurrentFile) {
    label = i18next.t("Re-extract metadata");
  }

  return (
    <div className="orcha-suggestions-button">
      <Button
        type="button"
        primary
        compact
        size="mini"
        disabled={isLoading || !draftId || !fileKey}
        icon="magic"
        content={label}
        onClick={() => trigger(draftRecord, fileKey)}
      />
      {showSuggestionsCount && (
        <span className="orcha-suggestions-count ml-5">
          {i18next.t("Extracted {{count}} suggestions", {
            count: extractedCount,
          })}
        </span>
      )}
      {showError && (
        <Message negative size="mini" className="mt-5" onDismiss={dismissError}>
          {error}
        </Message>
      )}
    </div>
  );
};

SuggestionsButtonComponent.propTypes = {
  record: PropTypes.object.isRequired,
  currentRecord: PropTypes.object,
  file: PropTypes.shape({
    name: PropTypes.string,
  }),
  formik: PropTypes.object,
};

SuggestionsButtonComponent.defaultProps = {
  currentRecord: null,
  file: null,
  formik: null,
};

const mapStateToProps = (state) => ({
  currentRecord: state.deposit?.record,
});

export const SuggestionsButton = connectFormik(
  connect(mapStateToProps)(SuggestionsButtonComponent)
);
