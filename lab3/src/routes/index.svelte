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

    return result.json();
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
    <p>Totally notes: {data.data.notes.length}</p>
    <ul>
      {#each data.data.notes as {author, date,  text}}
        <li>
          <a href="#" class="note">
            <h2><strong>Note</strong></h2>
            <p><strong>Author: {author}</strong></p>
            <p><strong>{text}</strong></p>
            <p><strong>Date: {date}</strong></p>
          </a>
        </li>
      {/each}
    </ul>
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</div>
