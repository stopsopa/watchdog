
import React, { useEffect, useState, useRef } from 'react';

import { v4 as uuidv4 } from 'uuid';

import log from 'inspc';

import './AceEditor.scss'

// https://github.com/securingsincity/react-ace/blob/master/docs/Ace.md
import AceEditor from "react-ace";

// import "ace-builds/src-noconflict/mode-jsx";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-batchfile";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools"

export const modes = {
  'python': 'ace/mode/python',
  'javascript': 'ace/mode/javascript',
  'json': 'ace/mode/json',
};

(function () {

  // https://github.com/ajaxorg/ace-builds/issues/129#issuecomment-406783352

  // http://localhost:1046/public/ace-builds/src-min-noconflict/ace.js
  const BASE = '/public/ace-builds/src-min-noconflict';
  ace.config.set('basePath', BASE);
  ace.config.set('basePath', BASE);
  ace.config.set('modePath', BASE);
  ace.config.set('themePath', BASE);
  ace.config.set('workerPath', BASE);
}());

export default props => {

  const {
    mode = 'javascript',
  } = props;

  const [ uuid, setUuid ] = useState(false);

  const ace = useRef(null);

  useEffect(() => {

    const uuid = uuidv4();

    setUuid(uuid);
  }, []);

  if ( ! uuid ) {

    return null;
  }

  return (
    <div className="ace-component-wrapper">
      <div className="ace-syntax">syntax: {mode}</div>
      <AceEditor
        ref={ace}
        mode={mode}
        theme="monokai"
        name={uuid}
        // onLoad={this.onLoad}
        // onChange={(value, event) => console.log(value)} // https://github.com/securingsincity/react-ace/blob/master/docs/Ace.md#available-props
        fontSize={12}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        width="auto"
        maxLines={Infinity}
        // value={`console.log('hello world');`}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 2,
          minLines: 15
        }}
        editorProps={{
          $blockScrolling: Infinity
        }}
        {...props}
      />
    </div>
  )
}