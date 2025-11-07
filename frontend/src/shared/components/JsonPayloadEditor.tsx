import { useTheme } from '@mui/material';
import { githubDarkTheme, githubLightTheme, JsonEditor } from 'json-edit-react';
import { IJsonPayloadEditorProps } from '../ts/interfaces';
import { mergeFieldsEnum } from '../ts/states';

export const JsonPayloadEditor = ({
  data,
  setData,
  collapse = true,
}: IJsonPayloadEditorProps) => {
  const theme = useTheme();
  return (
    <JsonEditor
      theme={
        theme.palette.mode === 'dark'
          ? [
              githubDarkTheme,
              {
                styles: {
                  container: {
                    display: 'flex',
                    width: '100%',
                    maxWidth: '100%',
                  },
                },
              },
            ]
          : [
              githubLightTheme,
              {
                styles: {
                  container: {
                    display: 'flex',
                    width: '100%',
                    maxWidth: '100%',
                  },
                },
              },
            ]
      }
      collapse={collapse}
      data={data}
      setData={setData}
      rootName="payload"
      restrictTypeSelection={[
        {
          enum: 'merge',
          values: mergeFieldsEnum,
          matchPriority: 1,
        },
        'string',
        'number',
        'boolean',
        'array',
        'object',
      ]}
    ></JsonEditor>
  );
};
