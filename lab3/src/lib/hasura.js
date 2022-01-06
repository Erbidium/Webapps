async function fetchGraphQL(operationsDoc, operationName, variables) {
	const result = await fetch(import.meta.env.VITE_API_HTTPS_ENDPOINT, {
		headers: {
			'content-type': 'application/json',
			'x-hasura-admin-secret': import.meta.env.VITE_HASURA_ADMIN,
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
				author
				date
				id
				text
    	}
    }
  }
  query getDataQuery {
    notes {
      author
      date
      text
      id
    }
  }
  mutation deleteNote($_eq: uuid) {
    delete_notes(where: {id: {_eq: $_eq}}) {
      returning {
				author
				date
				id
				text
    	}
    }
  }
  mutation createNote($date: date = "", $author: String = "", $text: String = "") {
    insert_notes(objects: {author: $author, date: $date, text: $text}){
      returning {
				author
				date
				id
				text
    	}
    }
  }
`;

export function doQuery(operationName, variables) {
	return fetchGraphQL(operationsDoc, operationName, variables);
}
