<script>

  import {fetchGraphQL, startFetchMyQuery} from "$lib/api";
  /*
This is an example snippet - you should consider tailoring it
to your service.
*/



  const operationsDoc = `
  query MyQuery {
    notes {
      datetime
      id
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



  let res = startFetchMyQuery(fetchMyQuery);
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<div>
  {#await fetchMyQuery()}
    <p>...waiting</p>
  {:then data}
    <p>The number is {data.data.notes.length}</p>
    {#each data.data.notes as {datetime, text}}
      <p>
        {datetime} - {text}
      </p>
    {/each}
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</div>

