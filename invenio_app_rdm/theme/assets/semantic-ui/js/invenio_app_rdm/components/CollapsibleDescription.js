/**
 * CollapsibleDescription
 *
 * This component will expand and collapse the record description.
 *
 * Props:
 * - descriptionStripped: string or node containing the record description
 */
import React, { useState } from "react";
import PropTypes from "prop-types";
import { Item, Icon } from "semantic-ui-react";
import classNames from "classnames";

const CollapsibleDescription = ({ descriptionStripped }) => {
  const [open, setOpen] = useState(false);

  if (!descriptionStripped) return null;

  return (
    <>
      <Item.Description
        className={classNames({
          "truncate-lines-2": !open,
        })}
      >
        {descriptionStripped}
      </Item.Description>
      
      <div
        tabIndex={0} 
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          justifyContent: "center",
          cursor: "pointer",
          marginTop: "0.25rem",
        }}
        aria-label={open ? "Collapse description" : "Expand description"}
        role="button"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setOpen((v) => !v);
            e.preventDefault();
          }
        }}      
      >
        <Icon
            name={open ? "angle up" : "angle down"}
            size="large"
            style={{ color: "#0377cd" }}
          
        />
      </div>
    </>
  );
};

CollapsibleDescription.propTypes = {
  descriptionStripped: PropTypes.node,
};