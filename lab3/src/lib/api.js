export async function fetchGraphQL(operationsDoc, operationName, variables) {
	const result = await fetch('https://lab3todo.herokuapp.com/v1/graphql', {
		method: 'POST',
		body: JSON.stringify({
			query: operationsDoc,
			variables: variables,
			operationName: operationName,
		}),
	});

	return await result.json();
}
export async function startFetchMyQuery(fetchMyQuery) {
	const { errors, data } = await fetchMyQuery();

	if (errors) {
		// handle those errors like a pro
		console.error(errors);
	}

	// do something great with this precious data
	console.log(data);
}
