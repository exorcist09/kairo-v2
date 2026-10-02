import type { NodeExecutor } from "./node_context.schema";
import type { GoogleFormNodeData } from "./node-data.types";

export const executeGoogleform: NodeExecutor = async (
  node,
  context,
) => {
  /*
    Example node.data:

    {
      formUrl: "https://docs.google.com/forms/d/e/...",
      formId: "abc123",

      fields: [
        {
          questionId: "question-1",
          title: "Name",
          type: "TEXT"
        },
        {
          questionId: "question-2",
          title: "Gender",
          type: "MULTIPLE_CHOICE",
          options: ["Male", "Female"]
        }
      ],

      values: {
        "question-1": "Adarsh",
        "question-2": "Male"
      }
    }
  */

  const data = node.data as GoogleFormNodeData;

  if (!data.formUrl) {
    throw new Error(
      "Google Form node requires a form URL",
    );
  }

  /*
    Find the node connected INTO this Google Form.

    Example:

    Input
      ↓
    Google Form

    The connection tells us which previous
    node's result we should use.
  */

  const connection = context.connections.find(
    (connection) =>
      connection.toNodeId === node.id,
  );

  /*
    There might be no incoming node.

    That's okay if the user configured
    the form manually.
  */

  let previousResult: unknown = undefined;

  if (connection) {
    previousResult =
      context.results[connection.fromNodeId];
  }

  /*
    Start with values manually configured
    in the Google Form node.
  */

  const values = {
    ...(data.values ?? {}),
  };

  /*
    If a previous node produced data,
    use that data to fill matching fields.

    Example previous result:

    {
      name: "Adarsh",
      email: "adarsh@example.com"
    }

    This part will eventually use your
    variable/mapping system to map:

    name  → Name question
    email → Email question
  */

  if (
    previousResult &&
    typeof previousResult === "object" &&
    !Array.isArray(previousResult)
  ) {
    const previousData =
      previousResult as Record<string, unknown>;

    for (const field of data.fields) {
      /*
        This is a simple first version.

        It assumes the question title matches
        a property from the previous node.

        Example:

        Google Form question:
        "name"

        Previous result:
        {
          name: "Adarsh"
        }

        Later we can replace this with an
        explicit mapping system.
      */

      if (
        values[field.questionId] === undefined &&
        previousData[field.title] !== undefined
      ) {
        values[field.questionId] =
          previousData[field.title];
      }
    }
  }

  /*
    At this point `values` contains the data
    that should be submitted.

    Example:

    {
      "question-1": "Adarsh",
      "question-2": "Male"
    }
  */

  /*
    TODO:
    Submit these values to Google Forms.

    The exact submission mechanism depends
    on how the form was obtained and whether
    it is a public/published form or a form
    accessible through the user's Google account.

    Do not blindly POST to Google's internal
    formResponse endpoint as the permanent
    implementation.
  */

  return {
    formUrl: data.formUrl,
    formId: data.formId,
    values,
  };
};