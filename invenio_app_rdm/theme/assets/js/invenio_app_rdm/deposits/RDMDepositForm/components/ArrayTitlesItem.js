import React, { Component } from 'react';

import { TextField } from "../../../../react_invenio_forms";

export function ArrayTitlesItem(invenioArrayBag) {
    const { key } = invenioArrayBag;
    return <TextField fluid fieldPath={`${key}.title`} />;
    //TODO: Add <SelectField options={[Main, alternative,...]}/> <SelectField options={languages} />
}
