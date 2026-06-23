import React from "react";
import PropTypes from "prop-types";
import { connect as connectFormik } from "formik";
import { Button, Icon, Message } from "semantic-ui-react";
import { useSuggestions } from "./Context";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { makeIcon } from "../../utils";

// This is the mapping for suggestion feild translation
const suggestedFieldLabels = {
  doi: "DOI",
  title: "Title",
  publication_date: "Publication date",
  creators: "Authors/Creators",
  description: "Description",
};

const renderAuthor = (author) => (
  <>
    {author.orcid && <span>{makeIcon("orcid", author.orcid, author.name)} </span>}
    <strong> {author.name}</strong>
    {author.affiliation && <span> {author.affiliation}</span>}
  </>
);

const renderSuggestionActions = (onApply, onDeny) => (
  <Button.Group size="mini" className="orcha-suggestion-actions">
    <Button
      type="button"
      positive
      icon="check"
      content={i18next.t("Apply")}
      onClick={onApply}
    />
    <Button
      type="button"
      negative
      icon="times"
      aria-label={i18next.t("Deny")}
      onClick={onDeny}
    />
  </Button.Group>
);

const renderSuggestedCreators = (value, onApply, onDeny) => {
  return (
    <ul className="orcha-suggestion-list">
      {value.map((author, index) => (
        <li key={author.orcid ?? `${index}-${author.name}`}>
          <span className="orcha-suggestion-value">{renderAuthor(author)}</span>
          {renderSuggestionActions(
            () => onApply(index),
            () => onDeny(index)
          )}
        </li>
      ))}
    </ul>
  );
};

const renderSuggestedValue = (field, value) => {
  if (field === "creators" && Array.isArray(value)) {
    return (
      <ul className="orcha-suggestion-list">
        {value.map((author, index) => (
          <li key={author.orcid ?? `${index}-${author.name}`}>
            {renderAuthor(author)}
          </li>
        ))}
      </ul>
    );
  }
  return <span>{value}</span>;
};

const FieldSuggestionComponent = ({ field, formik }) => {
  const suggestions = useSuggestions();

  if (!suggestions) return null;
  if (!formik) return null;

  const { getSuggestion, apply, deny } = suggestions;
  const suggestion = getSuggestion(field);

  if (!suggestion) return null;

  const isCreatorsSuggestion = field === "creators" && Array.isArray(suggestion.value);

  if (suggestion.status === "applied") {
    return null;
  }

  if (suggestion.status === "denied") {
    return null;
  }

  return (
    <Message size="tiny" info className="orcha-field-suggestion">
      <Message.Content>
        <Message.Header>
          <Icon name="lightbulb outline" />
          {i18next.t("Suggested {{field}}", {
            field: suggestedFieldLabels[field] ?? "Value",
            interpolation: { escapeValue: false },
          })}
          {isCreatorsSuggestion && (
            <Button
              type="button"
              positive
              compact
              size="mini"
              icon="check"
              content={i18next.t("Apply all authors")}
              onClick={() => apply(formik, field)}
              className="ml-30"
            />
          )}
        </Message.Header>
        {isCreatorsSuggestion ? (
          renderSuggestedCreators(
            suggestion.value,
            (index) => apply(formik, field, index),
            (index) => deny(field, index)
          )
        ) : (
          <div className="orcha-suggestion-row">
            <div className="orcha-suggestion-value">
              {renderSuggestedValue(field, suggestion.value)}
            </div>
            {renderSuggestionActions(
              () => apply(formik, field),
              () => deny(field)
            )}
          </div>
        )}
      </Message.Content>
    </Message>
  );
};

FieldSuggestionComponent.propTypes = {
  field: PropTypes.string.isRequired,
  formik: PropTypes.object,
};

FieldSuggestionComponent.defaultProps = {
  formik: null,
};

export const FieldSuggestion = connectFormik(FieldSuggestionComponent);
