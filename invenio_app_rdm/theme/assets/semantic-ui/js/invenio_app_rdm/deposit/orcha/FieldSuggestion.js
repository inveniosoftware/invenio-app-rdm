import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { connect as connectFormik } from "formik";
import { Button, Form, Icon, Message, TextArea } from "semantic-ui-react";
import { useSuggestions } from "./Context";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { makeIcon } from "../../utils";

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
  <Button.Group size="mini" compact className="orcha-suggestion-actions">
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

const FieldSuggestionComponent = ({ field, formik = null }) => {
  const suggestions = useSuggestions();
  const [feedbackState, setFeedbackState] = useState(null);
  const [comment, setComment] = useState("");
  const suggestionRef = useRef(null);

  if (!suggestions) return null;
  if (!formik) return null;

  const { getSuggestion, apply, deny, sendFeedback } = suggestions;
  const suggestion = getSuggestion(field);

  if (!suggestion) return null;

  if (suggestionRef.current !== suggestion) {
    suggestionRef.current = suggestion;
    if (suggestion.status === "pending") {
      if (feedbackState !== null) setFeedbackState(null);
      if (comment !== "") setComment("");
    }
  }

  const isCreatorsSuggestion = field === "creators" && Array.isArray(suggestion.value);

  if (suggestion.status === "applied" && feedbackState !== "shown") {
    return null;
  }

  if (suggestion.status === "denied" && feedbackState !== "shown") {
    return null;
  }

  const handleApply = () => {
    apply(formik, field);
    setFeedbackState("shown");
  };

  const handleDeny = () => {
    deny(field);
    setFeedbackState("shown");
  };

  const handleApplyAll = () => {
    apply(formik, field);
    setFeedbackState("shown");
  };

  const handleCreatorAction = (index, isApply) => {
    const creatorCount = Array.isArray(suggestion.value) ? suggestion.value.length : 0;
    const isLastCreator = creatorCount <= 1;

    if (isApply) {
      apply(formik, field, index);
    } else {
      deny(field, index);
    }

    if (isLastCreator) {
      setFeedbackState("shown");
    }
  };

  const handleSubmitFeedback = (rating) => {
    sendFeedback(field, rating, comment.trim() || null);
    setFeedbackState("submitted");
  };

  if (feedbackState === "submitted") {
    return null;
  }

  if (feedbackState === "shown") {
    return (
      <Message size="tiny" className="orcha-field-suggestion feedback">
        <Message.Content>
          <Message.Header>
            <Icon name="lightbulb outline" />
            {i18next.t("Was this suggestion helpful?")}
          </Message.Header>
          <div className="orcha-suggestion-row">
            <div className="orcha-suggestion-value">
              <Form.Field
                className="orcha-feedback-comment"
                control={TextArea}
                placeholder={i18next.t("Optional feedback...")}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <Button.Group size="mini" compact className="orcha-suggestion-actions">
              <Button
                type="button"
                positive
                icon="thumbs up"
                content={i18next.t("Yes")}
                onClick={() => handleSubmitFeedback("positive")}
              />
              <Button
                type="button"
                negative
                icon="thumbs down"
                content={i18next.t("No")}
                onClick={() => handleSubmitFeedback("negative")}
              />
            </Button.Group>
          </div>
        </Message.Content>
      </Message>
    );
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
              onClick={handleApplyAll}
              className="ml-30"
            />
          )}
        </Message.Header>
        {isCreatorsSuggestion ? (
          renderSuggestedCreators(
            suggestion.value,
            (index) => handleCreatorAction(index, true),
            (index) => handleCreatorAction(index, false)
          )
        ) : (
          <div className="orcha-suggestion-row">
            <div className="orcha-suggestion-value">
              {renderSuggestedValue(field, suggestion.value)}
            </div>
            {renderSuggestionActions(handleApply, handleDeny)}
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

export const FieldSuggestion = connectFormik(FieldSuggestionComponent);
