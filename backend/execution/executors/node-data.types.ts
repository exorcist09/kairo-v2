export type InputNodeData = {
  prompt: string;
};

export type BrowserNodeData = {
  urlForm: string;
};


export type HttpRequestData = {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: Record<string, any>;
};


export type OpenAINodeData = {
  credentialId: string;
  model: string;
  prompt: string;
  temperature?: number;
};


export type GeminiNodeData = {
  credentialId: string;
  model: string;
  prompt: string;
};


export type ClaudeNodeData = {
  credentialId: string;
  model: string;
  prompt: string;
};

export type EmailNodeData = {
  credentialId: string;
  from: string;
  to: string;
  subject?: string;
  body?: string;
};


export type GoogleFormNodeData = {
  // URL pasted by the user.
  formUrl: string;

  // Extracted/stored form ID.
  formId: string;

  // Questions fetched from the form.
  fields: {
    questionId: string;
    title: string;
    type: string;
    options?: string[];
  }[];

  // Values manually entered by the user.
  //
  // Example:
  // {
  //   "question-id-1": "Adarsh",
  //   "question-id-2": "India"
  // }
  values?: Record<string, unknown>;
};


export type PostgresNodeData = {
  credentialId: string;

  query: string;
};