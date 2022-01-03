import { get } from 'svelte/store';
import { token } from '../store.js';
async function fetchGraphQL(operationsDoc, operationName, variables) {
	const result = await fetch(import.meta.env.VITE_API_HTTPS_ENDPOINT, {
		headers: {
			'content-type': 'application/json',
			Authorization: `Bearer ${get(token)}`,
		},
		method: 'POST',
		body: JSON.stringify({
			query: operationsDoc,
			variables: variables,
			operationName: operationName,
		}),
	});
	return result.json();
}

const operationsDoc = `
  mutation deleteAllMutation {
    delete_notes(where: {}) {
      affected_rows
    }
  }
  query getDataQuery {
    notes {
      text
			userId
			id
			date
			name
    }
  }
  mutation deleteNote($_eq: uuid) {
    delete_notes(where: {id: {_eq: $_eq}}) {
      affected_rows
    }
  }
  mutation createNote($name: String = "", $text: String = "", $userId: String = "") {
  insert_notes(objects: {name: $name, text: $text, userId: $userId}) {
    affected_rows
  }
}
`;

export function doQuery(operationName, variables) {
	return fetchGraphQL(operationsDoc, operationName, variables);
}
