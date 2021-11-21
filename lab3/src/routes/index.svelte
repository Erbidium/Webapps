<script>

  /*
This is an example snippet - you should consider tailoring it
to your service.
*/

  async function fetchGraphQL(operationsDoc, operationName, variables) {
    const result = await fetch(
            "https://lab3todo.herokuapp.com/v1/graphql",
            {
              method: "POST",
              body: JSON.stringify({
                query: operationsDoc,
                variables: variables,
                operationName: operationName
              })
            }
    );

    return await result.json();
  }

  const operationsDoc = `
  query MyQuery {
    notes {
      author
      date
      text
    }
  }
`;

  function fetchMyQuery() {
    return fetchGraphQL(
            operationsDoc,
            "MyQuery",
            {}
    );
  }

  async function startFetchMyQuery() {
    const { errors, data } = await fetchMyQuery();

    if (errors) {
      // handle those errors like a pro
      console.error(errors);
    }

    // do something great with this precious data
    console.log(data);
  }

  startFetchMyQuery();
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<div>
  {#await fetchMyQuery()}
    <p>...waiting</p>
  {:then data}
    <p>The number is {data.data.notes.length}</p>
    {#each data.data.notes as {author, date,  text}}
      <p>
        {author} - {date} - {text}
      </p>
    {/each}
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</div>

