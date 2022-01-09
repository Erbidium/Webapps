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
      returning {
				date
				id
				name
				text
			}
    }
  }
  query getDataQuery {
    notes(order_by: {date: desc, time: desc}) {
      date
			id
			name
			text
    }
  }
  mutation deleteNote($_eq: uuid) {
    delete_notes(where: {id: {_eq: $_eq}}) {
      returning {
				date
				id
				name
				text
			}
    }
  }
  mutation createNote($name: String = "", $text: String = "") {
		insert_notes(objects: {name: $name, text: $text}) {
			returning {
				date
				id
				name
				text
			}
		}
	}
`;

export function doQuery(operationName, variables) {
	return fetchGraphQL(operationsDoc, operationName, variables);
}
