import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Button, Message } from "semantic-ui-react";
import { useSuggestions } from "./Context";
import { i18next } from "@translations/invenio_app_rdm/i18next";

const getDraftId = (record) => {
  const id = record?.id;
  return id && id !== "null" && id !== "undefined" ? id : null;
};

export const SuggestionsButtonComponent = ({ record, currentRecord, file }) => {
  const suggestions = useSuggestions();

  if (!suggestions) return null;

  const {
    isLoading,
    status,
    error,
    activeFileKey,
    suggestionsCount,
    trigger,
    dismissError,
  } = suggestions;
  const draftRecord = getDraftId(currentRecord) ? currentRecord : record;
  const draftId = getDraftId(draftRecord);
  const fileKey = file?.name ?? null;
  const isCurrentFile = !fileKey || activeFileKey === fileKey;
  const isButtonLoading = isLoading && isCurrentFile;
  const showError = error && isCurrentFile;
  const showSuggestionsCount = status === "success" && isCurrentFile;
  let label = i18next.t("Extract metadata");
  if (isButtonLoading) {
    label = i18next.t("Extracting metadata...");
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
        loading={isButtonLoading}
        disabled={isLoading || !draftId || !fileKey}
        icon="magic"
        content={label}
        onClick={() => trigger(draftRecord, fileKey)}
      />
      {showSuggestionsCount && (
        <span className="orcha-suggestions-count ml-5">
          {i18next.t("Extracted {{count}} suggestions", {
            count: suggestionsCount,
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
};

SuggestionsButtonComponent.defaultProps = {
  currentRecord: null,
  file: null,
};

const mapStateToProps = (state) => ({
  currentRecord: state.deposit?.record,
});

export const SuggestionsButton = connect(mapStateToProps)(SuggestionsButtonComponent);
